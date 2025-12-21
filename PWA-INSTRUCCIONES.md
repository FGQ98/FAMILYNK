# FAMILYNK — Configuración PWA (Pantalla de Inicio)

## Archivos a colocar en la carpeta `img/`:
- icon-180.png (para iOS Safari)
- icon-192.png (para Android Chrome)
- icon-512.png (para splash screen)

## Archivo a colocar en la raíz (junto a los .html):
- manifest.json

## Código a añadir en TODOS los archivos HTML

Añade estas líneas en el `<head>`, justo después de `<title>`:

```html
<!-- PWA & Icons -->
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#7A9E7E">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="FAMILYNK">
<link rel="apple-touch-icon" href="img/icon-180.png">
<link rel="icon" type="image/png" sizes="192x192" href="img/icon-192.png">
<link rel="icon" type="image/png" sizes="32x32" href="img/icon-192.png">
```

## Archivos HTML donde añadirlo:
- index.html
- login.html
- registro.html
- cgi.html
- mi-nido.html ✅ (ya incluido)
- nido.html
- admin-nido.html
- arbol.html
- lo-comun.html
- bien.html
- mayordomo.html
- gerente.html
- capataz.html
- ayuda.html
- herramienta-escaleta.html
- (y cualquier otro .html)

## Resultado:
Cuando el usuario añada la web a la pantalla de inicio desde Safari o Chrome, 
aparecerá el logo del árbol con nidos como icono de la app.
