/**
 * FAMILYNK - Eventos Tracker
 * Sistema de análisis de uso (sin datos personales)
 * 
 * ESTRUCTURA FIRESTORE:
 * 
 * eventos_uso/{eventoId}
 * ├── ramaId: string              // ID de la familia/rama
 * ├── timestamp: timestamp        // Momento del evento
 * ├── tipoUsuario: string         // "miembro" | "casero" | "hoster" | "guarda"
 * ├── credencial: string          // "admin-rama" | "admin-nido" | "adulto" | "niño" | "casero" | etc.
 * ├── generacion: number|null     // 1-4 para miembros, null para externos
 * ├── accion: string              // "crear" | "consultar" | "editar" | "borrar" | "completar" | "abandonar"
 * ├── seccion: string             // "cgi" | "lo-comun" | "legado" | "calendario" | "cerebro" | etc.
 * ├── modulo: string|null         // "reservas" | "inventario" | "mantenimiento" | etc.
 * ├── flujo: string|null          // "iniciado" | "completado" | "abandonado"
 * ├── origen: string              // "directo" | "notificacion" | "enlace"
 * └── contexto: string            // "rama" | "estirpe" | "nido" | "bien"
 * 
 * NOTAS:
 * - NO se guarda ningún identificador de usuario (ni odeu, ni email, ni nombre)
 * - NO se guarda contenido de acciones (texto de mensajes, nombres de bienes, etc.)
 * - El objetivo es entender PATRONES, no espiar PERSONAS
 */

const EventosTracker = {
  
  // Configuración
  config: {
    enabled: true,
    debug: false,
    batchSize: 5,           // Enviar cada N eventos (optimización)
    batchTimeout: 30000,    // O cada 30 segundos
    coleccion: 'eventos_uso'
  },
  
  // Estado interno
  state: {
    ramaId: null,
    tipoUsuario: null,
    credencial: null,
    generacion: null,
    seccionActual: null,
    origen: 'directo',
    initialized: false,
    trackingActivo: false  // Por defecto desactivado hasta verificar
  },
  
  // Buffer para batch de eventos
  buffer: [],
  batchTimer: null,
  
  /**
   * Inicializar el tracker
   * Se llama automáticamente al cargar la página
   */
  async init() {
    if (this.state.initialized) return;
    
    try {
      // Detectar contexto desde sessionStorage o URL
      await this.detectarContexto();
      
      // Verificar si el tracking está activo para esta rama
      await this.verificarTrackingActivo();
      
      // Si no está activo, no continuar
      if (!this.state.trackingActivo) {
        if (this.config.debug) {
          console.log('[Tracker] Tracking desactivado para esta rama');
        }
        this.state.initialized = true;
        return;
      }
      
      // Detectar origen (cómo llegó el usuario)
      this.detectarOrigen();
      
      // Detectar sección actual
      this.detectarSeccion();
      
      // Registrar evento de visita a sección
      this.registrar('consultar', this.state.seccionActual);
      
      // Listener para cuando se va de la página
      window.addEventListener('beforeunload', () => this.flush());
      
      // Timer para flush periódico
      this.batchTimer = setInterval(() => this.flush(), this.config.batchTimeout);
      
      this.state.initialized = true;
      
      if (this.config.debug) {
        console.log('[Tracker] Inicializado:', this.state);
      }
      
    } catch (error) {
      console.warn('[Tracker] Error al inicializar:', error);
    }
  },
  
  /**
   * Verificar si el tracking está activo para la rama actual
   */
  async verificarTrackingActivo() {
    if (!this.state.ramaId) {
      this.state.trackingActivo = false;
      return;
    }
    
    try {
      // Consultar la familia/rama para ver si tiene tracking activo
      const familiaDoc = await db.collection('familias').doc(this.state.ramaId).get();
      
      if (familiaDoc.exists) {
        const data = familiaDoc.data();
        
        // Verificar si está activo Y no ha expirado
        if (data.trackingActivo === true) {
          // Si hay fecha de expiración, verificar que no haya pasado
          if (data.trackingHasta) {
            const hasta = data.trackingHasta.toDate ? data.trackingHasta.toDate() : new Date(data.trackingHasta);
            this.state.trackingActivo = new Date() <= hasta;
            
            // Si expiró, desactivar automáticamente en Firestore
            if (!this.state.trackingActivo) {
              db.collection('familias').doc(this.state.ramaId).update({
                trackingActivo: false,
                trackingExpirado: true
              }).catch(e => console.warn('[Tracker] Error desactivando tracking expirado:', e));
            }
          } else {
            // Sin fecha de expiración = activo indefinidamente
            this.state.trackingActivo = true;
          }
        } else {
          this.state.trackingActivo = false;
        }
      } else {
        this.state.trackingActivo = false;
      }
      
      if (this.config.debug) {
        console.log('[Tracker] Tracking activo:', this.state.trackingActivo);
      }
      
    } catch (error) {
      console.warn('[Tracker] Error verificando tracking:', error);
      this.state.trackingActivo = false;
    }
  },
  
  /**
   * Detectar contexto del usuario (sin identificarlo)
   */
  async detectarContexto() {
    // Intentar obtener de sessionStorage
    const userData = sessionStorage.getItem('userData');
    const externoData = sessionStorage.getItem('externoLegacy');
    
    if (userData) {
      try {
        const data = JSON.parse(userData);
        this.state.ramaId = data.familiaId || data.ramaId || null;
        this.state.tipoUsuario = 'miembro';
        this.state.credencial = data.credencial || data.rol || 'adulto';
        this.state.generacion = data.generacion || null;
      } catch (e) {
        console.warn('[Tracker] Error parseando userData');
      }
    } else if (externoData) {
      try {
        const data = JSON.parse(externoData);
        this.state.ramaId = data.ramaId || null;
        this.state.tipoUsuario = data.tipo || 'casero';
        this.state.credencial = data.tipo || 'casero';
        this.state.generacion = null; // Externos no tienen generación
      } catch (e) {
        console.warn('[Tracker] Error parseando externoData');
      }
    } else {
      // Detectar por URL como fallback
      const url = window.location.pathname.toLowerCase();
      if (url.includes('casero')) {
        this.state.tipoUsuario = 'casero';
        this.state.credencial = 'casero';
      } else if (url.includes('hoster')) {
        this.state.tipoUsuario = 'hoster';
        this.state.credencial = 'hoster';
      } else if (url.includes('guarda')) {
        this.state.tipoUsuario = 'guarda';
        this.state.credencial = 'guarda';
      } else {
        this.state.tipoUsuario = 'miembro';
        this.state.credencial = 'desconocido';
      }
    }
  },
  
  /**
   * Detectar cómo llegó el usuario a la página
   */
  detectarOrigen() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    // Si viene de notificación (parámetro en URL)
    if (urlParams.has('from') && urlParams.get('from') === 'notif') {
      this.state.origen = 'notificacion';
    }
    // Si viene de enlace externo (email, whatsapp, etc.)
    else if (urlParams.has('ref') || urlParams.has('token')) {
      this.state.origen = 'enlace';
    }
    // Si viene de otra página de FAMILYNK
    else if (referrer && referrer.includes(window.location.hostname)) {
      this.state.origen = 'directo';
    }
    // Si viene de fuera
    else if (referrer) {
      this.state.origen = 'enlace';
    }
    // Si no hay referrer (directo o bookmark)
    else {
      this.state.origen = 'directo';
    }
  },
  
  /**
   * Detectar en qué sección está el usuario
   */
  detectarSeccion() {
    const path = window.location.pathname.toLowerCase();
    const pagina = path.split('/').pop().replace('.html', '');
    
    // Mapeo de páginas a secciones
    const mapeoSecciones = {
      'cgi': 'cgi',
      'index': 'cgi',
      'lo-comun': 'lo-comun',
      'locomun': 'lo-comun',
      'legado': 'legado',
      'cerebro': 'cerebro',
      'arbol': 'arbol',
      'nido': 'nido',
      'mi-nido': 'nido',
      'calendario': 'calendario',
      'eventos': 'calendario',
      'chat': 'chat',
      'casero': 'externo-casero',
      'hoster': 'externo-hoster',
      'guarda': 'externo-guarda',
      'reservas': 'reservas',
      'inventario': 'inventario',
      'mantenimiento': 'mantenimiento',
      'limpieza': 'limpieza',
      'gastos': 'gastos',
      'admin-rama': 'admin-rama',
      'admin-nido': 'admin-nido',
      'cuenta': 'cuenta',
      'login': 'login'
    };
    
    this.state.seccionActual = mapeoSecciones[pagina] || pagina || 'desconocida';
  },
  
  /**
   * Registrar un evento
   * @param {string} accion - Tipo de acción
   * @param {string} seccion - Sección (opcional, usa la actual)
   * @param {object} extras - Datos adicionales opcionales
   */
  registrar(accion, seccion = null, extras = {}) {
    if (!this.config.enabled) return;
    if (!this.state.trackingActivo) return;  // Tracking desactivado para esta rama
    if (!this.state.ramaId) {
      if (this.config.debug) console.warn('[Tracker] Sin ramaId, evento ignorado');
      return;
    }
    
    const evento = {
      ramaId: this.state.ramaId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      tipoUsuario: this.state.tipoUsuario,
      credencial: this.state.credencial,
      generacion: this.state.generacion,
      accion: accion,
      seccion: seccion || this.state.seccionActual,
      modulo: extras.modulo || null,
      flujo: extras.flujo || null,
      origen: this.state.origen,
      contexto: extras.contexto || this.inferirContexto(seccion)
    };
    
    // Añadir al buffer
    this.buffer.push(evento);
    
    if (this.config.debug) {
      console.log('[Tracker] Evento registrado:', evento);
    }
    
    // Flush si el buffer está lleno
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  },
  
  /**
   * Inferir el contexto de alcance
   */
  inferirContexto(seccion) {
    const sec = seccion || this.state.seccionActual;
    
    // Contextos por sección
    const contextos = {
      'cgi': 'nido',
      'nido': 'nido',
      'mi-nido': 'nido',
      'lo-comun': 'rama',
      'legado': 'rama',
      'arbol': 'rama',
      'calendario': 'rama',
      'cerebro': 'rama',
      'admin-rama': 'rama',
      'admin-nido': 'nido',
      'externo-casero': 'bien',
      'externo-hoster': 'bien',
      'externo-guarda': 'bien',
      'reservas': 'bien',
      'inventario': 'bien',
      'mantenimiento': 'bien'
    };
    
    return contextos[sec] || 'rama';
  },
  
  /**
   * Enviar eventos pendientes a Firestore
   */
  async flush() {
    if (this.buffer.length === 0) return;
    
    const eventosAEnviar = [...this.buffer];
    this.buffer = [];
    
    try {
      const batch = db.batch();
      
      eventosAEnviar.forEach(evento => {
        const ref = db.collection(this.config.coleccion).doc();
        batch.set(ref, evento);
      });
      
      await batch.commit();
      
      if (this.config.debug) {
        console.log('[Tracker] Flush completado:', eventosAEnviar.length, 'eventos');
      }
      
    } catch (error) {
      console.warn('[Tracker] Error en flush:', error);
      // Devolver eventos al buffer para reintento
      this.buffer = [...eventosAEnviar, ...this.buffer];
    }
  },
  
  // ============ MÉTODOS DE CONVENIENCIA ============
  
  /**
   * Registrar inicio de un flujo (ej: abrir modal de reserva)
   */
  iniciarFlujo(nombreFlujo, modulo = null) {
    this.registrar('iniciar', null, { flujo: 'iniciado', modulo: modulo || nombreFlujo });
  },
  
  /**
   * Registrar completado de un flujo (ej: reserva guardada)
   */
  completarFlujo(nombreFlujo, modulo = null) {
    this.registrar('completar', null, { flujo: 'completado', modulo: modulo || nombreFlujo });
  },
  
  /**
   * Registrar abandono de un flujo (ej: cerrar modal sin guardar)
   */
  abandonarFlujo(nombreFlujo, modulo = null) {
    this.registrar('abandonar', null, { flujo: 'abandonado', modulo: modulo || nombreFlujo });
  },
  
  /**
   * Registrar creación de contenido
   */
  crear(modulo, contexto = null) {
    this.registrar('crear', null, { modulo, contexto });
  },
  
  /**
   * Registrar edición de contenido
   */
  editar(modulo, contexto = null) {
    this.registrar('editar', null, { modulo, contexto });
  },
  
  /**
   * Registrar borrado de contenido
   */
  borrar(modulo, contexto = null) {
    this.registrar('borrar', null, { modulo, contexto });
  },
  
  /**
   * Registrar consulta/visualización
   */
  consultar(modulo, contexto = null) {
    this.registrar('consultar', null, { modulo, contexto });
  },
  
  /**
   * Registrar respuesta a algo (notificación, convocatoria, etc.)
   */
  responder(modulo, contexto = null) {
    this.registrar('responder', null, { modulo, contexto });
  },
  
  // ============ CONTROL ============
  
  /**
   * Activar/desactivar tracking
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
    if (this.config.debug) {
      console.log('[Tracker] Enabled:', enabled);
    }
  },
  
  /**
   * Activar modo debug
   */
  setDebug(debug) {
    this.config.debug = debug;
  },
  
  /**
   * Limpiar y detener
   */
  destroy() {
    this.flush();
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.state.initialized = false;
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => EventosTracker.init());
} else {
  // DOM ya cargado
  EventosTracker.init();
}

// Exportar para uso global
window.EventosTracker = EventosTracker;

// Alias cortos para conveniencia
window.track = {
  crear: (m, c) => EventosTracker.crear(m, c),
  editar: (m, c) => EventosTracker.editar(m, c),
  borrar: (m, c) => EventosTracker.borrar(m, c),
  consultar: (m, c) => EventosTracker.consultar(m, c),
  responder: (m, c) => EventosTracker.responder(m, c),
  iniciar: (f, m) => EventosTracker.iniciarFlujo(f, m),
  completar: (f, m) => EventosTracker.completarFlujo(f, m),
  abandonar: (f, m) => EventosTracker.abandonarFlujo(f, m)
};
