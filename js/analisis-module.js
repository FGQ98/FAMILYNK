/**
 * FAMILYNK - Módulo de Análisis
 * 
 * Incluye:
 * - Toggle de tracking con selector de duración
 * - Dashboard de métricas (para admin-rama y admin-sistema)
 * - Cálculo de medias comparativas entre familias
 * 
 * USO:
 * 1. Incluir este archivo: <script src="js/analisis-module.js"></script>
 * 2. Llamar a AnalisisModule.init(config) con la configuración apropiada
 */

const AnalisisModule = {
  
  // Configuración
  config: {
    modo: 'rama',           // 'rama' (admin-rama) o 'sistema' (admin-sistema)
    familiaId: null,        // ID de la familia a mostrar
    containerId: null,      // ID del contenedor del dashboard
    mostrarComparativas: false,  // Mostrar medias de otras familias
    debug: false
  },

  // Datos cargados
  data: {
    familia: null,
    eventos: [],
    mediasGlobales: null,
    totalMiembros: 0
  },

  /**
   * Inicializar el módulo
   */
  async init(config = {}) {
    Object.assign(this.config, config);
    
    if (this.config.debug) {
      console.log('[Análisis] Inicializando con config:', this.config);
    }
  },

  // ============================================================
  // TOGGLE DE TRACKING CON DURACIÓN
  // ============================================================

  /**
   * Renderizar el control de tracking con selector de duración
   * @param {string} containerId - ID del contenedor donde renderizar
   * @param {object} familia - Datos de la familia
   */
  renderTrackingControl(containerId, familia) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const activo = familia.trackingActivo === true;
    const hasta = familia.trackingHasta ? this.formatearFecha(familia.trackingHasta) : null;
    const expirado = familia.trackingExpirado === true;

    container.innerHTML = `
      <div class="tracking-control">
        <div class="tracking-header">
          <span class="tracking-icon">📊</span>
          <span class="tracking-title">Análisis de uso</span>
        </div>
        
        <div class="tracking-body">
          ${activo ? `
            <div class="tracking-activo">
              <span class="tracking-badge activo">● Activo</span>
              ${hasta ? `<span class="tracking-hasta">hasta ${hasta}</span>` : ''}
              <button class="btn-desactivar" onclick="AnalisisModule.desactivarTracking('${familia.id}')">
                Desactivar
              </button>
            </div>
          ` : `
            <div class="tracking-inactivo">
              <span class="tracking-badge inactivo">○ Inactivo</span>
              ${expirado ? `<span class="tracking-expirado">Expiró el período anterior</span>` : ''}
              
              <div class="tracking-activar">
                <label>Activar durante:</label>
                <select id="tracking-duracion-${familia.id}" class="tracking-select">
                  <option value="7">1 semana</option>
                  <option value="30" selected>1 mes</option>
                  <option value="90">3 meses</option>
                </select>
                <button class="btn-activar" onclick="AnalisisModule.activarTracking('${familia.id}')">
                  Activar
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  },

  /**
   * Activar tracking para una familia
   */
  async activarTracking(familiaId) {
    const selectEl = document.getElementById(`tracking-duracion-${familiaId}`);
    const dias = parseInt(selectEl?.value || '30');
    
    const hasta = new Date();
    hasta.setDate(hasta.getDate() + dias);

    try {
      await db.collection('familias').doc(familiaId).update({
        trackingActivo: true,
        trackingDesde: firebase.firestore.FieldValue.serverTimestamp(),
        trackingHasta: firebase.firestore.Timestamp.fromDate(hasta),
        trackingDuracionDias: dias,
        trackingExpirado: false,
        trackingModificadoPor: firebase.auth().currentUser?.uid || null
      });

      alert(`✅ Tracking activado por ${dias} días`);
      location.reload();

    } catch (error) {
      console.error('Error activando tracking:', error);
      alert('Error: ' + error.message);
    }
  },

  /**
   * Desactivar tracking para una familia
   */
  async desactivarTracking(familiaId) {
    if (!confirm('¿Desactivar el tracking para esta familia?')) return;

    try {
      await db.collection('familias').doc(familiaId).update({
        trackingActivo: false,
        trackingModificadoPor: firebase.auth().currentUser?.uid || null
      });

      alert('Tracking desactivado');
      location.reload();

    } catch (error) {
      console.error('Error desactivando tracking:', error);
      alert('Error: ' + error.message);
    }
  },

  // ============================================================
  // DASHBOARD DE ANÁLISIS
  // ============================================================

  /**
   * Renderizar dashboard completo de análisis
   * @param {string} containerId - ID del contenedor
   * @param {string} familiaId - ID de la familia
   * @param {boolean} mostrarComparativas - Si mostrar medias de otras familias
   */
  async renderDashboard(containerId, familiaId, mostrarComparativas = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="analisis-loading">Cargando análisis...</div>';

    try {
      // Cargar datos
      await this.cargarDatosFamilia(familiaId);
      
      // Cargar medias si es necesario
      if (mostrarComparativas) {
        await this.cargarMediasGlobales(familiaId);
      }

      // Renderizar
      container.innerHTML = this.generarHTMLDashboard(mostrarComparativas);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      container.innerHTML = `<div class="analisis-error">Error cargando datos: ${error.message}</div>`;
    }
  },

  /**
   * Cargar datos de una familia
   */
  async cargarDatosFamilia(familiaId) {
    // Familia
    const familiaDoc = await db.collection('familias').doc(familiaId).get();
    this.data.familia = familiaDoc.exists ? { id: familiaDoc.id, ...familiaDoc.data() } : null;

    // Nidos y miembros
    const nidosSnap = await db.collection('nidos')
      .where('familiaId', '==', familiaId)
      .get();

    let totalMiembros = 0;
    nidosSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.miembrosData) totalMiembros += data.miembrosData.length;
    });
    this.data.totalMiembros = totalMiembros;

    // Eventos (últimos 30 días)
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);

    try {
      const eventosSnap = await db.collection('eventos_uso')
        .where('ramaId', '==', familiaId)
        .where('timestamp', '>=', hace30dias)
        .get();

      this.data.eventos = eventosSnap.docs.map(d => d.data());
    } catch (e) {
      console.warn('Sin datos de tracking:', e);
      this.data.eventos = [];
    }
  },

  /**
   * Cargar medias globales de todas las familias (excluyendo la actual)
   */
  async cargarMediasGlobales(excluirFamiliaId) {
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);

    try {
      // Obtener todas las familias con tracking activo
      const familiasSnap = await db.collection('familias')
        .where('trackingActivo', '==', true)
        .get();

      const familiasIds = familiasSnap.docs
        .map(d => d.id)
        .filter(id => id !== excluirFamiliaId);

      if (familiasIds.length === 0) {
        this.data.mediasGlobales = null;
        return;
      }

      // Cargar eventos de todas las familias
      // NOTA: Firestore no permite 'in' con más de 10 valores, 
      // así que agrupamos en batches si hay muchas familias
      let todosEventos = [];
      const batches = this.chunkArray(familiasIds, 10);

      for (const batch of batches) {
        const snap = await db.collection('eventos_uso')
          .where('ramaId', 'in', batch)
          .where('timestamp', '>=', hace30dias)
          .get();
        todosEventos = todosEventos.concat(snap.docs.map(d => d.data()));
      }

      // Calcular medias
      this.data.mediasGlobales = this.calcularMedias(todosEventos, familiasIds.length);

    } catch (error) {
      console.warn('Error cargando medias globales:', error);
      this.data.mediasGlobales = null;
    }
  },

  /**
   * Calcular métricas medias
   */
  calcularMedias(eventos, numFamilias) {
    if (numFamilias === 0) return null;

    const total = eventos.length;
    
    // Acciones por tipo
    const completados = eventos.filter(e => e.accion === 'completar').length;
    const abandonados = eventos.filter(e => e.accion === 'abandonar').length;
    const consultas = eventos.filter(e => e.accion === 'consultar').length;

    // Proactividad
    const directos = eventos.filter(e => e.origen === 'directo').length;
    const notificaciones = eventos.filter(e => e.origen === 'notificacion').length;
    const totalOrigen = directos + notificaciones;

    return {
      accionesPorFamilia: Math.round(total / numFamilias),
      completadosPorFamilia: Math.round(completados / numFamilias),
      tasaAbandono: totalOrigen > 0 ? Math.round((abandonados / (completados + abandonados)) * 100) : 0,
      proactividad: totalOrigen > 0 ? Math.round((directos / totalOrigen) * 100) : 50,
      numFamilias: numFamilias
    };
  },

  /**
   * Generar HTML del dashboard
   */
  generarHTMLDashboard(mostrarComparativas) {
    const eventos = this.data.eventos;
    const medias = this.data.mediasGlobales;
    const totalMiembros = this.data.totalMiembros;

    // Calcular métricas de esta familia
    const metricas = this.calcularMetricasFamilia(eventos, totalMiembros);

    return `
      <div class="analisis-dashboard">
        
        <!-- Stats principales -->
        <div class="stats-grid">
          ${this.renderStatCard('Acciones', metricas.totalAcciones, '30d', 
            mostrarComparativas && medias ? medias.accionesPorFamilia : null)}
          ${this.renderStatCard('Usuarios activos', metricas.usuariosActivos, '', null)}
          ${this.renderStatCard('CTAs completados', metricas.completados, '',
            mostrarComparativas && medias ? medias.completadosPorFamilia : null)}
          ${this.renderStatCard('Tasa abandono', metricas.tasaAbandono + '%', '',
            mostrarComparativas && medias ? medias.tasaAbandono + '%' : null, true)}
        </div>

        <!-- Arquetipos -->
        <div class="metrica-card">
          <div class="metrica-header">
            <span class="metrica-title">🎭 Arquetipos de participación</span>
          </div>
          <div class="arquetipos-grid">
            ${this.renderArquetipo('🚀', 'Capitanes', metricas.arquetipos.capitanes, 'Crean y lideran')}
            ${this.renderArquetipo('⚓', 'Tripulantes', metricas.arquetipos.tripulantes, 'Responden activamente')}
            ${this.renderArquetipo('👀', 'Polizones', metricas.arquetipos.polizones, 'Miran pero no tocan')}
            ${this.renderArquetipo('🏝️', 'Náufragos', metricas.arquetipos.naufragos, 'Sin actividad')}
          </div>
        </div>

        <!-- Proactividad -->
        <div class="metrica-card">
          <div class="metrica-header">
            <span class="metrica-title">⚡ Proactividad</span>
            ${mostrarComparativas && medias ? `
              <span class="comparativa">Media: ${medias.proactividad}%</span>
            ` : ''}
          </div>
          <div class="gauge-container">
            <div class="gauge-bar-container">
              <div class="gauge-bar">
                <div class="gauge-marker" style="left: ${metricas.proactividad}%"></div>
                ${mostrarComparativas && medias ? `
                  <div class="gauge-marker media" style="left: ${medias.proactividad}%" title="Media: ${medias.proactividad}%"></div>
                ` : ''}
              </div>
              <div class="gauge-labels">
                <span>Reactivo</span>
                <span>Proactivo</span>
              </div>
            </div>
            <div class="gauge-value">${metricas.proactividad}%</div>
          </div>
        </div>

        <!-- Secciones más visitadas -->
        <div class="metrica-card">
          <div class="metrica-header">
            <span class="metrica-title">📍 Secciones más visitadas</span>
          </div>
          ${this.renderSeccionesRanking(metricas.secciones)}
        </div>

        <!-- CTAs usados -->
        <div class="metrica-card">
          <div class="metrica-header">
            <span class="metrica-title">🎯 CTAs utilizados</span>
          </div>
          ${this.renderCTAsRanking(metricas.ctas)}
        </div>

        ${mostrarComparativas && medias ? `
          <div class="comparativa-footer">
            <small>📊 Comparativas basadas en ${medias.numFamilias} familias con tracking activo</small>
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Calcular métricas de una familia
   */
  calcularMetricasFamilia(eventos, totalMiembros) {
    // Totales
    const totalAcciones = eventos.length;
    const completados = eventos.filter(e => e.accion === 'completar').length;
    const abandonados = eventos.filter(e => e.accion === 'abandonar').length;
    const tasaAbandono = (completados + abandonados) > 0 
      ? Math.round((abandonados / (completados + abandonados)) * 100) 
      : 0;

    // Usuarios activos
    const credencialesActivas = new Set();
    eventos.forEach(e => {
      if (e.credencial) credencialesActivas.add(e.credencial + '-' + (e.generacion || 0));
    });
    const usuariosActivos = credencialesActivas.size;

    // Arquetipos
    const accionesPorUsuario = {};
    eventos.forEach(e => {
      const key = e.credencial + '-' + (e.generacion || 0);
      if (!accionesPorUsuario[key]) {
        accionesPorUsuario[key] = { crear: 0, consultar: 0, completar: 0, total: 0 };
      }
      accionesPorUsuario[key].total++;
      if (e.accion === 'crear' || e.accion === 'iniciar') accionesPorUsuario[key].crear++;
      if (e.accion === 'consultar') accionesPorUsuario[key].consultar++;
      if (e.accion === 'completar') accionesPorUsuario[key].completar++;
    });

    let capitanes = 0, tripulantes = 0, polizones = 0;
    Object.values(accionesPorUsuario).forEach(u => {
      const ratioCreacion = u.crear / Math.max(u.total, 1);
      if (ratioCreacion > 0.3 || u.crear >= 5) capitanes++;
      else if (u.completar > 0 || u.total >= 3) tripulantes++;
      else polizones++;
    });
    const naufragos = Math.max(0, totalMiembros - Object.keys(accionesPorUsuario).length);

    // Proactividad
    const directos = eventos.filter(e => e.origen === 'directo').length;
    const notificaciones = eventos.filter(e => e.origen === 'notificacion').length;
    const totalOrigen = directos + notificaciones;
    const proactividad = totalOrigen > 0 ? Math.round((directos / totalOrigen) * 100) : 50;

    // Secciones
    const secciones = {};
    eventos.forEach(e => {
      if (e.seccion && e.accion === 'consultar') {
        secciones[e.seccion] = (secciones[e.seccion] || 0) + 1;
      }
    });

    // CTAs
    const ctas = {};
    const ctasNombres = ['averia', 'iniciativa', 'evento', 'reserva', 'encargo', 'convocatoria', 'queo', 'hito'];
    eventos.forEach(e => {
      if (e.accion === 'completar' && ctasNombres.includes(e.flujo || e.modulo)) {
        const nombre = e.flujo || e.modulo;
        ctas[nombre] = (ctas[nombre] || 0) + 1;
      }
    });

    return {
      totalAcciones,
      usuariosActivos,
      completados,
      tasaAbandono,
      arquetipos: { capitanes, tripulantes, polizones, naufragos },
      proactividad,
      secciones,
      ctas
    };
  },

  // ============================================================
  // HELPERS DE RENDERIZADO
  // ============================================================

  renderStatCard(label, valor, periodo, media, invertido = false) {
    const comparativa = media !== null ? `
      <div class="stat-comparativa ${this.compararValor(valor, media, invertido)}">
        <span class="stat-media">Media: ${media}</span>
      </div>
    ` : '';

    return `
      <div class="stat-card">
        <div class="stat-value">${valor}</div>
        <div class="stat-label">${label} ${periodo ? `<small>(${periodo})</small>` : ''}</div>
        ${comparativa}
      </div>
    `;
  },

  compararValor(valor, media, invertido) {
    const numValor = parseInt(valor) || 0;
    const numMedia = parseInt(media) || 0;
    if (invertido) {
      return numValor < numMedia ? 'mejor' : numValor > numMedia ? 'peor' : 'igual';
    }
    return numValor > numMedia ? 'mejor' : numValor < numMedia ? 'peor' : 'igual';
  },

  renderArquetipo(icono, label, valor, desc) {
    return `
      <div class="arquetipo-card">
        <div class="arquetipo-icon">${icono}</div>
        <div class="arquetipo-valor">${valor}</div>
        <div class="arquetipo-label">${label}</div>
        <div class="arquetipo-desc">${desc}</div>
      </div>
    `;
  },

  renderSeccionesRanking(secciones) {
    const ranking = Object.entries(secciones)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (ranking.length === 0) {
      return '<div class="analisis-empty">Sin visitas registradas</div>';
    }

    const maxVal = ranking[0][1];
    const iconos = {
      'cgi': '🏠', 'lo-comun': '🏘️', 'legado': '📜', 'cerebro': '🧠',
      'calendario': '📅', 'nido': '🪺', 'arbol': '🌳', 'activacion': '🎯'
    };

    return ranking.map(([sec, val]) => `
      <div class="barra-container">
        <div class="barra-label">
          <span>${iconos[sec] || '📄'} ${sec}</span>
          <span class="barra-value">${val}</span>
        </div>
        <div class="barra-track">
          <div class="barra-fill" style="width: ${(val/maxVal)*100}%"></div>
        </div>
      </div>
    `).join('');
  },

  renderCTAsRanking(ctas) {
    const ranking = Object.entries(ctas).sort((a, b) => b[1] - a[1]);

    if (ranking.length === 0) {
      return '<div class="analisis-empty">Sin CTAs completados</div>';
    }

    const iconos = {
      'averia': '🔧', 'iniciativa': '💡', 'evento': '🎉', 'reserva': '📅',
      'encargo': '🛒', 'convocatoria': '✋', 'queo': '📣', 'hito': '📌'
    };

    return `<div class="ctas-grid">${ranking.map(([cta, val]) => `
      <div class="cta-stat">
        <span class="cta-icon">${iconos[cta] || '📋'}</span>
        <span class="cta-name">${cta}</span>
        <span class="cta-value">${val}</span>
      </div>
    `).join('')}</div>`;
  },

  // ============================================================
  // UTILIDADES
  // ============================================================

  formatearFecha(timestamp) {
    if (!timestamp) return '';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};

// Exportar para uso global
window.AnalisisModule = AnalisisModule;
