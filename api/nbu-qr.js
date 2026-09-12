const { baseUrl } = require('./_lib/mono');
const { saveOrder } = require('./_lib/db');

function b64url(s) {
  return Buffer.from(s, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function clean(v, max) {
  return String(v ?? '').trim().slice(0, max);
}

function amount(v) {
  if (v === null || v === undefined || v === '') return '';
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return '';
  return `UAH${n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
}

function validIban(v) {
  const x = String(v || '')
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!/^UA\d{27}$/.test(x)) return false;
  const r = x.slice(4) + x.slice(0, 4);
  let n = '';
  for (const c of r) n += /[0-9]/.test(c) ? c : c.charCodeAt(0) - 55;
  let rem = 0;
  for (let i = 0; i < n.length; i += 7) rem = Number(String(rem) + n.slice(i, i + 7)) % 97;
  return rem === 1;
}

function build({ orderId, total, purpose }) {
  const recipient = clean(process.env.SELLER_NAME || 'ENERGOAUTONOMY', 140);
  const account = String(process.env.SELLER_IBAN || '').replace(/\s+/g, '');
  const code = clean(process.env.SELLER_EDRPOU || '', 10);
  if (!validIban(account)) throw new Error('SELLER_IBAN не налаштовано (потрібен валідний UA IBAN)');
  if (!code) throw new Error('SELLER_EDRPOU не налаштовано');
  if (!purpose) purpose = `Оплата замовлення №${orderId}`;
  const parts = [
    'BCD','003','1','ICT','',recipient,account,amount(total),code,'MP2B/GSCB',
    clean(orderId, 35),clean(purpose, 420),'','FFFF','','',''
  ];
  return 'https://qr.bank.gov.ua/' + b64url(parts.join('\n'));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const o = req.body || {};
    if (!o.orderId || !Number.isFinite(Number(o.total))) {
      throw new Error('orderId and total are required');
    }
    const url = build(o);
    await saveOrder({
      order_id: String(o.orderId),
      customer_name: String(o.name || 'Клієнт'),
      phone: String(o.phone || ''),
      email: String(o.email || ''),
      city: String(o.city || ''),
      delivery: String(o.delivery || ''),
      payment_method: String(o.payment || 'qr'),
      payment_status: 'pending',
      order_status: 'new',
      total: Number(o.total),
      currency: 'UAH',
      items: Array.isArray(o.items) ? o.items : [],
      comment: String(o.comment || ''),
      payment_provider: 'nbu_qr',
    }).catch(() => null);

    return res.status(200).json({
      ok: true,
      url,
      recipient: process.env.SELLER_NAME || 'ENERGOAUTONOMY',
      iban: process.env.SELLER_IBAN,
      recipientCode: process.env.SELLER_EDRPOU,
      baseUrl: baseUrl(req),
    });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'NBU QR error' });
  }
};
