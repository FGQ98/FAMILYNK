/**
 * FAMILYNK - Sistema de Numeración
 * 
 * NIDOS: Código jerárquico (1, 1.1, 1.2, 1.1.1, etc.)
 * MIEMBROS: Correlativo por edad (#1, #2, #3, etc.)
 */

// ============================================
// NUMERACIÓN DE NIDOS
// ============================================

/**
 * Calcula los códigos de todos los nidos de una familia
 * @param {Array} nidos - Array de nidos con {id, nidoOrigen, miembrosData}
 * @returns {Object} - Mapa de {nidoId: codigoNido}
 */
function calcularCodigosNidos(nidos) {
  const codigosNidos = {};
  
  // 1. Encontrar el nido raíz (sin nidoOrigen o nidoOrigen null)
  const nidoRaiz = nidos.find(n => !n.nidoOrigen);
  if (!nidoRaiz) {
    console.warn('No se encontró nido raíz');
    return codigosNidos;
  }
  
  // 2. Asignar código "1" al nido raíz
  codigosNidos[nidoRaiz.id] = '1';
  
  // 3. Construir árbol de nidos hijos
  const hijosPorPadre = {};
  nidos.forEach(n => {
    if (n.nidoOrigen) {
      if (!hijosPorPadre[n.nidoOrigen]) {
        hijosPorPadre[n.nidoOrigen] = [];
      }
      hijosPorPadre[n.nidoOrigen].push(n);
    }
  });
  
  // 4. Función recursiva para asignar códigos
  function asignarCodigosHijos(nidoPadreId, codigoPadre) {
    const hijos = hijosPorPadre[nidoPadreId] || [];
    
    // Ordenar hijos por edad del miembro fundador (el más viejo primero)
    hijos.sort((a, b) => {
      const edadA = obtenerEdadFundador(a);
      const edadB = obtenerEdadFundador(b);
      return edadA - edadB; // Más viejo = fecha más antigua = número menor
    });
    
    // Asignar códigos
    hijos.forEach((hijo, index) => {
      const codigoHijo = `${codigoPadre}.${index + 1}`;
      codigosNidos[hijo.id] = codigoHijo;
      
      // Recursión para nietos
      asignarCodigosHijos(hijo.id, codigoHijo);
    });
  }
  
  // 5. Iniciar recursión desde el nido raíz
  asignarCodigosHijos(nidoRaiz.id, '1');
  
  return codigosNidos;
}

/**
 * Obtiene la fecha de nacimiento del fundador del nido
 * El fundador es el miembro que "salió" del nido padre (normalmente el padre/madre más joven
 * o el que tiene rol de conexión)
 * Por simplicidad: usamos el miembro más viejo con rol padre/madre
 */
function obtenerEdadFundador(nido) {
  const miembros = nido.miembrosData || [];
  
  // Buscar padres/madres ordenados por edad
  const padres = miembros.filter(m => 
    m.rol === 'padre' || m.rol === 'madre' || 
    m.rol === 'Padre' || m.rol === 'Madre' ||
    m.parentesco === 'padre' || m.parentesco === 'madre'
  );
  
  if (padres.length > 0) {
    // Ordenar por fecha nacimiento y devolver la más antigua
    padres.sort((a, b) => {
      const fechaA = a.fechaNacimiento ? new Date(a.fechaNacimiento) : new Date();
      const fechaB = b.fechaNacimiento ? new Date(b.fechaNacimiento) : new Date();
      return fechaA - fechaB;
    });
    return padres[0].fechaNacimiento ? new Date(padres[0].fechaNacimiento) : new Date();
  }
  
  // Si no hay padres definidos, usar el miembro más viejo
  if (miembros.length > 0) {
    const ordenados = [...miembros].sort((a, b) => {
      const fechaA = a.fechaNacimiento ? new Date(a.fechaNacimiento) : new Date();
      const fechaB = b.fechaNacimiento ? new Date(b.fechaNacimiento) : new Date();
      return fechaA - fechaB;
    });
    return ordenados[0].fechaNacimiento ? new Date(ordenados[0].fechaNacimiento) : new Date();
  }
  
  return new Date(); // Fallback
}

/**
 * Obtiene el código de un nido específico
 */
function obtenerCodigoNido(nidoId, todosLosNidos) {
  const codigos = calcularCodigosNidos(todosLosNidos);
  return codigos[nidoId] || null;
}


// ============================================
// NUMERACIÓN DE MIEMBROS
// ============================================

/**
 * Calcula los números de todos los miembros de una familia
 * @param {Array} nidos - Array de nidos con miembrosData
 * @returns {Object} - Mapa de {miembroId/email: numeroMiembro}
 */
function calcularNumerosMiembros(nidos) {
  const numerosMiembros = {};
  
  // 1. Recoger todos los miembros de todos los nidos
  const todosMiembros = [];
  
  nidos.forEach(nido => {
    const miembros = nido.miembrosData || [];
    miembros.forEach(m => {
      // Evitar duplicados (un miembro puede aparecer en varios nidos)
      const idUnico = m.uid || m.email || m.id || `${nido.id}-${m.nombre}`;
      
      if (!todosMiembros.find(tm => tm.idUnico === idUnico)) {
        todosMiembros.push({
          ...m,
          idUnico,
          nidoId: nido.id,
          fechaNacimientoDate: m.fechaNacimiento ? new Date(m.fechaNacimiento) : null
        });
      }
    });
  });
  
  // 2. Ordenar por fecha de nacimiento (más viejo primero)
  todosMiembros.sort((a, b) => {
    // Los que no tienen fecha van al final
    if (!a.fechaNacimientoDate && !b.fechaNacimientoDate) return 0;
    if (!a.fechaNacimientoDate) return 1;
    if (!b.fechaNacimientoDate) return -1;
    return a.fechaNacimientoDate - b.fechaNacimientoDate;
  });
  
  // 3. Asignar números correlativos
  todosMiembros.forEach((miembro, index) => {
    numerosMiembros[miembro.idUnico] = index + 1;
  });
  
  return numerosMiembros;
}

/**
 * Obtiene el número de un miembro específico
 */
function obtenerNumeroMiembro(miembroIdOrEmail, todosLosNidos) {
  const numeros = calcularNumerosMiembros(todosLosNidos);
  return numeros[miembroIdOrEmail] || null;
}


// ============================================
// ACTUALIZACIÓN EN FIRESTORE
// ============================================

/**
 * Actualiza los códigos de nidos en Firestore
 * @param {Firestore} db - Instancia de Firestore
 * @param {string} familiaId - ID de la familia
 */
async function actualizarCodigosNidosEnFirestore(db, familiaId) {
  try {
    // 1. Cargar todos los nidos de la familia
    const nidosSnap = await db.collection('nidos')
      .where('familiaId', '==', familiaId)
      .get();
    
    const nidos = nidosSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 2. Calcular códigos
    const codigos = calcularCodigosNidos(nidos);
    
    // 3. Actualizar cada nido
    const batch = db.batch();
    
    Object.entries(codigos).forEach(([nidoId, codigo]) => {
      const nidoRef = db.collection('nidos').doc(nidoId);
      batch.update(nidoRef, { codigoNido: codigo });
    });
    
    await batch.commit();
    
    console.log(`✅ Códigos de nidos actualizados: ${Object.keys(codigos).length} nidos`);
    return codigos;
    
  } catch (error) {
    console.error('Error actualizando códigos de nidos:', error);
    throw error;
  }
}

/**
 * Actualiza los números de miembros en Firestore
 * Guarda el número en cada miembro dentro de miembrosData
 * @param {Firestore} db - Instancia de Firestore
 * @param {string} familiaId - ID de la familia
 */
async function actualizarNumerosMiembrosEnFirestore(db, familiaId) {
  try {
    // 1. Cargar todos los nidos de la familia
    const nidosSnap = await db.collection('nidos')
      .where('familiaId', '==', familiaId)
      .get();
    
    const nidos = nidosSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 2. Calcular números
    const numeros = calcularNumerosMiembros(nidos);
    
    // 3. Actualizar miembrosData en cada nido
    const batch = db.batch();
    let totalActualizados = 0;
    
    nidos.forEach(nido => {
      const miembrosActualizados = (nido.miembrosData || []).map(m => {
        const idUnico = m.uid || m.email || m.id || `${nido.id}-${m.nombre}`;
        const numero = numeros[idUnico];
        
        if (numero) {
          totalActualizados++;
          return { ...m, numeroMiembro: numero };
        }
        return m;
      });
      
      const nidoRef = db.collection('nidos').doc(nido.id);
      batch.update(nidoRef, { miembrosData: miembrosActualizados });
    });
    
    await batch.commit();
    
    console.log(`✅ Números de miembros actualizados: ${totalActualizados} miembros`);
    return numeros;
    
  } catch (error) {
    console.error('Error actualizando números de miembros:', error);
    throw error;
  }
}

/**
 * Ejecuta la numeración completa de una familia
 * @param {Firestore} db - Instancia de Firestore
 * @param {string} familiaId - ID de la familia
 */
async function ejecutarNumeracionCompleta(db, familiaId) {
  console.log('🔢 Iniciando numeración completa para familia:', familiaId);
  
  const resultados = {
    codigosNidos: {},
    numerosMiembros: {},
    errores: []
  };
  
  try {
    // 1. Numerar nidos
    resultados.codigosNidos = await actualizarCodigosNidosEnFirestore(db, familiaId);
  } catch (error) {
    resultados.errores.push({ tipo: 'nidos', error: error.message });
  }
  
  try {
    // 2. Numerar miembros
    resultados.numerosMiembros = await actualizarNumerosMiembrosEnFirestore(db, familiaId);
  } catch (error) {
    resultados.errores.push({ tipo: 'miembros', error: error.message });
  }
  
  console.log('🏁 Numeración completada:', resultados);
  return resultados;
}


// ============================================
// UTILIDADES
// ============================================

/**
 * Obtiene la generación de un nido basándose en su código
 * @param {string} codigoNido - Ej: "1.2.3"
 * @returns {number} - Nivel de generación (1 = raíz, 2 = hijos, etc.)
 */
function obtenerGeneracion(codigoNido) {
  if (!codigoNido) return 0;
  return codigoNido.split('.').length;
}

/**
 * Verifica si un nido es ancestro de otro
 * @param {string} codigoAncestro - Ej: "1.2"
 * @param {string} codigoDescendiente - Ej: "1.2.3.1"
 * @returns {boolean}
 */
function esAncestro(codigoAncestro, codigoDescendiente) {
  if (!codigoAncestro || !codigoDescendiente) return false;
  return codigoDescendiente.startsWith(codigoAncestro + '.');
}

/**
 * Verifica si dos nidos son de la misma estirpe
 * (comparten el mismo prefijo hasta el segundo nivel)
 */
function esMismaEstirpe(codigo1, codigo2) {
  if (!codigo1 || !codigo2) return false;
  
  const partes1 = codigo1.split('.');
  const partes2 = codigo2.split('.');
  
  // Si ambos están en nivel 1, son la misma estirpe (toda la rama)
  if (partes1.length === 1 && partes2.length === 1) return true;
  
  // Comparar primer nivel de descendencia
  const base1 = partes1.slice(0, 2).join('.');
  const base2 = partes2.slice(0, 2).join('.');
  
  return base1 === base2;
}

/**
 * Obtiene todos los códigos de nidos de una estirpe
 * @param {string} codigoBase - Código del nido base de la estirpe
 * @param {Object} todosLosCodigos - Mapa {nidoId: codigo}
 * @returns {Array} - Array de códigos que pertenecen a esa estirpe
 */
function obtenerCodigosEstirpe(codigoBase, todosLosCodigos) {
  return Object.values(todosLosCodigos).filter(codigo => 
    codigo === codigoBase || codigo.startsWith(codigoBase + '.')
  );
}


// Exportar para uso en módulos (si se usa con bundler)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calcularCodigosNidos,
    calcularNumerosMiembros,
    actualizarCodigosNidosEnFirestore,
    actualizarNumerosMiembrosEnFirestore,
    ejecutarNumeracionCompleta,
    obtenerCodigoNido,
    obtenerNumeroMiembro,
    obtenerGeneracion,
    esAncestro,
    esMismaEstirpe,
    obtenerCodigosEstirpe
  };
}
