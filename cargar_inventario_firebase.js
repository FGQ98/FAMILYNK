// =====================================================
// SCRIPT PARA CARGAR INVENTARIO BÁSICO EN FIREBASE
// =====================================================
// 
// INSTRUCCIONES:
// 1. Abre la consola del navegador (F12) en cualquier página de FAMILYNK
// 2. Copia y pega todo este código
// 3. Ejecuta: cargarInventario('ID_DEL_BIEN')
//    donde ID_DEL_BIEN es el ID del bien en Firebase
//
// =====================================================

const inventarioBasico = {
  despensa: {
    nombre: "Despensa",
    icono: "🏪",
    grupos: {
      pastas: {
        nombre: "Pastas",
        icono: "🍝",
        articulos: [
          { nombre: "Lasagna", formato: "Cajas", minimo: 4, actual: 0 },
          { nombre: "Canelones", formato: "Cajas", minimo: 4, actual: 0 },
          { nombre: "Fideo de fideuá", formato: "Paquete 0,5KG", minimo: 4, actual: 0 },
          { nombre: "Fideo 0", formato: "Paquete 0,5KG", minimo: 4, actual: 0 },
          { nombre: "Macarrones", formato: "Paquete 0,5KG", minimo: 4, actual: 0 },
          { nombre: "Espaguetis", formato: "Paquete 0,5KG", minimo: 4, actual: 0 }
        ]
      },
      arroces: {
        nombre: "Arroces",
        icono: "🍚",
        articulos: [
          { nombre: "SOS Bomba", formato: "Paquete 1 KG", minimo: 4, actual: 0 },
          { nombre: "Redondo / Mercadona", formato: "Paquete 1 KG", minimo: 4, actual: 0 }
        ]
      },
      legumbres: {
        nombre: "Legumbres",
        icono: "🫘",
        articulos: [
          { nombre: "Alubias", formato: "Paquete 1 KG", minimo: 4, actual: 0 },
          { nombre: "Lentejas", formato: "Paquete 1 KG", minimo: 4, actual: 0 },
          { nombre: "Garbanzos", formato: "Paquete 1 KG", minimo: 4, actual: 0 }
        ]
      },
      harinas: {
        nombre: "Harinas",
        icono: "🌾",
        articulos: [
          { nombre: "Integral", formato: "Paquete 1 KG", minimo: 2, actual: 0 },
          { nombre: "Trigo", formato: "Paquete 1 KG", minimo: 4, actual: 0 },
          { nombre: "Repostería", formato: "Paquete 1 KG", minimo: 4, actual: 0 },
          { nombre: "Sin gluten", formato: "Paquete 1 KG", minimo: 2, actual: 0 },
          { nombre: "Levadura Royal", formato: "Caja de sobres", minimo: 2, actual: 0 }
        ]
      },
      latas: {
        nombre: "Latas",
        icono: "🥫",
        articulos: [
          { nombre: "Sardinillas en aceite", formato: "Latas pequeñas", minimo: 10, actual: 0 },
          { nombre: "Mejillones en escabeche", formato: "Latas pequeñas", minimo: 10, actual: 0 },
          { nombre: "Bonito en aceite", formato: "Latas pequeñas", minimo: 10, actual: 0 },
          { nombre: "Sardinas en tomate", formato: "Latas pequeñas", minimo: 10, actual: 0 },
          { nombre: "Berberechos", formato: "Latas pequeñas", minimo: 4, actual: 0 },
          { nombre: "Aceitunas rellenas de anchoa", formato: "Latas pequeñas", minimo: 4, actual: 0 },
          { nombre: "Aceitunas negras con hueso", formato: "Latas pequeñas", minimo: 2, actual: 0 },
          { nombre: "Chipotles", formato: "Latas pequeñas", minimo: 2, actual: 0 },
          { nombre: "Espárragos blancos", formato: "Latas pequeñas", minimo: 4, actual: 0 },
          { nombre: "Tomate frito", formato: "Latas pequeñas", minimo: 4, actual: 0 },
          { nombre: "Tomate triturado", formato: "Latas pequeñas", minimo: 6, actual: 0 },
          { nombre: "Guisantes", formato: "Latas grandes", minimo: 6, actual: 0 },
          { nombre: "Leche condensada", formato: "Latas pequeñas", minimo: 2, actual: 0 },
          { nombre: "Anchoas", formato: "Latas pequeñas", minimo: 4, actual: 0 }
        ]
      },
      frascos: {
        nombre: "Frascos",
        icono: "🫙",
        articulos: [
          { nombre: "Alcaparras", formato: "Frasco cristal", minimo: 2, actual: 0 },
          { nombre: "Garbanzos", formato: "Frasco cristal 1 KG", minimo: 4, actual: 0 },
          { nombre: "Alubias", formato: "Frasco cristal 1 KG", minimo: 4, actual: 0 },
          { nombre: "Lentejas", formato: "Frasco cristal 1 KG", minimo: 4, actual: 0 },
          { nombre: "Piparras / guindillas en vinagre", formato: "Frasco cristal mediano", minimo: 2, actual: 0 },
          { nombre: "Pepinillos en vinagre", formato: "Frasco cristal mediano", minimo: 2, actual: 0 },
          { nombre: "Banderillas", formato: "Frasco cristal mediano", minimo: 2, actual: 0 }
        ]
      },
      salsas: {
        nombre: "Salsas",
        icono: "🍯",
        articulos: [
          { nombre: "Cebolla frita", formato: "", minimo: 2, actual: 0 },
          { nombre: "Lea Perrins", formato: "", minimo: 2, actual: 0 },
          { nombre: "Clásico BBQ", formato: "", minimo: 4, actual: 0 },
          { nombre: "Ketchup", formato: "", minimo: 4, actual: 0 },
          { nombre: "Mayonesa", formato: "", minimo: 4, actual: 0 },
          { nombre: "Mostaza", formato: "", minimo: 3, actual: 0 },
          { nombre: "Soja", formato: "", minimo: 2, actual: 0 }
        ]
      },
      infusiones: {
        nombre: "Infusiones",
        icono: "🍵",
        articulos: [
          { nombre: "Café", formato: "Paquetes", minimo: 6, actual: 0 },
          { nombre: "Descafeinado soluble", formato: "Nestle / frasco cristal", minimo: 2, actual: 0 },
          { nombre: "Cápsulas de café", formato: "Caja de cápsulas", minimo: 2, actual: 0 },
          { nombre: "Cápsulas de descafeinado", formato: "Caja de cápsulas", minimo: 1, actual: 0 },
          { nombre: "Poleo Menta", formato: "Caja sobres", minimo: 2, actual: 0 },
          { nombre: "Manzanilla", formato: "Caja sobres", minimo: 1, actual: 0 },
          { nombre: "Té negro", formato: "Caja sobres", minimo: 1, actual: 0 },
          { nombre: "Té verde", formato: "Caja sobres", minimo: 1, actual: 0 },
          { nombre: "Té rojo", formato: "", minimo: 1, actual: 0 },
          { nombre: "English Breakfast Tea", formato: "Caja sobres", minimo: 2, actual: 0 }
        ]
      },
      condimentos: {
        nombre: "Condimentos",
        icono: "🧂",
        articulos: [
          { nombre: "Pimentón de la Vera dulce", formato: "Lata", minimo: 2, actual: 0 },
          { nombre: "Pimentón de la Vera picante", formato: "Lata", minimo: 2, actual: 0 },
          { nombre: "Sazonadores de fajitas", formato: "Caja de sobres", minimo: 1, actual: 0 },
          { nombre: "Sazonador de paella", formato: "Caja de sobres", minimo: 1, actual: 0 },
          { nombre: "Azúcar blanca", formato: "Paquete 1KG", minimo: 2, actual: 0 },
          { nombre: "Azúcar Candy", formato: "Paquete 1KG", minimo: 2, actual: 0 },
          { nombre: "Vinagre blanco de vino", formato: "Botella 1 LT", minimo: 2, actual: 0 },
          { nombre: "Vinagre de manzana o sidra", formato: "Botella 1 LT", minimo: 2, actual: 0 },
          { nombre: "Vinagre de jerez", formato: "Botella 0,5 LT", minimo: 1, actual: 0 },
          { nombre: "Sal fina", formato: "Paquete 1KG", minimo: 2, actual: 0 },
          { nombre: "Sal escamas", formato: "Caja 200 gms", minimo: 2, actual: 0 },
          { nombre: "Sal gorda", formato: "Paquete 1KG", minimo: 2, actual: 0 }
        ]
      },
      especias: {
        nombre: "Especias",
        icono: "🌿",
        articulos: [
          { nombre: "Pimienta negra", formato: "Bote plástico", minimo: 2, actual: 0 },
          { nombre: "Ajo en polvo", formato: "Bote plástico", minimo: 3, actual: 0 },
          { nombre: "Cúrcuma", formato: "Bote plástico", minimo: 2, actual: 0 },
          { nombre: "Curry", formato: "Bote plástico", minimo: 2, actual: 0 },
          { nombre: "Canela", formato: "Bote plástico", minimo: 2, actual: 0 },
          { nombre: "Tomillo", formato: "Bote plástico", minimo: 2, actual: 0 },
          { nombre: "Romero", formato: "Bote plástico", minimo: 2, actual: 0 },
          { nombre: "Nuez moscada", formato: "Bote plástico", minimo: 1, actual: 0 },
          { nombre: "Eneldo", formato: "Bote plástico", minimo: 2, actual: 0 }
        ]
      },
      caldos: {
        nombre: "Caldos",
        icono: "🥣",
        articulos: [
          { nombre: "Avecrem verduras", formato: "Caja de pastillas", minimo: 1, actual: 0 },
          { nombre: "Avecrem pescado", formato: "Caja de pastillas", minimo: 1, actual: 0 },
          { nombre: "Caldo paella", formato: "Tetrabrik", minimo: 4, actual: 0 },
          { nombre: "Caldo de pollo", formato: "Tetrabrik", minimo: 4, actual: 0 },
          { nombre: "Caldo de verduras", formato: "Tetrabrik", minimo: 4, actual: 0 }
        ]
      },
      cacaos: {
        nombre: "Cacaos",
        icono: "🍫",
        articulos: [
          { nombre: "Maíz de palomitas", formato: "Caja de sobres", minimo: 2, actual: 0 },
          { nombre: "Paladin Especial", formato: "Bote", minimo: 1, actual: 0 },
          { nombre: "Nesquik", formato: "Bote", minimo: 2, actual: 0 },
          { nombre: "Cola Cao", formato: "Bote", minimo: 1, actual: 0 }
        ]
      },
      papel_bolsas: {
        nombre: "Papel y Bolsas",
        icono: "🧻",
        articulos: [
          { nombre: "Papel film", formato: "Caja de un rollo", minimo: 2, actual: 0 },
          { nombre: "Papel aluminio", formato: "Caja de un rollo", minimo: 2, actual: 0 },
          { nombre: "Papel de horno", formato: "Caja de un rollo", minimo: 2, actual: 0 },
          { nombre: "Bolsas de congelación (4 Lts)", formato: "Caja de un rollo", minimo: 2, actual: 0 }
        ]
      },
      aceite_oliva: {
        nombre: "Aceite Oliva",
        icono: "🫒",
        articulos: [
          { nombre: "Picual", formato: "Oleoquiros / Botella blanca", minimo: 3, actual: 0 },
          { nombre: "Cornicabra", formato: "Oleoquiros / Botella blanca", minimo: 3, actual: 0 },
          { nombre: "Arbequina", formato: "Oleoquiros / Botella blanca", minimo: 3, actual: 0 },
          { nombre: "Chilly", formato: "Art Of Oil / botella negra", minimo: 3, actual: 0 },
          { nombre: "Lemon garlic", formato: "Art Of Oil / botella negra", minimo: 3, actual: 0 },
          { nombre: "Rosemary", formato: "Art Of Oil / botella negra", minimo: 3, actual: 0 }
        ]
      },
      verduras: {
        nombre: "Verduras",
        icono: "🥔",
        articulos: [
          { nombre: "Patatas blancas para freír", formato: "Saco 5 KG", minimo: 1, actual: 0 },
          { nombre: "Cebollas blancas", formato: "Saco 1 KG", minimo: 1, actual: 0 },
          { nombre: "Cebollas moradas", formato: "Saco 1 KG", minimo: 1, actual: 0 },
          { nombre: "Ajos", formato: "Red", minimo: 2, actual: 0 }
        ]
      }
    }
  },
  camara: {
    nombre: "Cámara",
    icono: "❄️",
    grupos: {
      agua: {
        nombre: "Agua",
        icono: "💧",
        articulos: [
          { nombre: "Agua", formato: "Bidón", minimo: 6, actual: 0 },
          { nombre: "Agua con gas", formato: "Botella 0,75L", minimo: 12, actual: 0 }
        ]
      },
      refrescos: {
        nombre: "Refrescos",
        icono: "🥤",
        articulos: [
          { nombre: "Coca Cola Normal", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "Coca Cola Zero", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "Coca Cola Light", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "Coca Cola Zero Zero", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "Fanta Limón", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "Fanta Naranja", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "La Casera", formato: "Botella 0,75L", minimo: 2, actual: 0 },
          { nombre: "Sprite", formato: "Botella 2L", minimo: 1, actual: 0 },
          { nombre: "Nestea / Ice Tea / Fuze tea", formato: "Botellas 2 LTS", minimo: 2, actual: 0 },
          { nombre: "Schweppes tónica", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "Schweppes soda", formato: "Botella 20 cc", minimo: 12, actual: 0 },
          { nombre: "Schweppes ginger Ale", formato: "Botella 20 cc", minimo: 12, actual: 0 }
        ]
      },
      cerveza: {
        nombre: "Cerveza",
        icono: "🍺",
        articulos: [
          { nombre: "Mahou clásica (verde)", formato: "Botellín 20 cc", minimo: 48, actual: 0 },
          { nombre: "Mahou sabor limón", formato: "Lata 33 cc", minimo: 12, actual: 0 },
          { nombre: "Mahou 5 estrellas (roja)", formato: "Lata 33 cc", minimo: 24, actual: 0 },
          { nombre: "Estrella Galicia / abrefácil", formato: "Botellín 200 cc", minimo: 24, actual: 0 },
          { nombre: "Mahou sin", formato: "Botella", minimo: 12, actual: 0 }
        ]
      },
      espumosos: {
        nombre: "Espumosos",
        icono: "🍾",
        articulos: [
          { nombre: "Sidra El Gaitero", formato: "Botella 75 cc", minimo: 2, actual: 0 },
          { nombre: "Champagne", formato: "Botella 75 cc", minimo: 2, actual: 0 },
          { nombre: "Cava Anna de Codorníu", formato: "Botella 75 cc", minimo: 5, actual: 0 }
        ]
      },
      vinos: {
        nombre: "Vinos",
        icono: "🍷",
        articulos: [
          { nombre: "Vino blanco", formato: "Caja 12", minimo: 1, actual: 0 },
          { nombre: "Vino tinto", formato: "Caja 12", minimo: 1, actual: 0 }
        ]
      },
      espirituosos: {
        nombre: "Espirituosos",
        icono: "🥃",
        articulos: [
          { nombre: "Ginebra Seagram", formato: "Botella 0,75 LTS", minimo: 2, actual: 0 },
          { nombre: "Vodka Absolut", formato: "Botella 0,75 LTS", minimo: 2, actual: 0 },
          { nombre: "Whisky J&B", formato: "Botella 0,75 LTS", minimo: 2, actual: 0 },
          { nombre: "Whisky Red Label", formato: "Botella 0,75 LTS", minimo: 2, actual: 0 }
        ]
      },
      lacteos: {
        nombre: "Lácteos",
        icono: "🥛",
        articulos: [
          { nombre: "Sin lactosa", formato: "Tetrabrik", minimo: 1, actual: 0 },
          { nombre: "Semi desnatada", formato: "Tetrabrik", minimo: 6, actual: 0 },
          { nombre: "Entera", formato: "Tetrabrik", minimo: 4, actual: 0 },
          { nombre: "Mantequilla", formato: "Paquetes 250 gms", minimo: 2, actual: 0 },
          { nombre: "Queso Granna Padano rallado", formato: "Sobres", minimo: 3, actual: 0 },
          { nombre: "Queso manchego", formato: "Pieza", minimo: 1, actual: 0, notas: "Medio" }
        ]
      }
    }
  },
  limpieza: {
    nombre: "Armario Limpieza",
    icono: "🧹",
    grupos: {
      detergentes: {
        nombre: "Detergentes",
        icono: "🧴",
        articulos: [
          { nombre: "Micolor", formato: "Paquete", minimo: 3, actual: 0 },
          { nombre: "Lavajillas", formato: "Bidón 5 LTS", minimo: 3, actual: 0 },
          { nombre: "Vanish Oxi Advance", formato: "Paquete", minimo: 3, actual: 0 },
          { nombre: "Ariel", formato: "Paquete", minimo: 3, actual: 0 }
        ]
      },
      higiene: {
        nombre: "Higiene",
        icono: "🧻",
        articulos: [
          { nombre: "Papel higiénico", formato: "Rollos", minimo: 30, actual: 0 },
          { nombre: "Papel cocina", formato: "Rollos", minimo: 6, actual: 0 },
          { nombre: "Servilletas aperitivo blancas pequeñas", formato: "Paquete 100 uds", minimo: 4, actual: 0 },
          { nombre: "Servilletas papel blancas grandes", formato: "Paquete 100 uds", minimo: 6, actual: 0 },
          { nombre: "Jabón de mano pequeño", formato: "Bote con dosificador", minimo: 2, actual: 0 },
          { nombre: "Pañuelos faciales", formato: "Caja", minimo: 2, actual: 0 },
          { nombre: "Kleenex 70 uds", formato: "Caja cartón baja", minimo: 2, actual: 0 },
          { nombre: "Kleenex 140 uds", formato: "Caja cartón alta", minimo: 2, actual: 0 },
          { nombre: "Champú neutro / Makro", formato: "Caja sobres", minimo: 1, actual: 0 },
          { nombre: "Gel de baño / Makro", formato: "Caja sobres", minimo: 1, actual: 0 }
        ]
      },
      desinfectantes: {
        nombre: "Desinfectantes",
        icono: "🧪",
        articulos: [
          { nombre: "Lejía", formato: "Bidón 5 LTS", minimo: 1, actual: 0 },
          { nombre: "Agua fuerte", formato: "Botella", minimo: 2, actual: 0 },
          { nombre: "Amoniaco perfumado", formato: "Botella", minimo: 2, actual: 0 },
          { nombre: "Sosa cáustica", formato: "Botella", minimo: 1, actual: 0 },
          { nombre: "Biakal", formato: "Botella", minimo: 2, actual: 0 },
          { nombre: "Mr. Músculo forza horno", formato: "Spray", minimo: 2, actual: 0 },
          { nombre: "Insecticida moscas", formato: "Spray", minimo: 2, actual: 0 },
          { nombre: "Estropajos inox", formato: "Caja 3 uds", minimo: 1, actual: 0 },
          { nombre: "Guantes de goma", formato: "Caja", minimo: 1, actual: 0 },
          { nombre: "Bayetas", formato: "Unidades", minimo: 2, actual: 0 },
          { nombre: "Repuesto de mopa", formato: "Unidades", minimo: 2, actual: 0 },
          { nombre: "Repuesto fregona", formato: "Unidades", minimo: 2, actual: 0 },
          { nombre: "Vitroclen", formato: "Botella", minimo: 2, actual: 0 },
          { nombre: "Limpiacristales", formato: "Botella", minimo: 2, actual: 0 },
          { nombre: "Fairy", formato: "Botella 480 ML", minimo: 2, actual: 0 },
          { nombre: "Esponja salva uñas", formato: "Unidades", minimo: 3, actual: 0 }
        ]
      },
      otros: {
        nombre: "Otros",
        icono: "📦",
        articulos: [
          { nombre: "Bolsa aspiradora Nilfisk", formato: "Caja de 5 uds", minimo: 2, actual: 0 },
          { nombre: "KH7 sin manchas", formato: "Botella", minimo: 2, actual: 0 },
          { nombre: "KH7 quita grasa", formato: "Botella", minimo: 2, actual: 0 },
          { nombre: "Vinagre de ropa", formato: "Botella", minimo: 3, actual: 0 },
          { nombre: "Alcohol de quemar", formato: "Botella", minimo: 1, actual: 0 },
          { nombre: "Saco de basura 100L", formato: "Rollo", minimo: 2, actual: 0 },
          { nombre: "Bolsa cubo basura 50L", formato: "Rollo", minimo: 6, actual: 0 },
          { nombre: "Bolsa basura baños 20L", formato: "Rollo", minimo: 4, actual: 0 }
        ]
      }
    }
  }
};

// Función para cargar el inventario en Firebase
async function cargarInventario(bienId) {
  if (!bienId) {
    console.error('❌ Debes proporcionar el ID del bien');
    console.log('Uso: cargarInventario("ID_DEL_BIEN")');
    return;
  }

  try {
    // Crear el documento de inventario
    await db.collection('bienes').doc(bienId).update({
      inventario: inventarioBasico,
      inventarioActualizado: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Inventario cargado correctamente para el bien:', bienId);
    console.log('📊 Resumen:');
    console.log('   - 🏪 Despensa: 15 grupos');
    console.log('   - ❄️ Cámara: 7 grupos');
    console.log('   - 🧹 Limpieza: 4 grupos');
    console.log('   - Total artículos: ~130');
    
  } catch (error) {
    console.error('❌ Error al cargar inventario:', error);
  }
}

// Función para ver el inventario cargado
async function verInventario(bienId) {
  try {
    const doc = await db.collection('bienes').doc(bienId).get();
    if (doc.exists && doc.data().inventario) {
      console.log('📦 Inventario del bien:', bienId);
      console.log(doc.data().inventario);
    } else {
      console.log('⚠️ No hay inventario cargado para este bien');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

console.log('✅ Script de inventario cargado');
console.log('📌 Funciones disponibles:');
console.log('   - cargarInventario("ID_DEL_BIEN") - Carga el inventario básico');
console.log('   - verInventario("ID_DEL_BIEN") - Ver inventario actual');
