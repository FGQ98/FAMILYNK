# RACIONAL DE USUARIOS FAMILYNK
## Versión 1.0 — Diciembre 2024

---

## 1. FLUJOS DE ENTRADA

### 1.1 FUNDADOR (crear-cuenta.html)
```
Usuario nuevo → Registro → Crea FAMILIA + USUARIO (AdminRama)
                        → Redirige a WIZARD-NIDO.HTML
                        → Configura su primer nido
                        → Queda como AdminRama + AdminNido
                        → Redirige a mi-nido.html o cgi.html
```

### 1.2 INVITADO (email + login.html)
```
Admin registra miembro con email → Sistema genera contraseña temporal
                                → Miembro recibe email con enlace + pass
                                → Entra a login.html
                                → Cambia contraseña → VALIDADO
                                → Redirige a mi-nido.html
                                → (Su nido ya existe, creado por admin)
```

### 1.3 SEGUNDA RAMA (crear-rama.html) — ADD-ON Premium
```
Usuario existente → Activa add-on "Crear Rama"
                 → Crea segunda rama familiar
                 → Su nido se REPLICA automáticamente en la nueva rama
                 → Es el "pivote" entre ambas familias
```

---

## 2. REGLA DE UNICIDAD (El "Pivote")

Un miembro puede aparecer en DOS nidos (como hijo en uno, padre en otro) pero cuenta como UNA SOLA persona en listados globales.

### Mecanismo:
- Al dar de alta un hijo, existe checkbox **"Crea su propio nido"**
- Si se marca, el hijo se convierte en progenitor de un nuevo nido
- La conexión queda registrada: `nidoPadreId` en el nido nuevo

### Identificación única:
1. Por `uid` (si tiene cuenta validada)
2. Por vínculo `nido-origen → nido-creado` (si aún no tiene cuenta)

### Visualización en árbol:
```
NIDO ORIGEN (Gen 3)              NIDO DESTINO (Gen 4)
┌──────────────────┐             ┌──────────────────┐
│  Padres:         │             │  Padres:         │
│  • Pedro         │             │  • JUAN ←────────┼── Misma persona
│  • María         │             │  • Ana           │
│                  │  checkbox   │                  │
│  Hijos:          │  "crea      │  Hijos:          │
│  • JUAN ─────────┼──nido" ────→│  • (nuevos)      │
│  • Lucía         │             │                  │
└──────────────────┘             └──────────────────┘
```

---

## 3. ESTADOS DE CUENTA

### Estructura de datos en `miembrosData[]`:
```javascript
{
  nombre: "Juan García",
  iniciales: "JG",
  email: "juan@email.com",      // null para menores sin email
  uid: "abc123",                // null si no tiene cuenta aún
  estadoCuenta: "invitado",     // "invitado" | "validado"
  fechaInvitacion: "2025-01-15",
  fechaValidacion: null,        // Se rellena al cambiar contraseña
  fechaDefuncion: null          // Para miembros fallecidos
}
```

### Colores en listados:

| Estado | Color | Código | Condición |
|--------|-------|--------|-----------|
| Invitado | GRIS | `#9A9A9A` | `estadoCuenta === 'invitado'` y tiene email |
| Validado | NEGRO | `#3D3D3D` | `estadoCuenta === 'validado'` |
| Menor sin email | NEGRO | `#3D3D3D` | `email === null` (no necesita validar) |
| Fallecido | Opacidad 50% | `opacity: 0.5` | `fechaDefuncion !== null` |

### CSS para implementar:
```css
.miembro-invitado { color: #9A9A9A; }
.miembro-validado { color: #3D3D3D; }
.miembro-fallecido { opacity: 0.5; }
```

---

## 4. JERARQUÍA DE PÁGINAS

| Página | Acceso | Función |
|--------|--------|---------|
| `admin-rama.html` | Solo AdminRama | Gestión global: invitaciones, config rama, tipos reserva |
| `admin-nido.html` | AdminNido | Config nido: secciones activas, permisos miembros |
| `nido.html` | Miembros del nido | Vista/edición de ficha completa del nido |
| `mi-nido.html` | Usuario autenticado | Dashboard personal + editar perfil propio |
| `arbol.html` | Miembros de la rama | Vista árbol genealógico |
| `herramienta-listas.html` | Ver: todos / Config: AdminRama | Generador de listas con filtros |
| `wizard-nido.html` | Fundadores nuevos | Onboarding para crear primer nido |

---

## 5. FILTROS EN HERRAMIENTA-LISTAS

### Filtros de estado:
- **Todos** — Sin filtro
- **Invitados (pendientes)** — `estadoCuenta === 'invitado'`
- **Validados** — `estadoCuenta === 'validado'`
- **Con email** — `email !== null`
- **Sin email (menores)** — `email === null`

### Filtros existentes (mantener):
- Por generación
- Por nido
- Vivos / Fallecidos
- Adultos / Menores

---

## 6. PROCESO DE INVITACIÓN

### Paso a paso:
1. AdminRama/AdminNido registra miembro con email en `nido.html`
2. Sistema genera contraseña temporal (8 caracteres alfanuméricos)
3. Se guarda en Firestore: `invitaciones` con estado `pendiente`
4. Se envía email via EmailJS con:
   - Enlace a login.html
   - Contraseña temporal
   - Nombre de la familia
5. Miembro entra, usa contraseña temporal
6. Sistema detecta que es temporal → Fuerza cambio de contraseña
7. Al cambiar: `estadoCuenta` pasa de `invitado` a `validado`
8. Se actualiza `fechaValidacion` y se asigna `uid`

---

## 7. TIPOS DE TAREA EN ESCALETA

| Tipo | Color | Uso |
|------|-------|-----|
| Evento | Verde (sage) | Reuniones, celebraciones |
| Tarea | Terracotta | Acciones pendientes |
| Recordatorio | Amarillo | Avisos, fechas límite |
| **Organización** | **Azul** | Planificación, logística |

---

## 8. PLAN DE DESARROLLO

### Prioridad ALTA 🔴
| # | Tarea | Archivos |
|---|-------|----------|
| 1 | Crear `wizard-nido.html` — Onboarding fundador | Nueva página |
| 2 | Modificar `crear-cuenta.html` — Redirigir a wizard | crear-cuenta.html |
| 3 | Añadir campo `estadoCuenta` en modelo de datos | Firestore schema |

### Prioridad MEDIA 🟡
| # | Tarea | Archivos |
|---|-------|----------|
| 4 | Implementar colores gris/negro en listados | mi-nido.html, nido.html, arbol.html, herramienta-listas.html |
| 5 | Añadir filtros de estado en listas | herramienta-listas.html |
| 6 | Validación en login — Detectar pass temporal, forzar cambio, marcar validado | login.html |
| 7 | Añadir tipo "Organización" (azul) en Escaleta | escaleta.html |

### Prioridad BAJA 🟢
| # | Tarea | Archivos |
|---|-------|----------|
| 8 | Revisar `crear-rama.html` — Confirmar réplica de nido | crear-rama.html |

---

## 9. GLOSARIO

| Término | Definición |
|---------|------------|
| **Rama** | Familia/Dinastía. Unidad organizativa principal |
| **Nido** | Hogar/núcleo familiar. Contiene progenitores e hijos |
| **Pivote** | Persona que conecta dos nidos (hijo en uno, padre en otro) |
| **AdminRama** | Administrador de toda la rama. Puede invitar, configurar |
| **AdminNido** | Administrador de un nido específico. Edita datos del nido |
| **Invitado** | Miembro registrado pero que no ha validado su cuenta |
| **Validado** | Miembro que cambió su contraseña temporal |

---

## 10. NOTAS TÉCNICAS

### Firebase Collections:
- `familias` — Datos de cada rama
- `nidos` — Datos de cada nido (incluye `miembrosData[]`)
- `usuarios` — Datos de usuarios con cuenta
- `invitaciones` — Invitaciones pendientes

### Servicios externos:
- **EmailJS** — Envío de invitaciones
  - Service ID: `service_fcfx5od`
  - Template ID: `template_my2n26t`
  - Public Key: `eWMtiJpUqrLsA5Nel`

---

*Documento generado: Diciembre 2024*
*Última validación: Sesión actual con Felipe*
