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
  const pie = datos.pie || '';
  const hasBien = !!datos.bien;

  return `
    <div style="font-family:'Nunito',Arial,sans-serif;background-color:#FDF8F3;color:#3D3D3D;max-width:520px;margin:0 auto;padding:0;">
      <div style="background:${headerColor};padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
        <img src="https://www.familynk.es/logo_familynk.png" alt="Familynk" style="width:48px;height:48px;margin-bottom:8px;" />
        <h2 style="font-family:'Quicksand',sans-serif;color:#FFFFFF;margin:0;font-size:18px;">${titulo}</h2>
        ${hasBien ? `<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;">${datos.bien}</p>` : ''}
        ${datos.fechaInicio ? `<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:4px 0 0;">📅 ${datos.fechaInicio}${datos.fechaFin ? ' → ' + datos.fechaFin : ''}</p>` : ''}
      </div>
      <div style="padding:24px;">
        <div style="background:#FFFFFF;border-radius:10px;padding:20px;border:1px solid #F5EDE4;">
          <p style="line-height:1.7;font-size:14px;margin:0;color:#3D3D3D;">${cuerpo}</p>
        </div>
        ${pie ? `<p style="margin-top:16px;font-size:12px;color:#9A9A9A;text-align:center;">${pie}</p>` : ''}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #F5EDE4;text-align:center;">
          <img src="https://www.familynk.es/logo_familynk.png" alt="Familynk" style="width:24px;height:24px;opacity:0.4;margin-bottom:4px;" />
          <p style="font-size:11px;color:#CACACA;margin:0;">Familynk · Tu familia, bien organizada</p>
          <p style="font-size:10px;color:#E0DCD6;margin:4px 0 0;">www.familynk.es</p>
        </div>
      </div>
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
