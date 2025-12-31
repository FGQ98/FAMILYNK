# 🔥 ÍNDICES FIREBASE - FAMILYNK

> Documentación de índices compuestos necesarios en Firestore.  
> Última actualización: 31/12/2025

## ⚠️ Importante

Firestore crea índices simples automáticamente. Los **índices compuestos** (consultas con múltiples campos + orderBy) requieren creación manual.

Cuando veas este error en consola:
```
FirebaseError: The query requires an index. You can create it here: [URL]
```
Haz clic en el enlace para crear el índice automáticamente.

---

## 📋 ÍNDICES REQUERIDOS

### Colección: `familias`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `fechaCreacion` | DESC | admin-sistema.html (últimas ramas) |

### Colección: `nidos`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `ramaId` + `generacion` | ASC, ASC | arbol.html (árbol genealógico) |
| `ramaId` + `fechaCreacion` | ASC, DESC | nidos.html (listado) |

### Colección: `usuarios`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `ramaId` + `nidoId` | ASC, ASC | Filtros por rama/nido |
| `email` | - | login.html (búsqueda) |
| `primerAcceso` | DESC | admin (usuarios pendientes) |

### Colección: `invitaciones-email`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `fechaEnvio` | DESC | admin-sistema.html |
| `ramaId` + `estado` | ASC, ASC | Filtro invitaciones por rama |
| `email` + `estado` | ASC, ASC | Validación invitación |

### Colección: `metricas-historico`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `fecha` | DESC | admin-sistema.html (gráfico evolución) |

### Colección: `chats`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `ramaId` + `fechaCreacion` | ASC, DESC | chat.html |
| `nidoId` + `fechaCreacion` | ASC, DESC | chat.html |

### Subcolección: `chats/{chatId}/mensajes`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `fecha` | ASC | chat.html (orden cronológico) |

### Colección: `bienes` (collectionGroup)

| Campos | Orden | Usado en |
|--------|-------|----------|
| `ramaId` | ASC | lo-comun.html, admin |
| `tipo` + `ramaId` | ASC, ASC | Filtros por tipo |

### Subcolección: `familias/{ramaId}/bienes`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `fechaCreacion` | DESC | lo-comun.html |
| `tipo` | ASC | Filtro por tipo |

### Colección: `legado-*` (fotos, historias, recetas, etc.)

| Campos | Orden | Usado en |
|--------|-------|----------|
| `ramaId` + `fechaCreacion` | ASC, DESC | legado-*.html |
| `ramaId` + `visibilidad` | ASC, ASC | Filtros visibilidad |
| `creadoPor` | ASC | Filtro por autor |

### Colección: `eventos`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `ramaId` + `fecha` | ASC, ASC | calendario, eventos |
| `nidoId` + `fecha` | ASC, ASC | eventos de nido |

### Colección: `reservas` (Mayordomo/Gerente)

| Campos | Orden | Usado en |
|--------|-------|----------|
| `bienId` + `fechaInicio` | ASC, ASC | bien.html (calendario) |
| `ramaId` + `estado` | ASC, ASC | Filtro reservas |

### Colección: `logs`

| Campos | Orden | Usado en |
|--------|-------|----------|
| `fecha` | DESC | admin-sistema.html |
| `ramaId` + `fecha` | ASC, DESC | Logs por rama |

---

## 🛠️ CREAR ÍNDICES MANUALMENTE

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar proyecto FAMILYNK
3. Firestore Database → Indexes
4. Click "Create Index"
5. Configurar colección, campos y orden

### Ejemplo: Índice para nidos por rama y generación

```
Collection: nidos
Fields:
  - ramaId: Ascending
  - generacion: Ascending
Query scope: Collection
```

---

## 📊 CONSULTAS COLLECTIONGROUP

Para consultas que atraviesan subcolecciones (ej: todos los bienes de todas las ramas), necesitas habilitar el índice de collectionGroup:

```
Collection group: bienes
Fields: ramaId (Ascending)
Query scope: Collection group
```

---

## 🔒 REGLAS DE SEGURIDAD RELACIONADAS

Los índices no afectan la seguridad. Las reglas de Firestore (`firestore.rules`) controlan quién puede leer/escribir.

Asegúrate de que las reglas permitan las consultas que usan estos índices.

---

## 📝 NOTAS

- Los índices tardan unos minutos en construirse
- Índices no usados consumen espacio → eliminar si no se necesitan
- Firestore cobra por almacenamiento de índices en plan Blaze
- Máximo ~200 índices por proyecto (rara vez un problema)

---

*Documento generado para FAMILYNK MVP v0.9*
