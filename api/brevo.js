// api/brevo.js — Vercel Serverless: Notificaciones FAMILYNK via Brevo
// Canales: email (transaccional) + SMS
// La API key va en Vercel → Settings → Environment Variables → BREVO_API_KEY

const BREVO_API = 'https://api.brevo.com/v3';
const SENDER_EMAIL = { name: 'Familynk', email: 'hola@familynk.es' };
const SENDER_SMS = 'Familynk';

// ─── CORS ────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

// ─── ENVIAR EMAIL ────────────────────────────────────────────────
async function enviarEmail(apiKey, { destinatarios, asunto, html, texto }) {
  const to = destinatarios.map(d =>
    typeof d === 'string' ? { email: d } : { email: d.email, name: d.nombre || undefined }
  );

  const body = {
    sender: SENDER_EMAIL,
    to,
    subject: asunto,
    htmlContent: html || `<p>${texto || ''}</p>`
  };

  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Brevo email error ${res.status}`);
  return { canal: 'email', messageId: data.messageId, enviados: to.length };
}

// ─── ENVIAR SMS ──────────────────────────────────────────────────
async function enviarSMS(apiKey, { destinatarios, mensaje }) {
  // SMS se envía uno a uno (Brevo transactional SMS)
  const resultados = [];

  for (const dest of destinatarios) {
    const telefono = typeof dest === 'string' ? dest : dest.telefono;
    if (!telefono) continue;

    // Formato internacional: +34612345678
    const tel = telefono.startsWith('+') ? telefono : `+34${telefono}`;

    const body = {
      sender: SENDER_SMS,
      recipient: tel,
      content: mensaje,
      type: 'transactional'
    };

    const res = await fetch(`${BREVO_API}/transactionalSMS/sms`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      resultados.push({ telefono: tel, ok: false, error: data.message });
    } else {
      resultados.push({ telefono: tel, ok: true, messageId: data.reference });
    }
  }

  return { canal: 'sms', resultados, enviados: resultados.filter(r => r.ok).length };
}

// ─── PLANTILLAS HTML ─────────────────────────────────────────────
function plantillaHTML(tipo, datos) {
  const estiloBase = `
    font-family: 'Nunito', Arial, sans-serif;
    background-color: #FDF8F3;
    color: #3D3D3D;
    max-width: 520px;
    margin: 0 auto;
    padding: 24px;
  `;
  const headerColor = {
    reserva: '#8B7355',
    evento: '#7A9E7E',
    pauta: '#2D4A5C',
    queo: '#7A9E7E',
    urgente: '#D4695A'
  }[tipo] || '#7A9E7E';

  const titulo = datos.titulo || datos.asunto || 'Notificación';
  const cuerpo = datos.cuerpo || datos.mensaje || '';
  const bien = datos.bien ? `<p style="color:#6B6B6B;font-size:13px;">📍 ${datos.bien}</p>` : '';
  const fechas = datos.fechaInicio
    ? `<p style="color:#6B6B6B;font-size:13px;">📅 ${datos.fechaInicio}${datos.fechaFin ? ' → ' + datos.fechaFin : ''}</p>`
    : '';
  const pie = datos.pie || '';

  return `
    <div style="${estiloBase}">
      <div style="text-align:center;margin-bottom:20px;">
        <span style="font-size:24px;">🌿</span>
        <h2 style="font-family:'Quicksand',sans-serif;color:${headerColor};margin:8px 0 4px;">
          ${titulo}
        </h2>
        ${bien}${fechas}
      </div>
      <div style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <p style="line-height:1.6;font-size:14px;">${cuerpo}</p>
      </div>
      ${pie ? `<p style="margin-top:16px;font-size:12px;color:#9A9A9A;text-align:center;">${pie}</p>` : ''}
      <p style="margin-top:24px;font-size:11px;color:#CACACA;text-align:center;">
        Familynk · Tu familia, bien organizada
      </p>
    </div>
  `;
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────
module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'BREVO_API_KEY no configurada' });
  }

  // Headers CORS
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  try {
    const {
      canal = 'email',       // 'email' | 'sms'
      tipo = 'queo',         // 'reserva' | 'evento' | 'pauta' | 'queo' | 'urgente'
      destinatarios = [],    // [{email, nombre, telefono}] o ['email@...'] o ['+34...']
      asunto = '',           // Solo email
      mensaje = '',          // Texto plano (SMS usa esto; email usa como fallback)
      datos = {}             // Datos extra para plantilla HTML
    } = req.body;

    if (!destinatarios.length) {
      return res.status(400).json({ error: 'Sin destinatarios' });
    }

    let resultado;

    if (canal === 'sms') {
      if (!mensaje) return res.status(400).json({ error: 'SMS requiere mensaje' });
      resultado = await enviarSMS(apiKey, { destinatarios, mensaje });
    } else {
      // Email — generar HTML con plantilla
      const html = plantillaHTML(tipo, {
        titulo: datos.titulo || asunto,
        cuerpo: datos.cuerpo || mensaje,
        bien: datos.bien,
        fechaInicio: datos.fechaInicio,
        fechaFin: datos.fechaFin,
        pie: datos.pie
      });
      resultado = await enviarEmail(apiKey, {
        destinatarios,
        asunto: asunto || `Familynk · ${tipo}`,
        html,
        texto: mensaje
      });
    }

    return res.status(200).json({ ok: true, ...resultado });

  } catch (error) {
    console.error('Brevo error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};
