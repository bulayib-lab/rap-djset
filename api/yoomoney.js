// Vercel serverless function: HTTP-уведомления ЮMoney о входящих платежах.
// Адрес для ЮMoney: https://<твой-сайт>/api/yoomoney
// Переменные окружения в Vercel (Settings → Environment Variables):
//   YOOMONEY_SECRET            — «секрет» со страницы HTTP-уведомлений ЮMoney
//   SUPABASE_URL               — https://<project>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  — секретный ключ service_role (только здесь, никогда в коде сайта)
//   PRO_PRICE                  — цена в рублях (необязательно, по умолчанию 200)
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(200).send('RAP DJ SET payments endpoint'); return; }

  let b = req.body || {};
  if (typeof b === 'string') b = Object.fromEntries(new URLSearchParams(b));

  const secret = process.env.YOOMONEY_SECRET || '';
  const check = [b.notification_type, b.operation_id, b.amount, b.currency, b.datetime, b.sender, b.codepro, secret, b.label].join('&');
  const hash = crypto.createHash('sha1').update(check, 'utf8').digest('hex');
  if (!secret || hash !== String(b.sha1_hash || '').toLowerCase()) { res.status(400).send('bad signature'); return; }

  // тестовое уведомление, платёж с протекцией или ещё не зачисленный — ничего не включаем
  if (b.test_notification === 'true' || b.codepro === 'true' || b.unaccepted === 'true') { res.status(200).send('ok'); return; }

  const uid = String(b.label || '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) { res.status(200).send('no label'); return; }

  const price = Number(process.env.PRO_PRICE || 200);
  const paid = parseFloat(b.withdraw_amount || '0') || parseFloat(b.amount || '0');
  if (paid < price - 1) { res.status(200).send('amount too small'); return; }
  const months = Math.max(1, Math.floor((paid + 1) / price));

  const SB = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!SB || !KEY) { res.status(500).send('server not configured'); return; }
  const H = { apikey: KEY, 'Content-Type': 'application/json' };
  if (KEY.startsWith('eyJ')) H.Authorization = 'Bearer ' + KEY;

  try {
    // запись платежа; повторное уведомление с тем же operation_id игнорируется
    const ins = await fetch(SB + '/rest/v1/payments', {
      method: 'POST',
      headers: { ...H, Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify({ operation_id: String(b.operation_id), user_id: uid, amount: paid, months, raw: b })
    });
    if (!ins.ok) {
      const t = await ins.text();
      // неизвестный пользователь (нарушение внешнего ключа) — повторять бессмысленно
      if (/foreign key|23503/i.test(t)) { res.status(200).send('unknown user'); return; }
      res.status(500).send('db error'); return;
    }
    const rows = await ins.json();
    if (!rows.length) { res.status(200).send('duplicate'); return; }

    const ext = await fetch(SB + '/rest/v1/rpc/extend_pro', { method: 'POST', headers: H, body: JSON.stringify({ p_user: uid, p_months: months }) });
    if (!ext.ok) { res.status(500).send('extend failed'); return; }
    res.status(200).send('ok');
  } catch (e) {
    res.status(500).send('error');
  }
};
