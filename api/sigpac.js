/**
 * FAMILYNK — api/sigpac.js
 * Vercel Serverless Function
 *
 * Proxy para servicios SIGPAC y Catastro que tienen restricciones CORS
 * desde el navegador. Esta función corre en servidor (Vercel Edge) y
 * no tiene esas restricciones.
 *
 * Endpoints disponibles:
 *
 *   GET /api/sigpac?tipo=municipiobox&provincia=28&municipio=79
 *   GET /api/sigpac?tipo=parcela&provincia=28&municipio=79&poligono=4&parcela=55
 *   GET /api/sigpac?tipo=recinto&provincia=28&municipio=79&poligono=4&parcela=55&recinto=1
 *   GET /api/sigpac?tipo=catastro_rc&rc=9872023VH5197S0001WX
 *   GET /api/sigpac?tipo=catastro_coords&lon=-3.7&lat=40.4
 *
 * Referencia SIGPAC — formato numérico:
 *   provincia: 2 dígitos (ej. 28 = Madrid, 45 = Toledo, 14 = Córdoba)
 *   municipio:  3 dígitos con ceros a la izquierda (ej. 079)
 *   poligono:   número de polígono catastral
 *   parcela:    número de parcela
 *   recinto:    número de recinto (opcional, subparcela)
 */

export default async function handler(req, res) {

  // CORS — permitir llamadas desde el dominio de FAMILYNK y localhost
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { tipo, provincia, municipio, poligono, parcela, recinto, rc, lat, lon } = req.query;

  if (!tipo) {
    return res.status(400).json({ error: 'Parámetro "tipo" requerido' });
  }

  let targetUrl;

  try {
    switch (tipo) {

      // Bounding box de un municipio — para centrar el mapa
      case 'municipiobox': {
        if (!provincia || !municipio) {
          return res.status(400).json({ error: 'Faltan provincia y municipio' });
        }
        const prov = provincia.padStart(2, '0');
        const mun  = municipio.padStart(3, '0');
        targetUrl = `https://sigpac.mapa.gob.es/fega/serviciosvisorsigpac/query/municipiobox/${prov}/${mun}.geojson`;
        break;
      }

      // Bounding box de una provincia
      case 'provinciabox': {
        if (!provincia) {
          return res.status(400).json({ error: 'Falta provincia' });
        }
        const prov = provincia.padStart(2, '0');
        targetUrl = `https://sigpac.mapa.gob.es/fega/serviciosvisorsigpac/query/provinciabox/${prov}.geojson`;
        break;
      }

      // Geometría y atributos de una parcela completa (todos sus recintos)
      case 'parcela': {
        if (!provincia || !municipio || !poligono || !parcela) {
          return res.status(400).json({ error: 'Faltan provincia, municipio, poligono o parcela' });
        }
        const prov = provincia.padStart(2, '0');
        const mun  = municipio.padStart(3, '0');
        targetUrl = `https://sigpac.mapa.gob.es/fega/serviciosvisorsigpac/query/parcela/${prov}/${mun}/${poligono}/${parcela}.geojson`;
        break;
      }

      // Geometría de un recinto concreto (subparcela)
      case 'recinto': {
        if (!provincia || !municipio || !poligono || !parcela || !recinto) {
          return res.status(400).json({ error: 'Faltan datos del recinto' });
        }
        const prov = provincia.padStart(2, '0');
        const mun  = municipio.padStart(3, '0');
        targetUrl = `https://sigpac.mapa.gob.es/fega/serviciosvisorsigpac/query/recinto/${prov}/${mun}/${poligono}/${parcela}/${recinto}.geojson`;
        break;
      }

      // Consulta Catastro por Referencia Catastral
      case 'catastro_rc': {
        if (!rc) {
          return res.status(400).json({ error: 'Falta referencia catastral (rc)' });
        }
        targetUrl = `https://ovc.catastro.meh.es/ovcservweb/OVCWcfLibres/OVCFotoFachada.svc/Consulta_DNPRC?Provincia=&Municipio=&RC=${encodeURIComponent(rc)}&DatosExcel=0`;
        break;
      }

      // Consulta Catastro por coordenadas — útil para clic en mapa
      case 'catastro_coords': {
        if (!lat || !lon) {
          return res.status(400).json({ error: 'Faltan lat y lon' });
        }
        targetUrl = `https://ovc.catastro.meh.es/ovcservweb/OVCWcfLibres/OVCFotoFachada.svc/Consulta_RCCOOR?SRS=EPSG:4326&Coordenada_X=${lon}&Coordenada_Y=${lat}&Consulta_RC`;
        break;
      }

      // Búsqueda de municipios por nombre — complementa Nominatim con datos oficiales
      case 'municipios': {
        if (!req.query.nombre) {
          return res.status(400).json({ error: 'Falta nombre del municipio' });
        }
        // Nominatim ya funciona sin CORS — esta ruta es para datos catastrales adicionales
        targetUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(req.query.nombre + ' España')}&format=json&limit=5&addressdetails=1&countrycodes=es`;
        break;
      }

      default:
        return res.status(400).json({ error: `Tipo desconocido: ${tipo}` });
    }

    // Hacer la petición al servicio oficial
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'FAMILYNK/1.0 (hola@familynk.es)',
        'Accept': 'application/json, application/geo+json, */*'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `El servicio externo devolvió ${response.status}`,
        url: targetUrl
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('json') || contentType.includes('geo+json');

    if (isJson) {
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      // XML (Catastro a veces devuelve XML) — devolver como texto
      const text = await response.text();
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(text);
    }

  } catch (err) {
    console.error('[sigpac]', err.message);

    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Timeout — el servicio externo tardó demasiado' });
    }

    return res.status(500).json({ error: err.message });
  }
}
