/**
 * FAMILYNK - Sistema de Invitación de Usuarios
 * 
 * Este módulo gestiona la invitación de nuevos miembros a la familia.
 * 
 * USO:
 * 1. Incluir este script después de firebase-config.js
 * 2. Llamar a invitarUsuario() desde el Admin Panel
 * 
 * FLUJO:
 * 1. Admin crea invitación → Se crea usuario en Firebase Auth + documento en Firestore
 * 2. Usuario recibe email con contraseña provisional
 * 3. Usuario hace login → Sistema detecta primerAcceso=true → Cambiar contraseña
 * 4. Usuario cambia contraseña → Accede a CGI
 */

// Generar contraseña provisional aleatoria
function generarPasswordProvisional(longitud = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < longitud; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Invitar un nuevo usuario a la familia
 * 
 * @param {Object} datos - Datos del nuevo usuario
 * @param {string} datos.email - Email del usuario
 * @param {string} datos.nombre - Nombre completo
 * @param {string} datos.nidoId - ID del nido al que pertenece
 * @param {string} datos.nidoNombre - Nombre del nido
 * @param {string} datos.familiaId - ID de la familia
 * @param {string} datos.rol - "miembro" | "adminNido" | "adminSistema"
 * @param {string} datos.invitadoPor - UID del usuario que invita
 * @param {string} [datos.telefono] - Teléfono (opcional)
 * @param {string} [datos.generacion] - Generación en el árbol (opcional)
 * 
 * @returns {Object} { success, userId, passwordProvisional, error }
 */
async function invitarUsuario(datos) {
  const { email, nombre, nidoId, nidoNombre, familiaId, rol, invitadoPor, telefono, generacion } = datos;

  // Validaciones básicas
  if (!email || !nombre || !nidoId || !familiaId) {
    return { success: false, error: 'Faltan datos obligatorios (email, nombre, nidoId, familiaId)' };
  }

  const emailLower = email.toLowerCase().trim();

  // Verificar que el email no existe ya
  try {
    const existente = await db.collection('usuarios').where('email', '==', emailLower).get();
    if (!existente.empty) {
      return { success: false, error: 'Ya existe un usuario con este email' };
    }
  } catch (e) {
    console.error('Error verificando email:', e);
  }

  // Generar contraseña provisional
  const passwordProvisional = generarPasswordProvisional();

  try {
    // 1. Crear usuario en Firebase Auth usando Admin SDK o Cloud Function
    // NOTA: Desde el cliente no se puede crear usuarios sin hacer login con ellos.
    // Por ahora, creamos solo el documento en Firestore y el usuario se registrará con el email.
    
    // Alternativa: Usar Cloud Functions (recomendado para producción)
    // Por ahora, simulamos creando el documento y el admin comunica la contraseña manualmente
    
    // Crear documento de invitación pendiente
    const invitacionRef = await db.collection('invitaciones').add({
      email: emailLower,
      nombre: nombre,
      nidoId: nidoId,
      nidoNombre: nidoNombre,
      familiaId: familiaId,
      rol: rol || 'miembro',
      telefono: telefono || null,
      generacion: generacion || null,
      passwordProvisional: passwordProvisional, // En producción, hashear o no guardar
      invitadoPor: invitadoPor,
      fechaInvitacion: firebase.firestore.FieldValue.serverTimestamp(),
      estado: 'pendiente', // pendiente | aceptada | expirada
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
    });

    // 2. Preparar datos para cuando el usuario se registre
    // Se procesará en el registro o mediante Cloud Function

    return {
      success: true,
      invitacionId: invitacionRef.id,
      passwordProvisional: passwordProvisional,
      mensaje: `Invitación creada. Comunica al usuario:\n\nEmail: ${emailLower}\nContraseña provisional: ${passwordProvisional}\n\nDebe registrarse en FAMILYNK con estos datos.`
    };

  } catch (error) {
    console.error('Error creando invitación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Procesar una invitación cuando el usuario se registra
 * Llamar después de crear la cuenta en Firebase Auth
 * 
 * @param {string} email - Email del usuario registrado
 * @param {string} uid - UID del usuario en Firebase Auth
 */
async function procesarInvitacion(email, uid) {
  const emailLower = email.toLowerCase().trim();

  try {
    // Buscar invitación pendiente
    const invitacionQuery = await db.collection('invitaciones')
      .where('email', '==', emailLower)
      .where('estado', '==', 'pendiente')
      .limit(1)
      .get();

    if (invitacionQuery.empty) {
      console.log('No hay invitación pendiente para este email');
      return { success: false, error: 'No hay invitación pendiente' };
    }

    const invitacionDoc = invitacionQuery.docs[0];
    const invitacion = invitacionDoc.data();

    // Verificar que no ha expirado
    if (invitacion.fechaExpiracion && invitacion.fechaExpiracion.toDate() < new Date()) {
      await invitacionDoc.ref.update({ estado: 'expirada' });
      return { success: false, error: 'La invitación ha expirado' };
    }

    // Crear documento de usuario
    await db.collection('usuarios').doc(uid).set({
      email: emailLower,
      nombre: invitacion.nombre,
      nidoId: invitacion.nidoId,
      nidoNombre: invitacion.nidoNombre,
      familiaId: invitacion.familiaId,
      rol: invitacion.rol || 'miembro',
      telefono: invitacion.telefono || null,
      generacion: invitacion.generacion || null,
      primerAcceso: true,
      invitadoPor: invitacion.invitadoPor,
      fechaInvitacion: invitacion.fechaInvitacion,
      fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
      activo: true,
      // Permisos por defecto según rol
      permisos: obtenerPermisosDefecto(invitacion.rol)
    });

    // Añadir usuario al nido
    await db.collection('nidos').doc(invitacion.nidoId).update({
      miembros: firebase.firestore.FieldValue.arrayUnion({
        odId: uid,
        nombre: invitacion.nombre,
        rol: invitacion.rol
      })
    });

    // Marcar invitación como aceptada
    await invitacionDoc.ref.update({
      estado: 'aceptada',
      odIdUsuario: uid,
      fechaAceptacion: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, usuario: invitacion };

  } catch (error) {
    console.error('Error procesando invitación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener permisos por defecto según el rol
 */
function obtenerPermisosDefecto(rol) {
  switch (rol) {
    case 'adminSistema':
      return {
        verTodo: true,
        editarTodo: true,
        invitarUsuarios: true,
        eliminarUsuarios: true,
        gestionarNidos: true,
        gestionarFamilia: true
      };
    case 'adminNido':
      return {
        verNido: true,
        editarNido: true,
        invitarAlNido: true,
        gestionarMiembrosNido: true
      };
    default: // miembro
      return {
        verNido: true,
        editarPropio: true
      };
  }
}

/**
 * Enviar email de invitación
 * NOTA: Requiere configurar un servicio de email (SendGrid, Mailgun, etc.)
 * Por ahora, solo prepara los datos. Implementar en Cloud Function para producción.
 */
async function enviarEmailInvitacion(invitacionId) {
  try {
    const invDoc = await db.collection('invitaciones').doc(invitacionId).get();
    
    if (!invDoc.exists) {
      return { success: false, error: 'Invitación no encontrada' };
    }

    const inv = invDoc.data();

    // Datos para el email
    const emailData = {
      to: inv.email,
      subject: `${inv.invitadoPorNombre || 'Alguien'} te ha invitado a FAMILYNK`,
      template: 'invitacion',
      data: {
        nombre: inv.nombre,
        nidoNombre: inv.nidoNombre,
        passwordProvisional: inv.passwordProvisional,
        linkAcceso: 'https://familynk.vercel.app/login.html',
        fechaExpiracion: inv.fechaExpiracion?.toDate().toLocaleDateString('es-ES')
      }
    };

    // En producción: llamar a Cloud Function o API de email
    // await functions.httpsCallable('enviarEmail')(emailData);

    console.log('📧 Email preparado (pendiente implementar envío):', emailData);

    // Marcar que se ha enviado el email
    await db.collection('invitaciones').doc(invitacionId).update({
      emailEnviado: true,
      fechaEmailEnviado: firebase.firestore.FieldValue.serverTimestamp()
    });

    return { 
      success: true, 
      mensaje: 'Email preparado. En producción se enviará automáticamente.',
      emailData 
    };

  } catch (error) {
    console.error('Error preparando email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Listar invitaciones de una familia
 */
async function listarInvitaciones(familiaId, estado = null) {
  try {
    let query = db.collection('invitaciones').where('familiaId', '==', familiaId);
    
    if (estado) {
      query = query.where('estado', '==', estado);
    }
    
    const snap = await query.orderBy('fechaInvitacion', 'desc').get();
    
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Error listando invitaciones:', error);
    return [];
  }
}

/**
 * Cancelar/eliminar una invitación pendiente
 */
async function cancelarInvitacion(invitacionId) {
  try {
    await db.collection('invitaciones').doc(invitacionId).update({
      estado: 'cancelada',
      fechaCancelacion: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Reenviar invitación (generar nueva contraseña)
 */
async function reenviarInvitacion(invitacionId) {
  try {
    const nuevaPassword = generarPasswordProvisional();
    
    await db.collection('invitaciones').doc(invitacionId).update({
      passwordProvisional: nuevaPassword,
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      emailEnviado: false
    });

    return { 
      success: true, 
      passwordProvisional: nuevaPassword,
      mensaje: 'Invitación actualizada con nueva contraseña provisional.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Exportar funciones (si se usa como módulo)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    invitarUsuario,
    procesarInvitacion,
    enviarEmailInvitacion,
    listarInvitaciones,
    cancelarInvitacion,
    reenviarInvitacion,
    generarPasswordProvisional
  };
}
