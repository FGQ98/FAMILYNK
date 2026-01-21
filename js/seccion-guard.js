/**
 * SECCION-GUARD.JS
 * Módulo para verificar si una sección está activa antes de mostrarla.
 * Si la sección está apagada y el usuario NO es admin-rama, redirige a CGI.
 * 
 * USO:
 * 1. Incluir en la página: <script src="js/seccion-guard.js"></script>
 * 2. Llamar después de autenticación: await SeccionGuard.verificar('arbol');
 */

const SeccionGuard = {
  
  // Defaults si no hay configuración
  defaultConfig: {
    secciones: {
      miNido: true,
      arbol: false,
      cerebro: false,
      locomun: true,
      legado: false,
      activacion: true,
      chat: false
    },
    legado: {
      recetas: true,
      fotos: false,
      historias: false,
      valores: false,
      tradiciones: false,
      anecdotas: false,
      sabiduria: false
    },
    locomun: {
      inmuebles: true,
      terrenos: true,
      vehiculos: true,
      ajuar: true
    }
  },

  /**
   * Verifica si una sección está activa
   * @param {string} seccionId - ID de la sección (arbol, legado, activacion, etc.)
   * @param {object} options - Opciones adicionales
   * @returns {Promise<boolean>} - true si puede acceder, false si no
   */
  async verificar(seccionId, options = {}) {
    const { 
      redirigir = true,        // Si debe redirigir automáticamente
      mostrarToast = true,     // Si debe mostrar mensaje
      urlRedireccion = 'cgi.html' 
    } = options;

    try {
      // Esperar a que Firebase esté listo
      const user = await this.getCurrentUser();
      if (!user) {
        console.log('🔒 SeccionGuard: Usuario no autenticado');
        if (redirigir) window.location.href = 'index.html';
        return false;
      }

      // Obtener familia activa
      const familiaId = localStorage.getItem('estirpeActiva');
      if (!familiaId) {
        console.log('🔒 SeccionGuard: No hay familia activa');
        if (redirigir) window.location.href = 'index.html';
        return false;
      }

      // Verificar si es admin-rama (siempre tiene acceso total)
      const esAdmin = await this.esAdminRama(user.uid, familiaId);
      if (esAdmin) {
        console.log('👑 SeccionGuard: Admin detectado, acceso total');
        return true;
      }

      // Usar db si está disponible, sino firebase.firestore()
      const firestore = (typeof db !== 'undefined') ? db : firebase.firestore();

      // Obtener configuración de secciones
      const familiaDoc = await firestore
        .collection('familias')
        .doc(familiaId)
        .get();

      if (!familiaDoc.exists) {
        console.log('🔒 SeccionGuard: Familia no encontrada');
        if (redirigir) window.location.href = 'index.html';
        return false;
      }

      const familiaData = familiaDoc.data();
      const config = familiaData.configSecciones || {};
      const seccionesConfig = config.secciones || this.defaultConfig.secciones;

      // Verificar si la sección está activa
      const seccionActiva = seccionesConfig[seccionId] !== false;
      
      if (!seccionActiva) {
        console.log(`🚫 SeccionGuard: Sección "${seccionId}" desactivada`);
        
        if (mostrarToast) {
          // Guardar mensaje para mostrar en CGI
          sessionStorage.setItem('seccionGuardMsg', `La sección "${this.getNombreSeccion(seccionId)}" no está disponible actualmente.`);
        }
        
        if (redirigir) {
          window.location.href = urlRedireccion;
        }
        return false;
      }

      console.log(`✅ SeccionGuard: Sección "${seccionId}" activa`);
      return true;

    } catch (error) {
      console.error('❌ SeccionGuard error:', error);
      return true; // En caso de error, permitir acceso (fail-open)
    }
  },

  /**
   * Verifica si el usuario es admin-rama
   */
  async esAdminRama(uid, familiaId) {
    try {
      // Usar db si está disponible, sino firebase.firestore()
      const firestore = (typeof db !== 'undefined') ? db : firebase.firestore();
      
      // Buscar en nidos
      const nidosSnap = await firestore
        .collection('nidos')
        .where('familiaId', '==', familiaId)
        .get();

      for (const nidoDoc of nidosSnap.docs) {
        const nido = nidoDoc.data();
        if (nido.miembrosData) {
          const miembro = nido.miembrosData.find(m => m.uid === uid);
          if (miembro) {
            const rol = miembro.rol || miembro.credencial || '';
            if (['adminRama', 'AdminRama', 'admin-rama'].includes(rol) || 
                miembro.esAdmin === true) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error verificando admin:', error);
      return false;
    }
  },

  /**
   * Obtiene el usuario actual de Firebase Auth
   */
  getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  /**
   * Obtiene el nombre legible de una sección
   */
  getNombreSeccion(id) {
    const nombres = {
      miNido: 'Mi Nido',
      arbol: 'Árbol',
      cerebro: 'Cerebro',
      locomun: 'Lo Común',
      legado: 'Legado',
      activacion: 'Activación',
      chat: 'Chat'
    };
    return nombres[id] || id;
  },

  /**
   * Muestra el toast de mensaje si existe
   * Llamar desde CGI después de cargar
   */
  mostrarMensajePendiente() {
    const msg = sessionStorage.getItem('seccionGuardMsg');
    if (msg) {
      sessionStorage.removeItem('seccionGuardMsg');
      this.mostrarToast(msg, 'warning');
    }
  },

  /**
   * Muestra un toast
   */
  mostrarToast(mensaje, tipo = 'info') {
    // Crear toast si no existe
    let toast = document.getElementById('seccion-guard-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'seccion-guard-toast';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Nunito', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(toast);
    }

    // Estilo según tipo
    const estilos = {
      warning: { bg: '#FFF3CD', color: '#856404', border: '1px solid #FFEEBA' },
      error: { bg: '#F8D7DA', color: '#721C24', border: '1px solid #F5C6CB' },
      info: { bg: '#D1ECF1', color: '#0C5460', border: '1px solid #BEE5EB' }
    };
    const estilo = estilos[tipo] || estilos.info;
    
    toast.style.background = estilo.bg;
    toast.style.color = estilo.color;
    toast.style.border = estilo.border;
    toast.textContent = mensaje;
    toast.style.opacity = '1';

    // Ocultar después de 4 segundos
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 4000);
  }
};

// Auto-mostrar mensaje pendiente cuando se carga CGI
if (window.location.pathname.includes('cgi.html') || window.location.pathname.endsWith('/')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => SeccionGuard.mostrarMensajePendiente(), 500);
  });
}
