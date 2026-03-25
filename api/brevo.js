// api/brevo.js — Vercel Serverless: Notificaciones FAMILYNK via Brevo
// Compatible con Node 16+ (sin dependencia de fetch nativo)

const https = require('https');

const SENDER_EMAIL = { name: 'Familynk', email: 'hola@familynk.es' };
const SENDER_SMS = 'Familynk';

// ─── HELPER: request a Brevo API ─────────────────────────────────
function brevoRequest(path, body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.brevo.com',
      path: `/v3/${path}`,
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (d) => { chunks += d; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(chunks);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.message || `Brevo error ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${chunks.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
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

  const result = await brevoRequest('smtp/email', body, apiKey);
  return { canal: 'email', messageId: result.messageId, enviados: to.length };
}

// ─── ENVIAR SMS ──────────────────────────────────────────────────
async function enviarSMS(apiKey, { destinatarios, mensaje }) {
  const resultados = [];

  for (const dest of destinatarios) {
    const telefono = typeof dest === 'string' ? dest : dest.telefono;
    if (!telefono) continue;

    const tel = telefono.startsWith('+') ? telefono : `+34${telefono}`;

    try {
      const result = await brevoRequest('transactionalSMS/sms', {
        sender: SENDER_SMS,
        recipient: tel,
        content: mensaje,
        type: 'transactional'
      }, apiKey);
      resultados.push({ telefono: tel, ok: true, messageId: result.reference });
    } catch (err) {
      resultados.push({ telefono: tel, ok: false, error: err.message });
    }
  }

  return { canal: 'sms', resultados, enviados: resultados.filter(r => r.ok).length };
}

// ─── PLANTILLA HTML ──────────────────────────────────────────────
function plantillaHTML(tipo, datos) {
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
    <div style="font-family:'Nunito',Arial,sans-serif;background-color:#FDF8F3;color:#3D3D3D;max-width:520px;margin:0 auto;padding:24px;">
      <div style="text-align:center;margin-bottom:20px;">
        <span style="font-size:24px;">🌿</span>
        <h2 style="font-family:'Quicksand',sans-serif;color:${headerColor};margin:8px 0 4px;">${titulo}</h2>
        ${bien}${fechas}
      </div>
      <div style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <p style="line-height:1.6;font-size:14px;">${cuerpo}</p>
      </div>
      ${pie ? `<p style="margin-top:16px;font-size:12px;color:#9A9A9A;text-align:center;">${pie}</p>` : ''}
      <p style="margin-top:24px;font-size:11px;color:#CACACA;text-align:center;">Familynk · Tu familia, bien organizada</p>
    </div>
  `;
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'BREVO_API_KEY no configurada en Vercel' });

  try {
    const {
      canal = 'email',
      tipo = 'queo',
      destinatarios = [],
      asunto = '',
      mensaje = '',
      datos = {}
    } = req.body;

    if (!destinatarios.length) return res.status(400).json({ error: 'Sin destinatarios' });

    let resultado;

    if (canal === 'sms') {
      if (!mensaje) return res.status(400).json({ error: 'SMS requiere mensaje' });
      resultado = await enviarSMS(apiKey, { destinatarios, mensaje });
    } else {
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
    console.error('Brevo error:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
};
