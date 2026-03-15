/**
 * FAMILYNK — permisos-familia.js
 * Helper ligero para controlar permisos de miembros de familia en módulos de add-on.
 * 
 * Lógica:
 *   adminRama / patriarca / matriarca → PUEDE TODO
 *   adminNido del MISMO nido que el bien → PUEDE TODO
 *   adminNido de OTRO nido → SOLO VER
 *   adulto → SOLO VER
 *   niño / especial → SOLO VER
 *   alejado → SIN ACCESO
 * 
 * Uso en cada módulo:
 *   <script src="permisos-familia.js"></script>
 *   await PermisosFamilia.init(db, user, bienId);
 *   if (!PermisosFamilia.puedeVer()) { redirect o mensaje }
 *   PermisosFamilia.aplicarUI();  // oculta botones de edición automáticamente
 *
 * Migración React: convertir en hook usePermisos(db, user, bienId)
 */

const PermisosFamilia = (() => {
  let _rol = null;           // Credencial del usuario
  let _userNidoId = null;    // Nido al que pertenece el usuario
  let _bienNidoId = null;    // Nido propietario del bien
  let _esExterno = false;    // Si es casero/hoster/guarda
  let _iniciado = false;

  // Roles con permiso total (crear, editar, borrar)
  const ROLES_ADMIN = ['adminRama', 'admin-rama', 'patriarca', 'matriarca', 'adminSistema', 'admin-sistema'];

  async function init(db, user, bienId) {
    if (!db || !user || !bienId) {
      console.warn('PermisosFamilia: faltan parámetros (db, user, bienId)');
      return;
    }

    try {
      // 1. Leer datos del usuario
      const userDoc = await db.collection('usuarios').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        _rol = userData.rol || userData.credencial || 'adulto';
        _userNidoId = userData.nidoId || userData.nido || null;
        // Detectar si es externo (casero/hoster/guarda no están en usuarios normalmente)
        _esExterno = userData.esExterno === true || userData.tipo === 'externo';
      } else {
        // Si no está en colección usuarios, puede ser externo
        _esExterno = true;
        _rol = 'externo';
      }

      // 2. Leer nido propietario del bien
      const bienDoc = await db.collection('bienes').doc(bienId).get();
      if (bienDoc.exists) {
        const bienData = bienDoc.data();
        _bienNidoId = bienData.nidoPropietario || bienData.nidoId || null;
      }

      _iniciado = true;
      console.log(`PermisosFamilia: rol=${_rol}, userNido=${_userNidoId}, bienNido=${_bienNidoId}, esExterno=${_esExterno}`);

    } catch (e) {
      console.error('PermisosFamilia init error:', e.message);
      // En caso de error, modo seguro = solo lectura
      _rol = 'adulto';
      _iniciado = true;
    }
  }

  function _esRolAdmin() {
    return ROLES_ADMIN.includes(_rol);
  }

  function _esAdminNidoDelBien() {
    if (!_rol) return false;
    const esAdminNido = _rol === 'adminNido' || _rol === 'admin-nido';
    return esAdminNido && _userNidoId && _bienNidoId && _userNidoId === _bienNidoId;
  }

  /**
   * ¿Puede ver este módulo?
   * Todos excepto 'alejado' pueden ver.
   */
  function puedeVer() {
    if (_esExterno) return true; // Los externos se controlan con permisos-externos.js
    if (_rol === 'alejado') return false;
    return true;
  }

  /**
   * ¿Puede crear / editar en este módulo?
   * Solo admins de rama o admin-nido del mismo nido que el bien.
   */
  function puedeEditar() {
    if (_esExterno) return true; // Se controla con permisos-externos.js
    if (_esRolAdmin()) return true;
    if (_esAdminNidoDelBien()) return true;
    return false;
  }

  /**
   * ¿Puede borrar en este módulo?
   * Mismo criterio que editar.
   */
  function puedeBorrar() {
    return puedeEditar();
  }

  /**
   * Aplica restricciones en la UI:
   * - Oculta botones de crear (+, Nueva, Añadir)
   * - Oculta botones de eliminar
   * - Deshabilita inputs en modales
   * - Muestra badge "Solo lectura" si aplica
   */
  function aplicarUI() {
    if (!_iniciado) return;
    if (_esExterno) return; // Los externos se gestionan con PermisosExt.aplicarUI()
    if (puedeEditar()) return; // Si puede editar, no tocar nada

    console.log('PermisosFamilia: aplicando modo SOLO LECTURA');

    // 1. Ocultar botones de crear
    const selectoresCrear = [
      '.btn-add', '#btn-add',
      '[onclick*="abrirModal"]', '[onclick*="nuevo"]', '[onclick*="Nueva"]', '[onclick*="Añadir"]',
      'button[onclick*="guardar"]', 'button[onclick*="Guardar"]'
    ];
    selectoresCrear.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // No ocultar botones de cerrar/cancelar modal
        const texto = (el.textContent || '').toLowerCase();
        if (texto.includes('cancelar') || texto.includes('cerrar') || texto.includes('volver')) return;
        el.style.display = 'none';
      });
    });

    // 2. Ocultar botones de eliminar
    document.querySelectorAll('[onclick*="eliminar"], [onclick*="Eliminar"], .btn-danger, #btn-eliminar').forEach(el => {
      el.style.display = 'none';
    });

    // 3. Mostrar badge de solo lectura
    const badge = document.createElement('div');
    badge.id = 'badge-readonly';
    badge.style.cssText = 'position:fixed;top:auto;bottom:16px;right:16px;background:rgba(61,61,61,0.85);color:#fff;padding:6px 14px;border-radius:20px;font-family:"Nunito",sans-serif;font-size:0.75rem;font-weight:600;z-index:999;display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
    badge.innerHTML = '👁️ Solo lectura';
    document.body.appendChild(badge);

    // 4. Interceptar clicks en filas de tabla para abrir en modo lectura
    _modoLecturaModales();
  }

  /**
   * Intercepta apertura de modales para deshabilitar campos
   */
  function _modoLecturaModales() {
    // Observer para detectar cuando se abre un modal
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.classList && m.target.classList.contains('active')) {
          // Modal abierto → deshabilitar campos
          const modal = m.target;
          modal.querySelectorAll('input, select, textarea').forEach(el => {
            el.disabled = true;
            el.style.opacity = '0.6';
          });
          // Ocultar footer de acciones (guardar/eliminar)
          modal.querySelectorAll('.modal-footer').forEach(footer => {
            footer.querySelectorAll('button').forEach(btn => {
              const texto = (btn.textContent || '').toLowerCase();
              if (!texto.includes('cerrar') && !texto.includes('cancelar')) {
                btn.style.display = 'none';
              }
            });
          });
        }
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // API pública
  return {
    init,
    puedeVer,
    puedeEditar,
    puedeBorrar,
    aplicarUI,
    get rol() { return _rol; },
    get esAdmin() { return _esRolAdmin() || _esAdminNidoDelBien(); },
    get esExterno() { return _esExterno; },
    get iniciado() { return _iniciado; }
  };
})();
