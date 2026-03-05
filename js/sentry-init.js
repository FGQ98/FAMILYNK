// ============================================================
//  FAMILYNK — Sentry Error Tracking
//  Incluir DESPUÉS del script de Sentry CDN en cada página HTML
//  <script src="https://browser.sentry-cdn.com/8.55.0/bundle.min.js"></script>
//  <script src="/js/sentry-init.js"></script>
// ============================================================

Sentry.init({
  dsn: "https://00af354e8c23c2ac6a114ca773d97c9e@o4510991958736896.ingest.de.sentry.io/4510991973613648",

  // Entorno: cambia a "production" si quieres filtrar en Sentry
  environment: "production",

  // Versión del proyecto (actualiza con cada deploy importante)
  release: "familynk@1.0.0",

  // Captura el 100% de los errores (puedes bajar a 0.5 si hay mucho volumen)
  sampleRate: 1.0,

  // Captura el contexto extra automáticamente
  autoSessionTracking: true,

  // Ignorar errores irrelevantes (extensiones de navegador, etc.)
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    /^chrome-extension/,
    /^moz-extension/,
  ],
});

// ── Añadir contexto del usuario autenticado ──────────────────
// Llama a esta función cuando el usuario haga login en Firebase
function sentryIdentificarUsuario(uid, email, rol) {
  Sentry.setUser({
    id: uid,
    email: email,
    rol: rol || "desconocido",
  });
}

// Llama a esta función cuando el usuario haga logout
function sentryClearUsuario() {
  Sentry.setUser(null);
}

// ── Añadir contexto de la página actual ─────────────────────
// Se ejecuta automáticamente al cargar
Sentry.setTag("pagina", window.location.pathname);
