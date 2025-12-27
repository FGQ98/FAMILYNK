/**
 * FAMILYNK - Utilidades de Visibilidad
 * 
 * Funciones compartidas para manejar niveles de visibilidad:
 * - rama: visible para toda la familia
 * - estirpe: visible para el nido creador y sus descendientes
 * - nido: visible solo para el nido creador
 */

// Variables globales que deben existir en cada página
// let userNidoId = null;
// let cadenaAncestros = [];

/**
 * Construye la cadena de nidos ancestros subiendo por nidoOrigen
 * @param {string} nidoId - ID del nido del usuario
 * @param {object} db - Referencia a Firestore
 */
async function construirCadenaAncestros(nidoId, db) {
  const cadena = [nidoId];
  let currentNidoId = nidoId;
  let iteraciones = 0;
  const maxIteraciones = 10;

  while (currentNidoId && iteraciones < maxIteraciones) {
    try {
      const nidoDoc = await db.collection('nidos').doc(currentNidoId).get();
      if (!nidoDoc.exists) break;
      
      const nidoOrigen = nidoDoc.data().nidoOrigen;
      if (nidoOrigen && !cadena.includes(nidoOrigen)) {
        cadena.push(nidoOrigen);
        currentNidoId = nidoOrigen;
      } else {
        break;
      }
    } catch (e) {
      console.warn('Error construyendo cadena ancestros:', e);
      break;
    }
    iteraciones++;
  }
  
  console.log('📍 Cadena de ancestros:', cadena);
  return cadena;
}

/**
 * Filtra un array de elementos según visibilidad
 * @param {Array} elementos - Array de elementos con campos visibilidad y nidoCreadorId
 * @param {string} userNidoId - ID del nido del usuario
 * @param {Array} cadenaAncestros - Array de IDs de nidos ancestros
 * @returns {Array} Elementos filtrados
 */
function filtrarPorVisibilidad(elementos, userNidoId, cadenaAncestros) {
  return elementos.filter(elem => {
    const visibilidad = elem.visibilidad || 'rama';
    
    if (visibilidad === 'rama') {
      return true;
    }
    
    if (visibilidad === 'nido') {
      return elem.nidoCreadorId === userNidoId;
    }
    
    if (visibilidad === 'estirpe') {
      return cadenaAncestros.includes(elem.nidoCreadorId);
    }
    
    return true;
  });
}

/**
 * Genera el HTML del badge de visibilidad
 * @param {string} visibilidad - 'rama', 'estirpe' o 'nido'
 * @returns {string} HTML del badge
 */
function getBadgeVisibilidad(visibilidad) {
  const vis = visibilidad || 'rama';
  const icons = { rama: '🌳', estirpe: '👨‍👩‍👧‍👦', nido: '🏠' };
  return `<span class="visibilidad-badge ${vis}">${icons[vis]}</span>`;
}

/**
 * CSS común para el selector de visibilidad (para incluir en estilos)
 */
const CSS_VISIBILIDAD = `
  .visibilidad-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .visibilidad-option {
    flex: 1;
    cursor: pointer;
  }

  .visibilidad-option input { display: none; }

  .visibilidad-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 8px;
    background: var(--cream, #FAF5EF);
    border: 2px solid transparent;
    border-radius: 12px;
    transition: all 0.2s;
    text-align: center;
  }

  .visibilidad-option input:checked + .visibilidad-box {
    border-color: var(--sage, #7A9E7E);
    background: rgba(122, 158, 126, 0.15);
  }

  .visibilidad-box:hover { border-color: var(--sage-light, #9BB89E); }
  .visibilidad-icon { font-size: 1.6rem; }
  .visibilidad-name { font-weight: 700; font-size: 0.8rem; }
  .visibilidad-desc { font-size: 0.7rem; color: #9A9A9A; line-height: 1.3; }

  .visibilidad-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 0.7rem;
  }
  .visibilidad-badge.rama { background: rgba(122, 158, 126, 0.2); }
  .visibilidad-badge.estirpe { background: rgba(193, 119, 87, 0.2); }
  .visibilidad-badge.nido { background: rgba(91, 123, 163, 0.2); }
`;

/**
 * HTML del selector de visibilidad para formularios
 */
const HTML_SELECTOR_VISIBILIDAD = `
  <div class="form-group">
    <label class="form-label">🔒 ¿Quién puede ver esto?</label>
    <div class="visibilidad-selector">
      <label class="visibilidad-option">
        <input type="radio" name="visibilidad" value="rama" checked>
        <div class="visibilidad-box">
          <span class="visibilidad-icon">🌳</span>
          <span class="visibilidad-name">Rama</span>
          <span class="visibilidad-desc">Toda la familia</span>
        </div>
      </label>
      <label class="visibilidad-option">
        <input type="radio" name="visibilidad" value="estirpe">
        <div class="visibilidad-box">
          <span class="visibilidad-icon">👨‍👩‍👧‍👦</span>
          <span class="visibilidad-name">Estirpe</span>
          <span class="visibilidad-desc">Tu nido y descendientes</span>
        </div>
      </label>
      <label class="visibilidad-option">
        <input type="radio" name="visibilidad" value="nido">
        <div class="visibilidad-box">
          <span class="visibilidad-icon">🏠</span>
          <span class="visibilidad-name">Nido</span>
          <span class="visibilidad-desc">Solo tu nido</span>
        </div>
      </label>
    </div>
  </div>
`;
