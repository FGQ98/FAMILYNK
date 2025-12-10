/**
 * FAMILYNK - Módulos CGI
 * Gestión de: Tareas, Buzón, Tablón, Menús
 * 
 * ESTRUCTURA FIRESTORE:
 * 
 * tareas/{tareaId}
 * ├── titulo: string
 * ├── descripcion: string
 * ├── nidoId: string
 * ├── familiaId: string
 * ├── asignadoA: string (uid o nombre)
 * ├── asignadoPor: string (uid)
 * ├── prioridad: "alta" | "media" | "baja"
 * ├── completada: boolean
 * ├── fechaLimite: timestamp
 * ├── fechaCreacion: timestamp
 * └── fechaCompletada: timestamp | null
 * 
 * mensajes/{mensajeId}
 * ├── de: string (uid)
 * ├── para: string (uid)
 * ├── deNombre: string
 * ├── paraNombre: string
 * ├── asunto: string
 * ├── contenido: string
 * ├── familiaId: string
 * ├── leido: boolean
 * ├── fechaCreacion: timestamp
 * └── fechaLectura: timestamp | null
 * 
 * anuncios/{anuncioId}
 * ├── titulo: string
 * ├── contenido: string
 * ├── tipo: "info" | "convocatoria" | "urgente"
 * ├── nidoId: string (null = toda la familia)
 * ├── familiaId: string
 * ├── autor: string (uid)
 * ├── autorNombre: string
 * ├── fechaEvento: timestamp | null
 * ├── fechaCreacion: timestamp
 * └── activo: boolean
 * 
 * menus/{menuId}
 * ├── fecha: string (YYYY-MM-DD)
 * ├── nidoId: string
 * ├── familiaId: string
 * ├── comida: string
 * ├── cena: string
 * ├── notas: string
 * └── creadoPor: string (uid)
 */

// ============ TAREAS ============

const TareasModule = {
  
  // Cargar tareas del nido
  async cargarTareas(nidoId, familiaId, limite = 5) {
    try {
      const snapshot = await db.collection('tareas')
        .where('familiaId', '==', familiaId)
        .where('nidoId', '==', nidoId)
        .orderBy('completada')
        .orderBy('prioridad')
        .orderBy('fechaCreacion', 'desc')
        .limit(limite)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error cargando tareas:', error);
      return [];
    }
  },

  // Crear tarea
  async crearTarea(datos) {
    try {
      const tareaRef = await db.collection('tareas').add({
        titulo: datos.titulo,
        descripcion: datos.descripcion || '',
        nidoId: datos.nidoId,
        familiaId: datos.familiaId,
        asignadoA: datos.asignadoA || null,
        asignadoPor: datos.asignadoPor,
        prioridad: datos.prioridad || 'media',
        completada: false,
        fechaLimite: datos.fechaLimite || null,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
        fechaCompletada: null
      });
      return tareaRef.id;
    } catch (error) {
      console.error('Error creando tarea:', error);
      throw error;
    }
  },

  // Toggle completada
  async toggleTarea(tareaId, completada) {
    try {
      await db.collection('tareas').doc(tareaId).update({
        completada: completada,
        fechaCompletada: completada ? firebase.firestore.FieldValue.serverTimestamp() : null
      });
    } catch (error) {
      console.error('Error actualizando tarea:', error);
      throw error;
    }
  },

  // Eliminar tarea
  async eliminarTarea(tareaId) {
    try {
      await db.collection('tareas').doc(tareaId).delete();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
      throw error;
    }
  },

  // Render en CGI
  render(tareas, containerId) {
    const container = document.getElementById(containerId);
    
    if (!tareas || tareas.length === 0) {
      container.innerHTML = '<div class="empty-mini"><div class="empty-mini-icon">✅</div>Sin tareas pendientes</div>';
      return;
    }

    container.innerHTML = tareas.map(t => `
      <div class="tarea-item" data-id="${t.id}">
        <div class="tarea-check ${t.completada ? 'done' : ''}" onclick="TareasModule.toggle('${t.id}', ${!t.completada})">
          ${t.completada ? '✓' : ''}
        </div>
        <div class="tarea-content">
          <div class="tarea-titulo ${t.completada ? 'done' : ''}">${t.titulo}</div>
          <div class="tarea-asignado">${t.asignadoA || 'Sin asignar'}</div>
        </div>
        <div class="tarea-prioridad ${t.prioridad}"></div>
      </div>
    `).join('');
  },

  // Wrapper para toggle desde HTML
  async toggle(tareaId, nuevoEstado) {
    await this.toggleTarea(tareaId, nuevoEstado);
    // Recargar - el CGI debería escuchar cambios
    if (window.recargarTareas) window.recargarTareas();
  }
};


// ============ BUZÓN (Mensajes) ============

const BuzonModule = {

  // Cargar mensajes recibidos
  async cargarMensajes(userId, familiaId, limite = 5) {
    try {
      const snapshot = await db.collection('mensajes')
        .where('familiaId', '==', familiaId)
        .where('para', '==', userId)
        .orderBy('fechaCreacion', 'desc')
        .limit(limite)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      return [];
    }
  },

  // Enviar mensaje
  async enviarMensaje(datos) {
    try {
      const mensajeRef = await db.collection('mensajes').add({
        de: datos.de,
        para: datos.para,
        deNombre: datos.deNombre,
        paraNombre: datos.paraNombre,
        asunto: datos.asunto || '',
        contenido: datos.contenido,
        familiaId: datos.familiaId,
        leido: false,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
        fechaLectura: null
      });
      return mensajeRef.id;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  },

  // Marcar como leído
  async marcarLeido(mensajeId) {
    try {
      await db.collection('mensajes').doc(mensajeId).update({
        leido: true,
        fechaLectura: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error marcando mensaje:', error);
      throw error;
    }
  },

  // Contar no leídos
  async contarNoLeidos(userId, familiaId) {
    try {
      const snapshot = await db.collection('mensajes')
        .where('familiaId', '==', familiaId)
        .where('para', '==', userId)
        .where('leido', '==', false)
        .get();
      return snapshot.size;
    } catch (error) {
      return 0;
    }
  },

  // Formatear tiempo
  formatearTiempo(timestamp) {
    if (!timestamp) return '';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fecha.toDateString() === hoy.toDateString()) {
      return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  },

  // Render en CGI
  render(mensajes, containerId) {
    const container = document.getElementById(containerId);
    
    if (!mensajes || mensajes.length === 0) {
      container.innerHTML = '<div class="empty-mini"><div class="empty-mini-icon">📭</div>Sin mensajes</div>';
      return;
    }

    container.innerHTML = mensajes.map(m => {
      const iniciales = m.deNombre ? m.deNombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
      const tiempo = this.formatearTiempo(m.fechaCreacion);
      
      return `
        <div class="mensaje-item ${m.leido ? '' : 'no-leido'}" onclick="BuzonModule.abrir('${m.id}')">
          <div class="mensaje-avatar">${iniciales}</div>
          <div class="mensaje-content">
            <div class="mensaje-from">${m.deNombre || 'Desconocido'}</div>
            <div class="mensaje-preview">${m.contenido?.substring(0, 40) || ''}${m.contenido?.length > 40 ? '...' : ''}</div>
          </div>
          <span class="mensaje-time">${tiempo}</span>
          ${m.leido ? '' : '<div class="mensaje-badge"></div>'}
        </div>
      `;
    }).join('');
  },

  // Abrir mensaje
  async abrir(mensajeId) {
    // Marcar como leído
    await this.marcarLeido(mensajeId);
    // Navegar a la conversación
    window.location.href = `buzon.html?id=${mensajeId}`;
  }
};


// ============ TABLÓN (Anuncios) ============

const TablonModule = {

  // Cargar anuncios
  async cargarAnuncios(familiaId, nidoId = null, limite = 5) {
    try {
      let query = db.collection('anuncios')
        .where('familiaId', '==', familiaId)
        .where('activo', '==', true)
        .orderBy('fechaCreacion', 'desc')
        .limit(limite);

      const snapshot = await query.get();

      // Filtrar: mostrar los de toda la familia (nidoId=null) y los del nido específico
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => !a.nidoId || a.nidoId === nidoId);

    } catch (error) {
      console.error('Error cargando anuncios:', error);
      return [];
    }
  },

  // Crear anuncio
  async crearAnuncio(datos) {
    try {
      const anuncioRef = await db.collection('anuncios').add({
        titulo: datos.titulo,
        contenido: datos.contenido,
        tipo: datos.tipo || 'info',
        nidoId: datos.nidoId || null, // null = toda la familia
        familiaId: datos.familiaId,
        autor: datos.autor,
        autorNombre: datos.autorNombre,
        fechaEvento: datos.fechaEvento || null,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
        activo: true
      });
      return anuncioRef.id;
    } catch (error) {
      console.error('Error creando anuncio:', error);
      throw error;
    }
  },

  // Archivar anuncio
  async archivarAnuncio(anuncioId) {
    try {
      await db.collection('anuncios').doc(anuncioId).update({
        activo: false
      });
    } catch (error) {
      console.error('Error archivando anuncio:', error);
      throw error;
    }
  },

  // Formatear fecha
  formatearFecha(timestamp) {
    if (!timestamp) return '';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fecha.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  },

  // Render en CGI
  render(anuncios, containerId) {
    const container = document.getElementById(containerId);
    
    if (!anuncios || anuncios.length === 0) {
      container.innerHTML = '<div class="empty-mini"><div class="empty-mini-icon">📢</div>Sin anuncios</div>';
      return;
    }

    const tipoLabels = {
      'info': 'ℹ️ Info',
      'convocatoria': '📣 Convocatoria',
      'urgente': '🚨 Urgente'
    };

    container.innerHTML = anuncios.map(a => `
      <div class="anuncio-item">
        <div class="anuncio-header">
          <span class="anuncio-tipo ${a.tipo}">${tipoLabels[a.tipo] || a.tipo}</span>
          <span class="anuncio-fecha">${this.formatearFecha(a.fechaCreacion)}</span>
        </div>
        <div class="anuncio-titulo">${a.titulo}</div>
        <div class="anuncio-texto">${a.contenido?.substring(0, 80) || ''}${a.contenido?.length > 80 ? '...' : ''}</div>
      </div>
    `).join('');
  }
};


// ============ MENÚS ============

const MenusModule = {

  // Cargar menús de la semana
  async cargarMenus(nidoId, familiaId, dias = 7) {
    try {
      const hoy = new Date();
      const fechaInicio = hoy.toISOString().split('T')[0];
      
      const snapshot = await db.collection('menus')
        .where('familiaId', '==', familiaId)
        .where('nidoId', '==', nidoId)
        .where('fecha', '>=', fechaInicio)
        .orderBy('fecha')
        .limit(dias)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error cargando menús:', error);
      return [];
    }
  },

  // Guardar menú de un día
  async guardarMenu(datos) {
    try {
      // Buscar si ya existe menú para ese día
      const existing = await db.collection('menus')
        .where('familiaId', '==', datos.familiaId)
        .where('nidoId', '==', datos.nidoId)
        .where('fecha', '==', datos.fecha)
        .get();

      if (!existing.empty) {
        // Actualizar existente
        await db.collection('menus').doc(existing.docs[0].id).update({
          comida: datos.comida,
          cena: datos.cena,
          notas: datos.notas || ''
        });
        return existing.docs[0].id;
      } else {
        // Crear nuevo
        const menuRef = await db.collection('menus').add({
          fecha: datos.fecha,
          nidoId: datos.nidoId,
          familiaId: datos.familiaId,
          comida: datos.comida,
          cena: datos.cena,
          notas: datos.notas || '',
          creadoPor: datos.creadoPor
        });
        return menuRef.id;
      }
    } catch (error) {
      console.error('Error guardando menú:', error);
      throw error;
    }
  },

  // Generar fechas de próximos días
  getProximosDias(cantidad) {
    const dias = [];
    const hoy = new Date();
    
    for (let i = 0; i < cantidad; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      dias.push({
        fecha: fecha.toISOString().split('T')[0],
        diaSemana: fecha.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
        esHoy: i === 0
      });
    }
    
    return dias;
  },

  // Render en CGI
  render(menus, containerId) {
    const container = document.getElementById(containerId);
    const proximosDias = this.getProximosDias(3);
    
    // Crear mapa de menús por fecha
    const menusPorFecha = {};
    menus.forEach(m => {
      menusPorFecha[m.fecha] = m;
    });

    container.innerHTML = proximosDias.map(dia => {
      const menu = menusPorFecha[dia.fecha];
      
      return `
        <div class="menu-dia">
          <div class="menu-dia-label ${dia.esHoy ? 'hoy' : ''}">${dia.esHoy ? 'HOY' : dia.diaSemana}</div>
          <div class="menu-comidas">
            ${menu ? `
              <div class="menu-comida"><span class="menu-comida-tipo">🍽️</span> ${menu.comida || '—'}</div>
              <div class="menu-comida"><span class="menu-comida-tipo">🌙</span> ${menu.cena || '—'}</div>
            ` : `
              <div class="menu-comida" style="color:var(--text-muted);font-style:italic;">Sin planificar</div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }
};


// ============ CALENDARIO (Eventos) ============

const CalendarioModule = {

  // Cargar eventos del mes
  async cargarEventos(familiaId, mes, año) {
    try {
      const inicioMes = new Date(año, mes, 1);
      const finMes = new Date(año, mes + 1, 0, 23, 59, 59);

      const snapshot = await db.collection('eventos')
        .where('familiaId', '==', familiaId)
        .where('fecha', '>=', inicioMes)
        .where('fecha', '<=', finMes)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error cargando eventos:', error);
      return [];
    }
  },

  // Cargar cumpleaños del mes (desde miembrosData de nidos)
  async cargarCumples(familiaId, mes) {
    try {
      const nidosSnap = await db.collection('nidos')
        .where('familiaId', '==', familiaId)
        .get();

      const cumples = [];
      
      nidosSnap.forEach(doc => {
        const nido = doc.data();
        if (nido.miembrosData) {
          nido.miembrosData.forEach(m => {
            if (m.fechaNacimiento && !m.fechaDefuncion) {
              const fecha = new Date(m.fechaNacimiento);
              if (fecha.getMonth() === mes) {
                cumples.push({
                  nombre: m.nombre || m.iniciales,
                  dia: fecha.getDate(),
                  tipo: 'cumple'
                });
              }
            }
          });
        }
      });

      return cumples.sort((a, b) => a.dia - b.dia);
    } catch (error) {
      console.error('Error cargando cumples:', error);
      return [];
    }
  },

  // Render calendario mini
  renderMini(containerId, eventosHoyId) {
    const hoy = new Date();
    const mes = hoy.getMonth();
    const año = hoy.getFullYear();
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mes-actual').textContent = meses[mes];

    const container = document.getElementById(containerId);
    const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    
    let html = dias.map(d => `<div class="cal-header">${d}</div>`).join('');

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    let diaInicio = primerDia.getDay();
    if (diaInicio === 0) diaInicio = 7;
    diaInicio--;

    // Días del mes anterior
    const diasMesAnterior = new Date(año, mes, 0).getDate();
    for (let i = diaInicio - 1; i >= 0; i--) {
      html += `<div class="cal-day other-month">${diasMesAnterior - i}</div>`;
    }

    // Días del mes actual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const esHoy = d === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
      html += `<div class="cal-day ${esHoy ? 'today' : ''}">${d}</div>`;
    }

    container.innerHTML = html;

    // Eventos de hoy
    const eventosHoyContainer = document.getElementById(eventosHoyId);
    eventosHoyContainer.innerHTML = `
      <div class="evento-mini">
        <div class="evento-dot cita"></div>
        <span style="color:var(--text-muted);">Sin eventos hoy</span>
      </div>
    `;
  }
};


// Exportar para uso global
window.TareasModule = TareasModule;
window.BuzonModule = BuzonModule;
window.TablonModule = TablonModule;
window.MenusModule = MenusModule;
window.CalendarioModule = CalendarioModule;
