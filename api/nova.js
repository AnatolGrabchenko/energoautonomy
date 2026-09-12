const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

function clean(s, n = 200) {
  return String(s ?? '').trim().slice(0, n);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const key = process.env.NOVA_POSHTA_API_KEY;
  if (!key) {
    return res.status(503).json({
      success: false,
      error: 'NOVA_POSHTA_API_KEY is not configured',
    });
  }

  try {
    const methodProperties = req.body?.methodProperties || {};
    const method = String(req.body?.method || 'getWarehouses');
    const allowed = new Set(['getCities', 'getWarehouses']);
    if (!allowed.has(method)) {
      return res.status(400).json({ success: false, error: 'Unsupported Nova Poshta method' });
    }

    const modelName = method === 'getCities' ? 'Address' : 'AddressGeneral';

    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: key,
        modelName,
        calledMethod: method,
        methodProperties,
      }),
    });

    const d = await r.json();
    if (!r.ok || !d.success) {
      const msg = (d.errors || d.warnings || ['Nova Poshta API error']).join('; ');
      return res.status(400).json({ success: false, error: msg });
    }

    return res.status(200).json({ success: true, data: d.data || [] });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: clean(e.message || 'Nova Poshta error'),
    });
  }
};
