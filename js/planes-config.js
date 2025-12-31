/**
 * FAMILYNK - Configuración de Planes
 * Utilidad compartida para cargar planes desde Firestore
 * Usado en: cgi.html, planes.html, admin-sistema.html
 */

// Planes por defecto (fallback si Firestore falla)
const PLANES_DEFAULT = {
  gratuito: {
    id: 'gratuito',
    nombre: 'Gratuito',
    icon: 'G',
    descripcion: 'Para empezar con tu familia',
    precioMensual: 0,
    precioAnual: 0,
    maxFotos: 100,
    maxGeneraciones: 3,
    maxBienes: 2,
    features: [
      'Hasta 3 generaciones',
      '100 fotos',
      '2 bienes compartidos',
      'Árbol genealógico',
      'Legado básico (3 categorías)',
      '5 herramientas Activación'
    ],
    featuresDisabled: ['Herramientas avanzadas', 'Fusión de Ramas'],
    activo: true,
    destacado: false,
    orden: 1,
    cta: 'Empezar gratis',
    trial: false
  },
  plus: {
    id: 'plus',
    nombre: 'Plus',
    icon: '+',
    descripcion: 'Familia extendida',
    precioMensual: 5.99,
    precioAnual: 49,
    maxFotos: 500,
    maxGeneraciones: 4,
    maxBienes: 10,
    features: [
      'Hasta 4 generaciones',
      '500 fotos',
      'Todo lo del plan Gratuito',
      'Amigo Invisible',
      'Quinielas familiares',
      'Votaciones y encuestas'
    ],
    featuresDisabled: ['Fusión de Ramas'],
    activo: true,
    destacado: true,
    orden: 2,
    cta: 'Probar 14 días gratis',
    trial: true
  },
  premium: {
    id: 'premium',
    nombre: 'Premium',
    icon: 'P',
    descripcion: 'Todo incluido',
    precioMensual: 9.99,
    precioAnual: 99,
    maxFotos: 9999,
    maxGeneraciones: 99,
    maxBienes: 999,
    features: [
      'Generaciones ilimitadas',
      'Fotos ilimitadas',
      'Todo lo del plan Plus',
      'Fusión de Ramas',
      'Colocar Mesas',
      'Escaleta eventos',
      'Soporte prioritario'
    ],
    featuresDisabled: [],
    activo: true,
    destacado: false,
    orden: 3,
    cta: 'Probar 14 días gratis',
    trial: true
  }
};

const ADDONS_DEFAULT = {
  crearRama: {
    id: 'crearRama',
    nombre: 'Crear Rama',
    icon: '🌳',
    descripcion: 'Bifurcar nueva cuenta familiar',
    precio: 9.99,
    activo: true
  },
  mayordomo: {
    id: 'mayordomo',
    nombre: 'Mayordomo',
    icon: '🎩',
    descripcion: 'Gestión doméstica de 2ª residencia',
    precio: 4.99,
    activo: true
  },
  gerente: {
    id: 'gerente',
    nombre: 'Gerente',
    icon: '🏨',
    descripcion: 'Alquiler turístico profesional',
    precio: 9.99,
    activo: true
  },
  capataz: {
    id: 'capataz',
    nombre: 'Capataz',
    icon: '🌾',
    descripcion: 'Gestión de fincas rurales',
    precio: 9.99,
    activo: true
  }
};

// Cache local
let planesCache = null;
let addonsCache = null;

/**
 * Cargar planes desde Firestore
 * @returns {Promise<Object>} Objeto con planes
 */
async function cargarPlanes() {
  if (planesCache) return planesCache;
  
  try {
    const doc = await db.collection('config').doc('planes').get();
    if (doc.exists && doc.data()) {
      planesCache = { ...PLANES_DEFAULT, ...doc.data() };
    } else {
      planesCache = PLANES_DEFAULT;
      // Inicializar en Firestore si no existe
      await db.collection('config').doc('planes').set(PLANES_DEFAULT);
    }
  } catch (e) {
    console.warn('Error cargando planes, usando defaults:', e);
    planesCache = PLANES_DEFAULT;
  }
  
  return planesCache;
}

/**
 * Cargar addons desde Firestore
 * @returns {Promise<Object>} Objeto con addons
 */
async function cargarAddons() {
  if (addonsCache) return addonsCache;
  
  try {
    const doc = await db.collection('config').doc('addons').get();
    if (doc.exists && doc.data()) {
      addonsCache = { ...ADDONS_DEFAULT, ...doc.data() };
    } else {
      addonsCache = ADDONS_DEFAULT;
      await db.collection('config').doc('addons').set(ADDONS_DEFAULT);
    }
  } catch (e) {
    console.warn('Error cargando addons, usando defaults:', e);
    addonsCache = ADDONS_DEFAULT;
  }
  
  return addonsCache;
}

/**
 * Obtener un plan específico
 * @param {string} planId - ID del plan (gratuito, plus, premium)
 * @returns {Promise<Object>} Datos del plan
 */
async function obtenerPlan(planId) {
  const planes = await cargarPlanes();
  return planes[planId] || planes['gratuito'];
}

/**
 * Obtener lista de planes ordenados
 * @returns {Promise<Array>} Array de planes ordenados
 */
async function obtenerPlanesOrdenados() {
  const planes = await cargarPlanes();
  return Object.values(planes)
    .filter(p => p.activo !== false)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));
}

/**
 * Guardar planes en Firestore (solo admin)
 * @param {Object} planes - Objeto con planes
 */
async function guardarPlanes(planes) {
  await db.collection('config').doc('planes').set(planes);
  planesCache = planes;
}

/**
 * Guardar addons en Firestore (solo admin)
 * @param {Object} addons - Objeto con addons
 */
async function guardarAddonsConfig(addons) {
  await db.collection('config').doc('addons').set(addons);
  addonsCache = addons;
}

/**
 * Limpiar cache (para forzar recarga)
 */
function limpiarCachePlanes() {
  planesCache = null;
  addonsCache = null;
}

/**
 * Formatear precio para mostrar
 * @param {number} precio 
 * @param {boolean} anual 
 * @returns {string}
 */
function formatearPrecio(precio, anual = false) {
  if (precio === 0) return 'Gratis';
  return precio.toFixed(2).replace('.', ',') + '€' + (anual ? '/año' : '/mes');
}

// Exportar para uso global
window.PlanesConfig = {
  cargarPlanes,
  cargarAddons,
  obtenerPlan,
  obtenerPlanesOrdenados,
  guardarPlanes,
  guardarAddonsConfig,
  limpiarCachePlanes,
  formatearPrecio,
  PLANES_DEFAULT,
  ADDONS_DEFAULT
};
