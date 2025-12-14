# FAMILYNK
## Manual de Usuario v1.0

---

# Índice

1. [Introducción](#1-introducción)
2. [Conceptos Fundamentales](#2-conceptos-fundamentales)
3. [Roles y Permisos](#3-roles-y-permisos)
4. [Primeros Pasos](#4-primeros-pasos)
5. [La Consola (CGI)](#5-la-consola-cgi)
6. [Lo Común](#6-lo-común)
7. [Mayordomo](#7-mayordomo)
8. [Cerebro Familiar](#8-cerebro-familiar)
9. [Activaciones](#9-activaciones)
10. [Herramientas](#10-herramientas)
11. [Calendario](#11-calendario)
12. [Caseros (Acceso Externo)](#12-caseros-acceso-externo)
13. [Configuración y Ajustes](#13-configuración-y-ajustes)
14. [Preguntas Frecuentes](#14-preguntas-frecuentes)

---

# 1. Introducción

## ¿Qué es FAMILYNK?

FAMILYNK es una plataforma de coordinación familiar diseñada para gestionar información, tareas y comunicación entre los miembros de una familia, independientemente de su estructura o complejidad.

## Filosofía: Minimalismo Cálido

FAMILYNK sigue el principio de "minimalismo cálido": una herramienta práctica, acogedora y organizada, como la cocina de casa. No pretende ser una aplicación corporativa fría, sino un espacio familiar digital donde cada miembro encuentra lo que necesita sin complicaciones.

## ¿Para quién es?

- Familias tradicionales, monoparentales o reconstituidas
- Familias con varias generaciones (hasta 4 generaciones)
- Familias con propiedades compartidas (segundas residencias, vehículos)
- Familias que quieren preservar su legado y tradiciones

---

# 2. Conceptos Fundamentales

## 2.1 Estructura Familiar

### Familia
El conjunto completo de personas relacionadas. Una cuenta FAMILYNK = una familia.

### Rama
División principal de la familia. Típicamente corresponde a cada hijo/a del tronco familiar que ha formado su propia unidad. Ejemplo: "Rama de María", "Rama de Pedro".

### Nido
Unidad de convivencia. Las personas que viven bajo el mismo techo. Un nido puede contener:
- Una pareja
- Una pareja con hijos
- Una persona sola
- Abuelos
- Cualquier combinación

### Estirpe
Tu nido + todos los nidos descendientes. Útil para compartir información "hacia abajo" en el árbol familiar.

### Consortes
Miembros que entran a la familia por matrimonio o pareja. Tienen permisos configurables según lo decida la familia.

## 2.2 El Común vs. Legado

### Lo Común (Material)
Bienes físicos compartidos por la familia:
- 🏠 Inmuebles (casas, pisos, terrenos)
- 🚗 Vehículos
- 🪑 Ajuar (muebles, obras de arte familiares)

**Excluido expresamente**: Inversiones financieras, arte como inversión, cuentas bancarias.

### El Legado (Inmaterial)
Patrimonio inmaterial de la familia:
- Valores y principios
- Historia familiar
- Tradiciones y costumbres
- Recetas familiares
- Anécdotas y memoria oral

---

# 3. Roles y Permisos

## 3.1 Roles del Sistema

### AdminSistema
- **Quién**: Creador de la cuenta familiar
- **Puede**: Todo. Configuración global, crear/eliminar ramas, gestionar todos los usuarios
- **Visibilidad**: Ve toda la familia sin restricciones

### AdminRama
- **Quién**: Responsable de una rama familiar
- **Puede**: Gestionar su rama, sus nidos, invitar miembros a su rama
- **Visibilidad**: Ve su rama y descendientes

### AdminNido
- **Quién**: Responsable de un nido específico
- **Puede**: Gestionar su nido, sus miembros directos
- **Visibilidad**: Ve su nido y descendientes (estirpe)

### Miembro
- **Quién**: Usuario regular de la familia
- **Puede**: Ver contenido según permisos, participar en actividades
- **Visibilidad**: Según configuración de su nido

### Casero
- **Quién**: Persona externa (empleado, cuidador)
- **Puede**: Gestionar propiedades específicas según permisos asignados
- **Visibilidad**: Solo las propiedades asignadas

## 3.2 Permisos Granulares (VCEB)

Para cada sección, se pueden asignar permisos:
- **V** = Ver (consultar información)
- **C** = Crear (añadir nuevos elementos)
- **E** = Editar (modificar existentes)
- **B** = Borrar (eliminar)

---

# 4. Primeros Pasos

## 4.1 Registro Inicial (AdminSistema)

1. Accede a `familynk.vercel.app`
2. Click en "Crear cuenta"
3. Introduce email y contraseña
4. Completa el formulario de familia:
   - Nombre de la familia
   - Tu nombre
   - Tu rol (automáticamente AdminSistema)

## 4.2 Configurar la Estructura Familiar

### Paso 1: Crear Ramas
1. Ve a **Configuración** → **Gestión de Ramas**
2. Click en **+ Nueva Rama**
3. Asigna nombre y AdminRama (si ya está registrado)

### Paso 2: Crear Nidos
1. Dentro de cada Rama, click en **+ Nuevo Nido**
2. Indica:
   - Nombre del nido (ej: "Casa de Juan y María")
   - Nido padre (si es descendiente de otro)
   - AdminNido

### Paso 3: Invitar Miembros
1. Ve a **Configuración** → **Usuarios**
2. Click en **+ Invitar miembro**
3. Introduce email
4. Asigna a un Nido
5. El sistema envía email de invitación

## 4.3 Primer Acceso de un Miembro Invitado

1. Recibe email de invitación
2. Click en el enlace
3. Crea su contraseña
4. Accede a su CGI (Consola de Gestión Individual)

---

# 5. La Consola (CGI)

## 5.1 ¿Qué es la CGI?

La **Consola de Gestión Individual** es tu panel personal. Es lo primero que ves al entrar a FAMILYNK.

## 5.2 Secciones de la CGI

### Panel Principal
- **Saludo personalizado** con tu nombre
- **Resumen rápido**: próximas reservas, tareas pendientes, notificaciones
- **Accesos directos** a las secciones más usadas

### Notificaciones
- 🔔 Icono en la cabecera
- Muestra: asignaciones de Amigo Invisible, recordatorios, avisos del sistema
- Click para marcar como leídas

### Navegación
- **Lo Común**: Bienes compartidos
- **Activaciones**: Eventos y actividades
- **Cerebro**: Conocimiento familiar
- **Herramientas**: Utilidades varias
- **Calendario**: Vista temporal

### Perfil
- Tu foto/avatar
- Configuración personal
- Cerrar sesión

## 5.3 Personalización

Desde **Configuración** → **Personalización**:
- Cambiar colores de tu interfaz
- Elegir iconos/emojis preferidos
- Ajustar notificaciones

---

# 6. Lo Común

## 6.1 Acceso
Desde la CGI: Click en **"Lo Común"** o icono 🏠

## 6.2 Vista General
Muestra todos los bienes de la familia organizados por tipo:
- 🏠 Inmuebles
- 🌳 Terrenos
- 🚗 Vehículos
- 🪑 Ajuar

## 6.3 Ficha de Bien

Cada bien tiene su ficha con:

### Datos Básicos
- Nombre, tipo, ubicación
- Fotografías (hasta 50)
- Descripción

### Titularidad y Reparto
- Quién es propietario
- Porcentajes de propiedad
- Nidos con acceso

### Mayordomo (si activado)
- Módulos de gestión activos
- Reservas, inventario, gastos...

### Caseros
- Personal externo con acceso
- Sus permisos específicos

## 6.4 Añadir un Bien

1. En Lo Común, click **+ Nuevo bien**
2. Completa:
   - Tipo (inmueble, vehículo, etc.)
   - Nombre identificativo
   - Ubicación/descripción
   - Fotos
3. Configura titularidad
4. (Opcional) Activa Mayordomo

---

# 7. Mayordomo

## 7.1 ¿Qué es Mayordomo?

Sistema de gestión integral para propiedades que requieren administración activa. Ideal para:
- Segundas residencias compartidas
- Casas rurales familiares
- Vehículos de uso compartido

## 7.2 Activación

1. Ve a la ficha del bien
2. Click en **"Activar Mayordomo"**
3. Selecciona módulos a activar

## 7.3 Módulos Disponibles

### 📅 Reservas
- Calendario de ocupación
- Solicitar fechas
- Ver quién ha reservado
- Evitar conflictos

### 📦 Inventario
- **Plantilla**: Lista de productos que debería haber siempre
- **Stock**: Cantidad actual de cada producto
- **Mínimos**: Alerta cuando el stock baja del mínimo
- **Lista de compra**: Generada automáticamente

### 🔧 Mantenimiento
- Reportar incidencias
- Seguimiento de reparaciones
- Historial de intervenciones
- Contactos de proveedores

### 🧹 Limpieza
- Checklist de tareas
- Registrar limpiezas realizadas
- Programar limpiezas periódicas

### 🎉 Eventos
- Planificar celebraciones
- Coordinar preparativos

### 💶 Gastos
- Registrar gastos de la propiedad
- Categorizar (luz, agua, mantenimiento...)
- Asignar pagador
- Ver histórico

### 📋 Otros Servicios
- Servicios contratados
- Proveedores habituales

## 7.4 Tienda (Inventario Avanzado)

Acceso: Desde ficha del bien → **"🏪 Tienda"**

### Productos Básicos
- Artículos de consumo recurrente
- Stock + stock mínimo de seguridad
- Alerta automática cuando falta

### Productos Especiales
- Artículos ocasionales
- Para eventos específicos

### Lista de Compra
- Se genera automáticamente con productos bajo mínimo
- Marcar como "comprado" actualiza stock

---

# 8. Cerebro Familiar

## 8.1 ¿Qué es el Cerebro?

El repositorio de conocimiento de la familia. Dividido en cuatro áreas cognitivas:

## 8.2 🗄️ Memoria
Almacenamiento de información:
- **Documentos**: PDFs, contratos, escrituras
- **Manuales**: Instrucciones de electrodomésticos, guías
- **Contactos**: Proveedores, profesionales de confianza

### Subir un documento
1. Click en **"📤 Subir archivo"**
2. Selecciona categoría
3. Añade nombre y descripción
4. Elige visibilidad (Nido / Estirpe / Común)

## 8.3 📐 Razonamiento
Pautas y reglas familiares:
- Instrucciones para situaciones específicas
- Protocolos de actuación
- Normas de convivencia documentadas

### Crear una pauta
1. Click en **"✏️ Nueva pauta"**
2. Título descriptivo
3. Contenido detallado
4. Categoría (hogar, educación, emergencias, convivencia)
5. Visibilidad

## 8.4 💡 Intuición
Propuestas y sugerencias:
- Ideas para mejorar
- Propuestas de cambios
- Sugerencias de actividades

### Estados de propuestas
- ⏳ Pendiente
- 🗳️ En votación
- ✅ Aprobada
- ❌ Descartada

## 8.5 📊 Análisis
Estadísticas familiares:
- Número de miembros
- Número de nidos
- Documentos almacenados
- Actividad reciente

## 8.6 Visibilidad por Ámbitos

Si eres AdminNido, verás tres pestañas:
- **🏠 Nido**: Solo contenido de tu nido
- **🌳 Estirpe**: Tu nido + descendientes
- **🌐 Común**: Todo lo marcado como visible para todos

Si eres AdminSistema, ves todo sin filtros.

---

# 9. Activaciones

## 9.1 ¿Qué son las Activaciones?

Eventos y actividades familiares que requieren coordinación.

## 9.2 Tipos de Activaciones

### 🎉 Celebraciones
- Cumpleaños, aniversarios
- Fiestas familiares
- Reuniones especiales

### 🧳 Viajes
- Vacaciones familiares
- Escapadas
- Planificación conjunta

### 📅 Eventos
- Hitos importantes
- Fechas señaladas

## 9.3 Crear una Activación

1. Ve a **Activaciones**
2. Click en **+ Nueva activación**
3. Selecciona tipo
4. Completa detalles (fecha, lugar, descripción)
5. Invita participantes
6. (Opcional) Añade tareas/preparativos

---

# 10. Herramientas

## 10.1 Vista General

Acceso: **CGI → Herramientas** o desde el menú lateral

Las herramientas son utilidades independientes para tareas específicas.

## 10.2 🎁 Amigo Invisible

### ¿Qué hace?
Organiza sorteos de Amigo Invisible con notificación automática.

### Cómo usarlo
1. Click en **"🎁 Amigo Invisible"**
2. **Paso 1**: Selecciona participantes
3. **Paso 2**: Define presupuesto y fecha de entrega
4. **Paso 3**: Revisa resumen
5. Click en **"🎁 Realizar Sorteo"**

### Resultado
- Cada participante recibe notificación en FAMILYNK
- Nadie más sabe a quién le tocó

## 10.3 🔄 Turno Rotatorio

### ¿Qué hace?
Gestiona turnos rotativos para tareas recurrentes.

### Ejemplos de uso
- Quién lleva a los abuelos al médico
- Quién organiza la comida del domingo
- Turnos de uso de una propiedad

### Cómo usarlo
1. Crea un nuevo turno rotatorio
2. Añade participantes
3. Define frecuencia (semanal, mensual)
4. El sistema asigna automáticamente

## 10.4 🎮 Juegos de Calle

### ¿Qué hace?
Base de datos de juegos tradicionales para niños.

### Categorías
- 🏃 Juegos de correr
- 🤝 Juegos en grupo
- 🎯 Juegos de puntería

### Uso
Ideal para reuniones familiares con niños. Consulta rápida de reglas y materiales necesarios.

## 10.5 📅 Elegir Fecha

### ¿Qué hace?
Ayuda a encontrar la mejor fecha para un evento cuando hay varios participantes.

### Cómo funciona
1. Propón varias fechas posibles
2. Los participantes marcan disponibilidad
3. El sistema muestra qué fecha tiene más votos

## 10.6 🗳️ Votaciones

### ¿Qué hace?
Crea votaciones formales sobre decisiones familiares.

### Tipos
- Sí/No
- Múltiples opciones
- Ranking

## 10.7 📊 Encuestas

### ¿Qué hace?
Recoge opiniones de forma anónima o identificada.

### Diferencia con Votaciones
- Votaciones = decisión vinculante
- Encuestas = sondeo de opinión

## 10.8 ⚽ Porras

### ¿Qué hace?
Apuestas amistosas sobre eventos (deportivos, predicciones, etc.)

### Funcionamiento
1. Crea la porra (ej: "¿Quién ganará el Mundial?")
2. Los participantes hacen sus predicciones
3. Tras el evento, se revela el ganador

## 10.9 📋 Listas

### ¿Qué hace?
Crea listas personalizadas con hasta 10 campos configurables.

### Ejemplos de uso
- Lista de invitados a un evento
- Registro de regalos
- Inventario de cualquier cosa

### Exportación
Las listas se pueden exportar a PDF.

---

# 11. Calendario

## 11.1 Acceso
Click en **"Calendario"** desde la CGI o menú lateral.

## 11.2 Vista

### Por defecto
Vista mensual con todos los eventos visibles según tus permisos.

### Eventos automáticos
- 🎂 Cumpleaños de miembros (generados automáticamente)

### Eventos manuales
- Reservas de propiedades
- Activaciones familiares
- Eventos personales

## 11.3 Códigos de Color

Los eventos se muestran con colores según su tipo:
- Cumpleaños: color especial
- Reservas: color por nido
- Eventos: según categoría

## 11.4 Crear Evento

1. Click en una fecha del calendario
2. O click en **"+ Nuevo evento"**
3. Completa:
   - Título
   - Fechas (inicio/fin)
   - Tipo
   - Descripción
   - Visibilidad

---

# 12. Caseros (Acceso Externo)

## 12.1 ¿Qué es un Casero?

Persona externa a la familia con acceso limitado a propiedades específicas.

### Ejemplos
- Empleado de hogar
- Jardinero
- Encargado de finca
- Cuidador

## 12.2 Invitar un Casero

1. Ve a la ficha del bien → sección **Caseros**
2. Click en **"+ Invitar casero"**
3. Introduce:
   - Nombre
   - Email
   - Teléfono (opcional)
4. Configura permisos (qué puede ver/hacer)
5. Marca **"Enviar invitación por email"**
6. Click en **"Guardar"**

## 12.3 Permisos del Casero

Para cada módulo, puedes asignar:
- 📅 Reservas: V/C/E/B
- 📦 Inventario: V/C/E/B
- 🔧 Mantenimiento: V/C/E/B
- 🧹 Limpieza: V/C/E/B
- 💶 Gastos: V/C/E/B
- 📄 Documentos: V/C/E/B
- 🏪 Tienda: V/C/E/B

## 12.4 Procedimientos

### ¿Qué son?
Documentos PDF con instrucciones para los caseros.

### Subir un procedimiento
1. En Caseros → pestaña **"📚 Procedimientos"**
2. Click en **"+ Subir procedimiento"**
3. Elige tipo:
   - 📘 Manual completo
   - 📄 Procedimiento específico
   - ☑️ Checklist
   - 📋 Instrucciones
4. Sube el PDF (máx 10MB)
5. Indica versión (ej: "1.0", "2.1")

### Visibilidad
Los procedimientos son visibles para TODOS los caseros de ese bien automáticamente.

## 12.5 Gestión de Acceso

### Estados de un Casero
- ✅ **Activo**: Puede acceder normalmente
- ⏳ **Pendiente**: Invitado pero no ha completado registro
- 🚫 **Revocado**: Acceso cancelado

### Revocar Acceso
1. Click en el casero
2. Click en **"🚫 Revocar acceso"**
3. Confirmar

El casero ya no podrá acceder pero el registro se mantiene para historial.

## 12.6 Panel del Casero

Cuando un casero accede a FAMILYNK, ve un panel simplificado:
- Solo las propiedades asignadas
- Solo los módulos con permiso
- Siempre visible: 📚 Procedimientos

---

# 13. Configuración y Ajustes

## 13.1 Acceso
Click en tu avatar → **"Configuración"**

## 13.2 Secciones

### Perfil Personal
- Cambiar nombre mostrado
- Cambiar foto/avatar
- Actualizar email
- Cambiar contraseña

### Notificaciones
- Activar/desactivar tipos de notificaciones
- Frecuencia de emails (si aplica)

### Personalización (CGI)
- Colores de interfaz
- Iconos preferidos
- Disposición del panel

### Gestión Familiar (solo Admin)
- Crear/editar ramas
- Crear/editar nidos
- Invitar/gestionar usuarios
- Configurar permisos globales

---

# 14. Preguntas Frecuentes

## General

### ¿Puedo usar FAMILYNK desde el móvil?
Sí, la interfaz es responsive y funciona en cualquier navegador móvil.

### ¿Hay app nativa?
Por ahora, FAMILYNK funciona como aplicación web. Puedes "instalarla" desde el navegador usando "Añadir a pantalla de inicio".

### ¿Mis datos están seguros?
Sí. Usamos Firebase de Google con autenticación segura y datos encriptados.

## Estructura Familiar

### ¿Puedo cambiar la estructura después de crearla?
Sí, los AdminSistema pueden reorganizar ramas y nidos en cualquier momento.

### ¿Qué pasa con los hijos cuando se independizan?
Crean su propio nido (vacío o con pareja). Siguen perteneciendo a su rama pero tienen su espacio.

### ¿Cómo gestiono una familia reconstituida?
Usa ramas para cada familia original y nidos para las nuevas unidades. Los consortes pueden tener permisos ajustados.

## Propiedades

### ¿Puedo tener propiedades individuales (no compartidas)?
Sí, pero FAMILYNK está diseñado para gestión compartida. Una propiedad individual puede tener un solo titular.

### ¿Qué pasa si vendemos una propiedad?
Puedes archivarla o eliminarla. El historial de gastos y reservas se puede exportar antes.

## Caseros

### ¿El casero ve información de la familia?
No. Solo ve la propiedad asignada y los módulos con permiso.

### ¿Puedo tener varios caseros para una propiedad?
Sí, sin límite. Cada uno con sus propios permisos.

### ¿El casero paga algo?
No, el acceso de casero es gratuito. Es una extensión de la cuenta familiar.

---

# Anexo A: Rutas de Configuración Rápida

## Configurar una nueva familia

```
1. Registro → 2. Crear ramas → 3. Crear nidos → 4. Invitar miembros
```

## Añadir una segunda residencia con gestión

```
Lo Común → + Nuevo bien → Completar datos → Activar Mayordomo → 
Seleccionar módulos → (Opcional) Añadir caseros
```

## Organizar un Amigo Invisible

```
Herramientas → Amigo Invisible → Seleccionar participantes → 
Definir presupuesto y fecha → Realizar sorteo
```

## Subir un documento familiar importante

```
Cerebro → Memoria → Subir archivo → Elegir categoría → 
Definir visibilidad → Guardar
```

## Invitar un casero a una propiedad

```
Lo Común → Seleccionar bien → Caseros → Invitar casero → 
Configurar permisos → Enviar invitación
```

---

# Anexo B: Glosario

| Término | Definición |
|---------|------------|
| **CGI** | Consola de Gestión Individual. Tu panel personal |
| **Rama** | División principal de la familia (cada hijo del tronco) |
| **Nido** | Unidad de convivencia (quienes viven juntos) |
| **Estirpe** | Tu nido + todos los nidos descendientes |
| **Lo Común** | Bienes materiales compartidos |
| **Legado** | Patrimonio inmaterial (valores, historia, tradiciones) |
| **Mayordomo** | Sistema de gestión para propiedades activas |
| **Casero** | Persona externa con acceso limitado |
| **VCEB** | Ver, Crear, Editar, Borrar (permisos) |

---

# Anexo C: Contacto y Soporte

Para soporte técnico o sugerencias:
- Email: [pendiente configurar]
- Dentro de la app: CGI → Ayuda → Contactar

---

*FAMILYNK v1.0 - Manual de Usuario*
*Última actualización: Diciembre 2024*
