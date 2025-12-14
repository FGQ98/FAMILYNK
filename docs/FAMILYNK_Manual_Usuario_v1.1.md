# FAMILYNK
## Manual de Usuario v1.1

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

- Familias de cualquier estructura (nuclear, monoparental, reconstituida)
- Familias multigeneracionales
- Familias con propiedades compartidas (segundas residencias, vehículos)
- Familias que quieren preservar su legado y tradiciones

---

# 2. Conceptos Fundamentales

## 2.1 Estructura Familiar

### Rama Familiar

El ecosistema completo gestionado por un Administrador de Rama. Una cuenta FAMILYNK = una Rama Familiar.

La Rama comienza con un único Nido (primera generación) y crece orgánicamente a medida que los hijos forman sus propios Nidos. Toda la estructura queda conectada bajo la misma Rama.

### Nido

La familia nuclear. Un Nido está compuesto por:

- **Progenitores**: Los cabezas de familia (uno o dos)
- **Hijos**: Todos los hijos sin distinción (biológicos, de otras relaciones, adoptados)
- **Convivientes**: Otras personas que viven en el hogar (abuelos, primos, cuidadora interna, etc.)

Un Nido representa a quienes comparten el día a día bajo el mismo techo.

### Estirpe

Tu Nido + todos los Nidos descendientes. Útil para compartir información "hacia abajo" en el árbol familiar.

Por ejemplo: Si Juan tiene un Nido y su hijo Pedro ha formado su propio Nido, la Estirpe de Juan incluye ambos Nidos.

### Convivientes

Personas que viven en el Nido pero no son progenitores ni hijos directos:

- Abuelos que viven con la familia
- Primos acogidos
- Cuidadores internos
- Cualquier persona que forme parte del día a día del hogar

Los convivientes son miembros plenos del Nido a efectos de FAMILYNK.

## 2.2 Lo Común vs. Legado

### Lo Común (Material)

Bienes físicos compartidos por la familia:

- Inmuebles (casas, pisos, terrenos)
- Vehículos
- Ajuar (muebles, objetos familiares significativos)

**Excluido expresamente**: Inversiones financieras, arte como inversión, cuentas bancarias.

### El Legado (Inmaterial)

Patrimonio inmaterial de la familia:

- Valores y principios familiares
- Historia familiar
- Tradiciones y costumbres
- Recetas familiares
- Anécdotas y memoria oral

---

# 3. Roles y Permisos

## 3.1 Roles del Sistema

### AdminRama

- **Quién**: El creador de la cuenta familiar
- **Puede**: Gestionar toda la estructura de la Rama (crear Nidos, invitar miembros, configurar permisos globales)
- **Visibilidad**: Toda la Rama y su contenido
- **Nota**: El AdminRama es automáticamente AdminNido de su propio Nido

### AdminNido

- **Quién**: Responsable de un Nido específico dentro de la Rama
- **Puede**: Gestionar su Nido (miembros, contenido, permisos internos)
- **Visibilidad**: Su Nido, su Estirpe, y contenido marcado como compartido

### Miembro

- **Quién**: Cualquier persona dentro de un Nido (progenitor, hijo, conviviente)
- **Puede**: Ver y participar según los permisos asignados por su AdminNido
- **Visibilidad**: Según configuración de su Nido

### Casero

- **Quién**: Persona externa a la familia (empleado, cuidador de propiedad)
- **Puede**: Gestionar propiedades específicas según permisos asignados
- **Visibilidad**: Solo las propiedades y módulos asignados

## 3.2 Tabla Resumen de Roles

| Rol | Quién | Puede | Visibilidad |
|-----|-------|-------|-------------|
| AdminRama | Creador de cuenta | Toda la estructura y contenido | Toda la Rama |
| AdminNido | Responsable de Nido | Gestionar su Nido | Su Nido y Estirpe |
| Miembro | Usuario del Nido | Participar según permisos | Según configuración |
| Casero | Persona externa | Gestionar propiedades asignadas | Solo lo asignado |

## 3.3 Permisos Granulares (VCEB)

Para cada sección o módulo, se pueden asignar permisos específicos:

- **V** = Ver (consultar información)
- **C** = Crear (añadir nuevos elementos)
- **E** = Editar (modificar existentes)
- **B** = Borrar (eliminar)

---

# 4. Primeros Pasos

## 4.1 Crear tu Rama Familiar

1. Accede a `familynk.vercel.app`
2. Click en "Crear cuenta"
3. Introduce email y contraseña
4. Completa el formulario inicial:
   - Nombre de tu familia (ej: "Familia García")
   - Tu nombre
5. Automáticamente serás AdminRama y se creará tu primer Nido

## 4.2 Configurar tu Nido

### Añadir miembros a tu Nido

1. Ve a **Configuración** → **Mi Nido**
2. Click en **+ Añadir miembro**
3. Indica:
   - Nombre
   - Tipo (Progenitor / Hijo / Conviviente)
   - Email (si va a tener acceso a la app)
4. Si tiene email, recibirá invitación para acceder

### Crear Nidos descendientes

Cuando un hijo forma su propia familia:

1. Ve a **Configuración** → **Estructura familiar**
2. Click en **+ Nuevo Nido**
3. Indica:
   - Nombre del Nido (ej: "Casa de Pedro y Laura")
   - Nido padre (tu Nido)
   - AdminNido (normalmente el hijo que se independiza)

## 4.3 Primer Acceso de un Miembro Invitado

1. Recibe email de invitación
2. Click en el enlace
3. Crea su contraseña
4. Accede a su CGI (Consola de Gestión Individual)

---

# 5. La Consola (CGI)

## 5.1 ¿Qué es la CGI?

La **Consola de Gestión Individual** es tu panel personal. Es lo primero que ves al entrar a FAMILYNK. Cada miembro tiene su propia CGI adaptada a su rol y permisos.

## 5.2 Secciones de la CGI

### Panel Principal

- Saludo personalizado con tu nombre
- Resumen rápido: próximas reservas, tareas pendientes, notificaciones
- Accesos directos a las secciones más usadas

### Notificaciones

- Icono en la cabecera
- Muestra: asignaciones, recordatorios, avisos
- Click para marcar como leídas

### Navegación Principal

- **Lo Común**: Bienes compartidos de la familia
- **Activaciones**: Eventos y actividades
- **Cerebro**: Conocimiento familiar
- **Herramientas**: Utilidades varias
- **Calendario**: Vista temporal de todo

### Perfil

- Tu foto/avatar
- Configuración personal
- Cerrar sesión

## 5.3 Personalización

Desde **Configuración** → **Personalización** puedes ajustar:

- Colores de tu interfaz
- Iconos preferidos
- Preferencias de notificaciones

---

# 6. Lo Común

## 6.1 Acceso

Desde la CGI: Click en **"Lo Común"**

## 6.2 Vista General

Muestra todos los bienes de la familia organizados por tipo:

- Inmuebles
- Terrenos
- Vehículos
- Ajuar

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
- Acceso a reservas, inventario, mantenimiento...

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
4. (Opcional) Activa Mayordomo si requiere gestión activa

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
3. Selecciona los módulos que necesitas

## 7.3 Módulos Disponibles

### Reservas

Calendario de ocupación del bien. Permite solicitar fechas, ver quién ha reservado, y evitar conflictos de uso.

### Inventario

- **Plantilla**: Lista de productos que debería haber siempre
- **Stock**: Cantidad actual de cada producto
- **Mínimos**: Alerta cuando el stock baja del mínimo
- **Lista de compra**: Generada automáticamente

### Mantenimiento

Tres apartados:

- **Reparaciones**: Listado de averías pendientes y en curso, con referencia, prioridad y seguimiento
- **Plan Periódico**: Tareas de mantenimiento programadas (revisar caldera, podar setos, etc.)
- **Taller**: Inventario de útiles y herramientas disponibles en la propiedad

### Limpieza

- Checklist de tareas
- Registrar limpiezas realizadas
- Programar limpiezas periódicas

### Eventos

- Planificar celebraciones
- Coordinar preparativos

### Gastos

- Registrar gastos de la propiedad
- Categorizar (luz, agua, mantenimiento...)
- Asignar pagador
- Ver histórico

## 7.4 Tienda

Acceso: Desde ficha del bien → **"Tienda"**

Gestión avanzada de inventario:

- **Productos Básicos**: Artículos de consumo recurrente con control de stock
- **Productos Especiales**: Para eventos u ocasiones específicas
- **Lista de Compra**: Generada automáticamente con productos bajo mínimo

---

# 8. Cerebro Familiar

## 8.1 ¿Qué es el Cerebro?

El repositorio de conocimiento de la familia. Organizado en cuatro áreas:

## 8.2 Memoria

Almacenamiento de información permanente:

- **Documentos**: PDFs, contratos, escrituras
- **Manuales**: Instrucciones de electrodomésticos, guías
- **Contactos**: Proveedores, profesionales de confianza

## 8.3 Razonamiento

Pautas y reglas familiares documentadas:

- Instrucciones para situaciones específicas
- Protocolos de actuación
- Normas de convivencia

## 8.4 Intuición

Propuestas y sugerencias:

- Ideas para mejorar
- Propuestas de cambios
- Estados: Pendiente, En votación, Aprobada, Descartada

## 8.5 Análisis

Estadísticas familiares:

- Número de miembros por Nido
- Documentos almacenados
- Actividad reciente

## 8.6 Visibilidad por Ámbitos

Según tu rol, verás diferentes pestañas:

- **Nido**: Solo contenido de tu Nido
- **Estirpe**: Tu Nido + Nidos descendientes
- **Común**: Todo lo marcado como visible para la Rama

---

# 9. Activaciones

## 9.1 ¿Qué son las Activaciones?

Eventos y actividades familiares que requieren coordinación entre varios miembros o Nidos.

## 9.2 Tipos de Activaciones

### Celebraciones

- Cumpleaños, aniversarios
- Fiestas familiares
- Reuniones especiales

### Viajes

- Vacaciones familiares
- Escapadas
- Planificación conjunta

### Eventos

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

Las herramientas son utilidades independientes para tareas específicas de coordinación familiar.

## 10.2 Amigo Invisible

Organiza sorteos de Amigo Invisible con notificación automática a cada participante. Nadie más sabe a quién le tocó.

## 10.3 Turno Rotatorio

Gestiona turnos rotativos para tareas recurrentes:

- Quién lleva a los abuelos al médico
- Quién organiza la comida del domingo
- Turnos de uso de una propiedad

## 10.4 Juegos de Calle

Base de datos de juegos tradicionales para niños, organizados por categorías. Ideal para reuniones familiares.

## 10.5 Elegir Fecha

Encuentra la mejor fecha para un evento cuando hay varios participantes. Cada uno marca su disponibilidad y el sistema muestra las fechas con más coincidencias.

## 10.6 Votaciones

Crea votaciones formales sobre decisiones familiares (Sí/No, múltiples opciones, ranking).

## 10.7 Encuestas

Recoge opiniones de forma anónima o identificada. A diferencia de las votaciones, las encuestas son sondeos de opinión, no decisiones vinculantes.

## 10.8 Porras

Apuestas amistosas sobre eventos (deportivos, predicciones, etc.)

## 10.9 Listas

Crea listas personalizadas con hasta 10 campos configurables. Exportables a PDF.

---

# 11. Calendario

## 11.1 Acceso

Click en **"Calendario"** desde la CGI o menú lateral.

## 11.2 Vista

Vista mensual con todos los eventos visibles según tus permisos:

- **Eventos automáticos**: Cumpleaños de miembros
- **Eventos manuales**: Reservas, activaciones, eventos personales

## 11.3 Códigos de Color

Los eventos se muestran con colores según su tipo para identificación rápida.

## 11.4 Crear Evento

1. Click en una fecha del calendario
2. O click en **"+ Nuevo evento"**
3. Completa título, fechas, tipo, descripción
4. Define visibilidad (Nido / Estirpe / Rama)

---

# 12. Caseros (Acceso Externo)

## 12.1 ¿Qué es un Casero?

Persona externa a la familia con acceso limitado a propiedades específicas:

- Empleado de hogar
- Jardinero
- Encargado de finca
- Cuidador de propiedad

## 12.2 Invitar un Casero

1. Ve a la ficha del bien → sección **Caseros**
2. Click en **"+ Invitar casero"**
3. Introduce nombre, email, teléfono
4. Configura permisos por módulo (VCEB)
5. Marca **"Enviar invitación por email"**
6. Click en **"Guardar"**

## 12.3 Permisos del Casero

Para cada módulo puedes asignar permisos específicos:

- Reservas
- Inventario
- Mantenimiento
- Limpieza
- Gastos
- Documentos
- Tienda

## 12.4 Procedimientos

Documentos PDF con instrucciones para los caseros:

- Manuales completos
- Procedimientos específicos
- Checklists
- Instrucciones

Los procedimientos son visibles para todos los caseros del bien automáticamente.

## 12.5 Gestión de Acceso

Estados de un Casero:

- **Activo**: Puede acceder normalmente
- **Pendiente**: Invitado pero no ha completado registro
- **Revocado**: Acceso cancelado (el registro se mantiene para historial)

## 12.6 Panel del Casero

Cuando un casero accede a FAMILYNK, ve un panel simplificado con solo las propiedades asignadas y los módulos con permiso.

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

### Personalización (CGI)

- Colores de interfaz
- Disposición del panel

### Mi Nido (AdminNido)

- Gestionar miembros del Nido
- Configurar permisos

### Estructura Familiar (AdminRama)

- Crear/editar Nidos
- Gestionar AdminNidos
- Configurar permisos globales

---

# 14. Preguntas Frecuentes

## General

**¿Puedo usar FAMILYNK desde el móvil?**
Sí, la interfaz es responsive y funciona en cualquier navegador móvil.

**¿Mis datos están seguros?**
Sí. Usamos Firebase de Google con autenticación segura y datos encriptados.

## Estructura Familiar

**¿Una cuenta puede tener varias Ramas?**
No. Una cuenta = Una Rama. Si dos familias quieren unirse (por ejemplo, al casarse los hijos), se puede solicitar una fusión de cuentas.

**¿Qué pasa con los hijos cuando se independizan?**
Crean su propio Nido dentro de la misma Rama. El AdminRama crea el nuevo Nido y asigna al hijo como AdminNido.

**¿Cómo gestiono una familia reconstituida?**
Los hijos de otras relaciones se consideran hijos sin distinción. Las parejas de los progenitores pueden ser Progenitores o Convivientes según prefieras.

**¿Los abuelos que viven con nosotros cómo se registran?**
Como Convivientes de tu Nido. Son miembros plenos.

## Propiedades

**¿Puedo tener propiedades solo mías (no compartidas)?**
Sí, aunque FAMILYNK está diseñado para gestión compartida. Una propiedad puede tener un solo titular.

## Caseros

**¿El casero ve información de la familia?**
No. Solo ve la propiedad asignada y los módulos con permiso.

**¿Puedo tener varios caseros para una propiedad?**
Sí, sin límite. Cada uno con sus propios permisos.

---

# Anexo A: Rutas de Configuración Rápida

## Configurar tu Rama desde cero

```
Registro → Crear primer Nido (automático) → Añadir miembros → 
Crear Nidos descendientes (cuando aplique)
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
| **Rama Familiar** | Ecosistema completo de una familia. Una cuenta = una Rama |
| **Nido** | Familia nuclear: progenitores + hijos + convivientes |
| **Estirpe** | Tu Nido + todos los Nidos descendientes |
| **Conviviente** | Persona que vive en el Nido sin ser progenitor ni hijo (abuelos, cuidadores...) |
| **CGI** | Consola de Gestión Individual. Tu panel personal |
| **Lo Común** | Bienes materiales compartidos |
| **Legado** | Patrimonio inmaterial (valores, historia, tradiciones) |
| **Mayordomo** | Sistema de gestión para propiedades activas |
| **Casero** | Persona externa con acceso limitado a propiedades |
| **VCEB** | Ver, Crear, Editar, Borrar (sistema de permisos) |
| **AdminRama** | Administrador de toda la Rama (máximo rol) |
| **AdminNido** | Administrador de un Nido específico |

---

# Anexo C: Contacto y Soporte

Para soporte técnico o sugerencias:

- Dentro de la app: CGI → Ayuda → Contactar

---

*FAMILYNK v1.1 - Manual de Usuario*
*Última actualización: Diciembre 2024*
