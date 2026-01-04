/**
 * FAMILYNK - Módulo de Seguridad para Externos
 * Caseros, Hosters, Guardas
 * 
 * Este módulo verifica:
 * 1. Que el usuario está autenticado
 * 2. Que tiene registro en 'externos' o legacy
 * 3. Que tiene bienes asignados activos
 * 4. Que los permisos VCEB están configurados
 */

const ExternosSecurity = {
  
  // Tipo esperado: 'casero', 'hoster', 'guarda'
  tipoEsperado: null,
  
  // Datos del externo actual
  externoData: null,
  
  // Bienes asignados con permisos
  bienesAsignados: [],
  
  // Usuario Firebase Auth
  currentUser: null,
  
  /**
   * Inicializar módulo de seguridad
   * @param {string} tipo - Tipo de externo esperado
   * @returns {Promise<boolean>} - true si autorizado, false si no
   */
  async init(tipo) {
    this.tipoEsperado = tipo;
    
    return new Promise((resolve) => {
      // Esperar a que Firebase Auth esté listo
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          console.warn('[Security] No hay usuario autenticado');
          this.redirectToLogin('No has iniciado sesión');
          resolve(false);
          return;
        }
        
        this.currentUser = user;
        console.log('[Security] Usuario autenticado:', user.email);
        
        try {
          // Buscar datos del externo
          const externoOk = await this.loadExternoData();
          
          if (!externoOk) {
            resolve(false);
            return;
          }
          
          // Verificar tipo
          if (this.externoData.tipo !== this.tipoEsperado) {
            console.warn('[Security] Tipo incorrecto:', this.externoData.tipo, 'esperado:', this.tipoEsperado);
            this.redirectToCorrectPage();
            resolve(false);
            return;
          }
          
          // Verificar que está activo
          if (this.externoData.activo === false) {
            this.redirectToLogin('Tu acceso ha sido desactivado');
            resolve(false);
            return;
          }
          
          // Cargar bienes asignados
          await this.loadBienesAsignados();
          
          if (this.bienesAsignados.length === 0) {
            this.redirectToLogin('No tienes bienes asignados');
            resolve(false);
            return;
          }
          
          console.log('[Security] Autorizado. Bienes:', this.bienesAsignados.length);
          resolve(true);
          
        } catch (error) {
          console.error('[Security] Error:', error);
          this.redirectToLogin('Error al verificar acceso');
          resolve(false);
        }
      });
    });
  },
  
  /**
   * Cargar datos del externo desde Firestore
   */
  async loadExternoData() {
    const email = this.currentUser.email.toLowerCase();
    
    // 1. Buscar en colección 'externos' (nueva estructura)
    try {
      const snapshot = await db.collection('externos')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (!snapshot.empty) {
        this.externoData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        };
        console.log('[Security] Externo encontrado en colección nueva');
        return true;
      }
    } catch (e) {
      console.warn('[Security] Error buscando en externos:', e);
    }
    
    // 2. Buscar en sessionStorage (datos de legacy guardados en login)
    const legacyData = sessionStorage.getItem('externoLegacy');
    if (legacyData) {
      try {
        this.externoData = JSON.parse(legacyData);
        console.log('[Security] Usando datos legacy de sessionStorage');
        return true;
      } catch (e) {
        console.warn('[Security] Error parseando legacy data');
      }
    }
    
    // 3. Buscar en subcolecciones legacy
    const legacyResult = await this.searchLegacyCollections(email);
    if (legacyResult) {
      this.externoData = legacyResult;
      console.log('[Security] Externo encontrado en colección legacy');
      return true;
    }
    
    console.warn('[Security] Externo no encontrado en ninguna parte');
    this.redirectToLogin('Tu cuenta no está configurada como ' + this.tipoEsperado);
    return false;
  },
  
  /**
   * Buscar en subcolecciones legacy
   */
  async searchLegacyCollections(email) {
    const collections = ['caseros', 'hosters', 'guardas'];
    const tipos = ['casero', 'hoster', 'guarda'];
    
    for (let i = 0; i < collections.length; i++) {
      try {
        const snapshot = await db.collectionGroup(collections[i])
          .where('email', '==', email)
          .where('activo', '==', true)
          .limit(1)
          .get();
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const bienId = doc.ref.parent.parent.id;
          return {
            id: doc.id,
            tipo: tipos[i],
            bienId: bienId,
            isLegacy: true,
            ...doc.data()
          };
        }
      } catch (e) {
        // Puede fallar si no hay índice, ignorar
      }
    }
    
    return null;
  },
  
  /**
   * Cargar bienes asignados con sus permisos
   */
  async loadBienesAsignados() {
    this.bienesAsignados = [];
    
    // Si es estructura legacy (un solo bien)
    if (this.externoData.isLegacy && this.externoData.bienId) {
      try {
        const bienDoc = await db.collection('bienes').doc(this.externoData.bienId).get();
        if (bienDoc.exists) {
          this.bienesAsignados.push({
            id: this.externoData.bienId,
            nombre: bienDoc.data().nombre || 'Sin nombre',
            tipo: bienDoc.data().tipo || 'residencial',
            permisos: this.externoData.permisos || this.getDefaultPermisos()
          });
        }
      } catch (e) {
        console.warn('[Security] Error cargando bien legacy:', e);
      }
      return;
    }
    
    // Estructura nueva: array de bienes asignados
    if (this.externoData.bienesAsignados && Array.isArray(this.externoData.bienesAsignados)) {
      for (const asignacion of this.externoData.bienesAsignados) {
        try {
          const bienId = asignacion.bienId || asignacion;
          const bienDoc = await db.collection('bienes').doc(bienId).get();
          
          if (bienDoc.exists) {
            this.bienesAsignados.push({
              id: bienId,
              nombre: bienDoc.data().nombre || 'Sin nombre',
              tipo: bienDoc.data().tipo || 'residencial',
              permisos: asignacion.permisos || this.getDefaultPermisos()
            });
          }
        } catch (e) {
          console.warn('[Security] Error cargando bien:', e);
        }
      }
    }
    
    // Estructura nueva alternativa: mapa de bienes
    if (this.externoData.bienesAsignados && typeof this.externoData.bienesAsignados === 'object' && !Array.isArray(this.externoData.bienesAsignados)) {
      for (const [bienId, permisos] of Object.entries(this.externoData.bienesAsignados)) {
        try {
          const bienDoc = await db.collection('bienes').doc(bienId).get();
          
          if (bienDoc.exists) {
            this.bienesAsignados.push({
              id: bienId,
              nombre: bienDoc.data().nombre || 'Sin nombre',
              tipo: bienDoc.data().tipo || 'residencial',
              permisos: permisos || this.getDefaultPermisos()
            });
          }
        } catch (e) {
          console.warn('[Security] Error cargando bien:', e);
        }
      }
    }
  },
  
  /**
   * Permisos por defecto (solo lectura)
   */
  getDefaultPermisos() {
    return {
      reservas: { ver: true, crear: false, editar: false, borrar: false },
      inventario: { ver: true, crear: false, editar: false, borrar: false },
      limpieza: { ver: true, crear: false, editar: true, borrar: false },
      gastos: { ver: true, crear: true, editar: false, borrar: false },
      mantenimiento: { ver: true, crear: true, editar: false, borrar: false },
      documentos: { ver: true, crear: false, editar: false, borrar: false }
    };
  },
  
  /**
   * Verificar si tiene permiso para una acción en un módulo
   * @param {string} modulo - Nombre del módulo
   * @param {string} accion - 'ver', 'crear', 'editar', 'borrar'
   * @param {string} bienId - ID del bien (opcional, usa el primero si no se especifica)
   */
  tienePermiso(modulo, accion, bienId = null) {
    let bien = this.bienesAsignados[0];
    
    if (bienId) {
      bien = this.bienesAsignados.find(b => b.id === bienId);
    }
    
    if (!bien || !bien.permisos) {
      return false;
    }
    
    if (!bien.permisos[modulo]) {
      return false;
    }
    
    return bien.permisos[modulo][accion] === true;
  },
  
  /**
   * Obtener permisos de un módulo para el bien actual
   */
  getPermisosModulo(modulo, bienId = null) {
    let bien = this.bienesAsignados[0];
    
    if (bienId) {
      bien = this.bienesAsignados.find(b => b.id === bienId);
    }
    
    if (!bien || !bien.permisos || !bien.permisos[modulo]) {
      return { ver: false, crear: false, editar: false, borrar: false };
    }
    
    return bien.permisos[modulo];
  },
  
  /**
   * Redirigir al login con mensaje
   */
  redirectToLogin(mensaje = null) {
    if (mensaje) {
      sessionStorage.setItem('loginError', mensaje);
    }
    auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  },
  
  /**
   * Redirigir a la página correcta según tipo
   */
  redirectToCorrectPage() {
    const destinos = {
      'casero': 'casero.html',
      'hoster': 'hoster.html',
      'guarda': 'guarda.html'
    };
    
    const destino = destinos[this.externoData.tipo];
    if (destino) {
      window.location.href = destino;
    } else {
      this.redirectToLogin('Tipo de acceso desconocido');
    }
  },
  
  /**
   * Cerrar sesión
   */
  logout() {
    sessionStorage.clear();
    auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  }
};

// Exportar para uso global
window.ExternosSecurity = ExternosSecurity;
