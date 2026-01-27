/**
 * FAMILYNK - Sistema de Permisos CVEB para Externos
 * 
 * C = Crear  (añadir nuevos registros)
 * V = Ver    (consultar información)
 * E = Editar (modificar registros existentes)
 * B = Borrar (eliminar registros)
 * 
 * Uso en módulos:
 * 1. Incluir este script: <script src="permisos-externos.js"></script>
 * 2. Llamar a initPermisosExternos() después de autenticación
 * 3. Usar aplicarPermisosCVEB(cardId) para aplicar restricciones
 */

const PermisosExternos = {
  
  // Estado
  esExterno: false,
  tipoExterno: null, // 'casero', 'hoster', 'guarda'
  externoData: null,
  permisos: {},      // Permisos aplicables para este externo
  bienId: null,
  familiaId: null,
  
  /**
   * Inicializa el sistema de permisos
   * @param {Object} db - Instancia de Firestore
   * @param {Object} user - Usuario autenticado
   * @param {String} bienId - ID del bien actual
   * @returns {Promise<Boolean>} - true si es externo
   */
  async init(db, user, bienId) {
    this.bienId = bienId;
    
    if (!user || !bienId) {
      this.esExterno = false;
      return false;
    }
    
    try {
      // Buscar si es casero de este bien
      const caseroSnap = await db.collection('bienes').doc(bienId)
        .collection('caseros')
        .where('email', '==', user.email.toLowerCase())
        .limit(1)
        .get();
      
      if (!caseroSnap.empty) {
        this.esExterno = true;
        this.tipoExterno = 'casero';
        this.externoData = { id: caseroSnap.docs[0].id, ...caseroSnap.docs[0].data() };
        await this._cargarPermisos(db);
        return true;
      }
      
      // Buscar si es hoster de este bien
      const hosterSnap = await db.collection('bienes').doc(bienId)
        .collection('hosters')
        .where('email', '==', user.email.toLowerCase())
        .limit(1)
        .get();
      
      if (!hosterSnap.empty) {
        this.esExterno = true;
        this.tipoExterno = 'hoster';
        this.externoData = { id: hosterSnap.docs[0].id, ...hosterSnap.docs[0].data() };
        await this._cargarPermisos(db);
        return true;
      }
      
      // Buscar si es guarda de este bien
      const guardaSnap = await db.collection('bienes').doc(bienId)
        .collection('guardas')
        .where('email', '==', user.email.toLowerCase())
        .limit(1)
        .get();
      
      if (!guardaSnap.empty) {
        this.esExterno = true;
        this.tipoExterno = 'guarda';
        this.externoData = { id: guardaSnap.docs[0].id, ...guardaSnap.docs[0].data() };
        await this._cargarPermisos(db);
        return true;
      }
      
      // No es externo
      this.esExterno = false;
      return false;
      
    } catch (error) {
      console.error('Error verificando externo:', error);
      this.esExterno = false;
      return false;
    }
  },
  
  /**
   * Carga permisos: primero específicos del bien, luego defaults de rama
   */
  async _cargarPermisos(db) {
    // 1. Permisos específicos del externo (en bien)
    if (this.externoData?.permisos && Object.keys(this.externoData.permisos).length > 0) {
      this.permisos = this.externoData.permisos;
      console.log('Permisos específicos del externo:', this.permisos);
      return;
    }
    
    // 2. Permisos por defecto de la rama
    try {
      const bienDoc = await db.collection('bienes').doc(this.bienId).get();
      const bienData = bienDoc.data();
      this.familiaId = bienData?.familiaId;
      
      if (this.familiaId) {
        const familiaDoc = await db.collection('familias').doc(this.familiaId).get();
        const familiaData = familiaDoc.data();
        
        if (familiaData?.permisosExternos?.[this.tipoExterno]) {
          this.permisos = familiaData.permisosExternos[this.tipoExterno];
          console.log('Permisos por defecto de rama:', this.permisos);
          return;
        }
      }
    } catch (error) {
      console.error('Error cargando permisos de rama:', error);
    }
    
    // 3. Defaults mínimos (solo ver)
    this.permisos = {};
    console.log('Permisos: usando defaults mínimos (solo ver)');
  },
  
  /**
   * Obtiene permiso para un módulo/card específico
   * @param {String} moduloId - ID del módulo (ej: 'limpieza', 'inventario_gestionar')
   * @returns {Object} - { c: bool, v: bool, e: bool, b: bool }
   */
  getPermiso(moduloId) {
    // Buscar permiso exacto
    if (this.permisos[moduloId]) {
      return this.permisos[moduloId];
    }
    
    // Buscar permiso del módulo padre (para cards)
    const moduloPadre = moduloId.split('_')[0];
    if (moduloPadre !== moduloId && this.permisos[moduloPadre]) {
      return this.permisos[moduloPadre];
    }
    
    // Default: solo ver
    return { c: false, v: true, e: false, b: false };
  },
  
  /**
   * Verifica si tiene permiso específico
   * @param {String} moduloId - ID del módulo
   * @param {String} accion - 'c', 'v', 'e', 'b'
   * @returns {Boolean}
   */
  puede(moduloId, accion) {
    if (!this.esExterno) return true; // No es externo, tiene todos los permisos
    const perm = this.getPermiso(moduloId);
    return perm[accion] === true;
  },
  
  /**
   * Aplica permisos CVEB a la UI de un módulo
   * @param {String} moduloId - ID del módulo/card
   * @param {Object} opciones - Selectores personalizados
   */
  aplicarUI(moduloId, opciones = {}) {
    if (!this.esExterno) return; // No es externo, no aplicar restricciones
    
    const perm = this.getPermiso(moduloId);
    console.log(`Aplicando permisos CVEB para ${moduloId}:`, perm);
    
    // Selectores por defecto
    const selectores = {
      crear: opciones.crear || '[data-accion="crear"], .btn-crear, .btn-add, .btn-nuevo, [onclick*="nuevo"], [onclick*="añadir"], [onclick*="crear"]',
      editar: opciones.editar || '[data-accion="editar"], .btn-editar, .btn-edit, [onclick*="editar"], input:not([readonly]), select:not([disabled]), textarea:not([readonly])',
      borrar: opciones.borrar || '[data-accion="borrar"], .btn-borrar, .btn-delete, .btn-eliminar, [onclick*="eliminar"], [onclick*="borrar"]',
      contenido: opciones.contenido || '.contenido-modulo, .module-content, main, .card-body'
    };
    
    // C = Crear
    if (!perm.c) {
      document.querySelectorAll(selectores.crear).forEach(el => {
        el.style.display = 'none';
      });
      // Ocultar botones con texto específico
      document.querySelectorAll('button, .btn').forEach(btn => {
        const texto = btn.textContent.toLowerCase();
        if (texto.includes('añadir') || texto.includes('nuevo') || texto.includes('crear') || texto.includes('+ ')) {
          btn.style.display = 'none';
        }
      });
    }
    
    // V = Ver (si no puede ver, ocultar todo el contenido)
    if (!perm.v) {
      document.querySelectorAll(selectores.contenido).forEach(el => {
        el.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #718096;">
            <div style="font-size: 3rem; margin-bottom: 16px;">🔒</div>
            <p style="font-size: 1.1rem; font-weight: 600;">Acceso restringido</p>
            <p style="font-size: 0.9rem;">No tienes permiso para ver esta sección.</p>
          </div>
        `;
      });
      return; // No aplicar más restricciones si no puede ver
    }
    
    // E = Editar
    if (!perm.e) {
      // Deshabilitar inputs
      document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(el => {
        if (!el.closest('[data-permiso-ignorar]')) {
          el.setAttribute('readonly', 'readonly');
          el.setAttribute('disabled', 'disabled');
          el.style.opacity = '0.7';
          el.style.cursor = 'not-allowed';
        }
      });
      // Ocultar botones de edición
      document.querySelectorAll(selectores.editar).forEach(el => {
        if (el.tagName === 'BUTTON' || el.classList.contains('btn')) {
          el.style.display = 'none';
        }
      });
      // Ocultar botones con texto de editar/guardar
      document.querySelectorAll('button, .btn').forEach(btn => {
        const texto = btn.textContent.toLowerCase();
        if (texto.includes('editar') || texto.includes('guardar') || texto.includes('modificar')) {
          btn.style.display = 'none';
        }
      });
    }
    
    // B = Borrar
    if (!perm.b) {
      document.querySelectorAll(selectores.borrar).forEach(el => {
        el.style.display = 'none';
      });
      // Ocultar botones con texto de eliminar
      document.querySelectorAll('button, .btn').forEach(btn => {
        const texto = btn.textContent.toLowerCase();
        if (texto.includes('eliminar') || texto.includes('borrar') || texto.includes('🗑')) {
          btn.style.display = 'none';
        }
      });
    }
    
    // Añadir indicador visual de modo restringido
    if (!perm.c || !perm.e || !perm.b) {
      this._mostrarIndicadorRestringido(perm);
    }
  },
  
  /**
   * Muestra indicador de modo restringido
   */
  _mostrarIndicadorRestringido(perm) {
    // Evitar duplicados
    if (document.getElementById('indicador-permisos-ext')) return;
    
    const permisosList = [];
    if (perm.v) permisosList.push('Ver');
    if (perm.c) permisosList.push('Crear');
    if (perm.e) permisosList.push('Editar');
    if (perm.b) permisosList.push('Borrar');
    
    const indicador = document.createElement('div');
    indicador.id = 'indicador-permisos-ext';
    indicador.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8B7355, #6B5344);
        color: white;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 0.8rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span>👤</span>
        <span>Modo: ${permisosList.join(', ') || 'Restringido'}</span>
      </div>
    `;
    document.body.appendChild(indicador);
  },
  
  /**
   * Oculta elementos específicos para externos
   * @param {String|Array} selectores - Selector(es) CSS
   */
  ocultarParaExternos(selectores) {
    if (!this.esExterno) return;
    
    const sels = Array.isArray(selectores) ? selectores : [selectores];
    sels.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.display = 'none';
      });
    });
  },
  
  /**
   * Wrapper para proteger una acción
   * @param {String} moduloId - ID del módulo
   * @param {String} accion - 'c', 'v', 'e', 'b'
   * @param {Function} callback - Función a ejecutar si tiene permiso
   * @param {String} mensaje - Mensaje si no tiene permiso
   */
  proteger(moduloId, accion, callback, mensaje = null) {
    if (this.puede(moduloId, accion)) {
      callback();
    } else {
      const mensajes = {
        c: 'No tienes permiso para crear registros.',
        v: 'No tienes permiso para ver esta información.',
        e: 'No tienes permiso para editar registros.',
        b: 'No tienes permiso para eliminar registros.'
      };
      alert(mensaje || mensajes[accion] || 'Acción no permitida.');
    }
  }
};

// Alias global para facilitar uso
window.PermisosExt = PermisosExternos;
