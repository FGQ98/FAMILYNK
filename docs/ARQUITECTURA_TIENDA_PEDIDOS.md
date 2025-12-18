# FAMILYNK - Arquitectura Tienda y Pedidos
**Fecha:** Diciembre 2024
**Versión:** 2.0

---

## MODELO DE DATOS

### Colecciones Firebase

```
bienes/{bienId}/
├── inventario/           ← Mayordomo define productos base
│   └── {productoId}
│       ├── nombre: string
│       ├── grupo: "alimentos" | "bebidas" | "higiene" | "limpieza" | "mantenimiento" | "otros"
│       ├── subgrupo: string (opcional)
│       ├── stock: number
│       ├── minimo: number
│       ├── unidad: string
│       └── ...
│
├── especiales/           ← Productos extra por Nido
│   └── {especialId}
│       ├── nombre: string
│       ├── grupo: string
│       ├── unidades: number
│       ├── notas: string (opcional)
│       ├── nidoId: string        ← Vinculado al Nido
│       ├── creadoPor: uid
│       └── fechaCreacion: timestamp
│
└── pedidos/              ← Solicitudes de compra
    └── {pedidoId}
        ├── nidoId: string
        ├── nidoNombre: string
        ├── solicitadoPor: uid
        ├── solicitadoPorNombre: string
        ├── estado: "pendiente" | "en_proceso" | "completado" | "parcial"
        ├── items: [
        │     { id, nombre, grupo, cantidad, unidad, tipo: "reposicion" | "especial" }
        │   ]
        ├── totalItems: number
        ├── fechaCreacion: timestamp
        ├── completadoPor: uid (al completar)
        ├── fechaCompletado: timestamp (al completar)
        └── importeTotal: number (opcional)
```

---

## FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   MAYORDOMO (Admin del Bien)                                        │
│   ──────────────────────────                                        │
│   Define inventario básico con stock mínimo                         │
│   bienes/{bienId}/inventario                                        │
│                                                                      │
│                     │                                                │
│                     ▼ auto-genera lista                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   TIENDA (tienda.html)                                              │
│   ────────────────────                                              │
│   Usuario selecciona Nido → ve dos tabs:                            │
│                                                                      │
│   ┌─────────────────────┐   ┌─────────────────────┐                 │
│   │ REPOSICIÓN          │   │ ESPECIALES          │                 │
│   │ ─────────────────── │   │ ─────────────────── │                 │
│   │ Lee inventario      │   │ bienes/{bienId}/    │                 │
│   │ Muestra stock<min   │   │ especiales          │                 │
│   │ Checkbox + cantidad │   │ Vinculados al Nido  │                 │
│   └─────────────────────┘   └─────────────────────┘                 │
│                                                                      │
│   → Barra flotante con carrito                                      │
│   → Enviar pedido                                                   │
│                                                                      │
│                     │                                                │
│                     ▼ crea pedido                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   bienes/{bienId}/pedidos                                           │
│   estado: "pendiente"                                               │
│                                                                      │
│                     │                                                │
│                     ▼ notifica                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   CASERO (casero.html)                                              │
│   ────────────────────                                              │
│   Módulo Pedidos (primero en el grid)                               │
│   Ve pedidos pendientes/en_proceso                                  │
│                                                                      │
│   Click → Modal detalle:                                            │
│   - Lista items con checkbox                                        │
│   - Campo importe (opcional)                                        │
│   - Botones: En proceso | Completar                                 │
│                                                                      │
│                     │                                                │
│                     ▼ al completar                                   │
│                                                                      │
│   1. Actualiza stock en inventario (+cantidad)                      │
│   2. Registra gasto en bienes/{bienId}/gastos                       │
│   3. Cambia estado pedido: "completado" | "parcial"                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## GRUPOS DE PRODUCTOS

| Clave | Nombre |
|-------|--------|
| alimentos | Alimentos |
| bebidas | Bebidas |
| higiene | Higiene |
| limpieza | Limpieza |
| mantenimiento | Mantenimiento |
| otros | Otros |

---

## ESTADOS DEL PEDIDO

| Estado | Descripción | Color |
|--------|-------------|-------|
| pendiente | Recién creado, sin procesar | Amarillo/Warning |
| en_proceso | Casero está comprando | Verde claro |
| completado | Todos los items comprados | Verde |
| parcial | Algunos items no disponibles | Azul |

---

## ARCHIVOS RELACIONADOS

- `tienda.html` - Interfaz usuario para hacer pedidos
- `casero.html` - Panel casero con módulo pedidos
- `mayordomo.html` - Gestión inventario básico (sin cambios)

---

## ÍNDICES FIREBASE NECESARIOS

```
Colección: bienes/{bienId}/especiales
Campos: nidoId (ASC), grupo (ASC)

Colección: bienes/{bienId}/pedidos
Campos: estado (ASC), fechaCreacion (DESC)
```

---

## NOTAS DE IMPLEMENTACIÓN

1. **Sin emojis** - Iconos tipográficos o símbolos básicos
2. **Especiales se guardan** - Quedan como plantilla para futuros pedidos
3. **Casero ve TODOS** los pedidos del bien
4. **Cualquier miembro** del Nido puede enviar pedidos
5. **Importe opcional** - Se registra en gastos solo si se indica
