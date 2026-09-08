const pool = require('../config/db');

const BADGES = Object.freeze({
  BLUE: Object.freeze({ type: 'blue', label: 'Blue subscriber', color: '#1d9bf0' }),
  PURPLE: Object.freeze({ type: 'purple', label: 'Premium subscriber', color: '#7c3aed' }),
  GOLD: Object.freeze({ type: 'gold', label: 'Verified organization', color: '#d4a017' }),
  OFFICIAL: Object.freeze({ type: 'official', label: 'Official Bloggad platform account', color: '#102a43' }),
});

function emptyBadge() {
  return { type: null, label: null, color: null, visible: false, source: null };
}

function normalizeBadge(badge, source) {
  if (!badge) return emptyBadge();
  return { ...badge, visible: true, source };
}

function paidBadgeForPrice(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return null;
  if (amount >= 100) return BADGES.PURPLE;
  if (amount >= 20) return BADGES.BLUE;
  return null;
}

async function getApprovedIdentityVerification(writerUserId, executor = pool) {
  const [rows] = await executor.query(
    `SELECT id, writer_user_id, badge_type, entity_type, legal_name, public_name,
            status, reviewed_by_user_id, reviewed_at, issued_at
       FROM writer_identity_verifications
      WHERE writer_user_id = ? AND status = 'approved'
      LIMIT 1`,
    [Number(writerUserId)]
  );
  return rows[0] || null;
}

async function getActiveWriterSubscription(writerUserId, executor = pool) {
  const [rows] = await executor.query(
    `SELECT s.id, s.user_id, s.plan_id, s.status, s.start_date, s.end_date,
            p.name AS plan_name, p.price AS plan_price, p.billing_cycle
       FROM affiliate_subscriptions s
       INNER JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.user_id = ?
        AND s.status = 'active'
        AND p.status = 'active'
        AND (s.start_date IS NULL OR s.start_date <= NOW())
        AND (s.end_date IS NULL OR s.end_date > NOW())
      ORDER BY p.price DESC, s.end_date DESC, s.id DESC
      LIMIT 1`,
    [Number(writerUserId)]
  );
  return rows[0] || null;
}

async function resolveWriterVerificationBadge(writerUserId, executor = pool) {
  const id = Number(writerUserId);
  if (!Number.isInteger(id) || id <= 0) return emptyBadge();

  const [verification, subscription] = await Promise.all([
    getApprovedIdentityVerification(id, executor),
    getActiveWriterSubscription(id, executor),
  ]);

  if (verification && verification.badge_type === 'official') {
    return normalizeBadge(BADGES.OFFICIAL, 'admin');
  }

  const planPrice = subscription ? Number(subscription.plan_price) : null;
  if (verification && verification.badge_type === 'gold' && planPrice >= 499) {
    return normalizeBadge(BADGES.GOLD, 'organization_verification');
  }

  return normalizeBadge(paidBadgeForPrice(planPrice), 'subscription');
}

async function resolveWriterVerificationBadges(writerUserIds, executor = pool) {
  const ids = [...new Set((writerUserIds || []).map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!ids.length) return {};
  const placeholders = ids.map(() => '?').join(', ');
  const [verificationRows] = await executor.query(
    `SELECT writer_user_id, badge_type FROM writer_identity_verifications
      WHERE writer_user_id IN (${placeholders}) AND status = 'approved'
      ORDER BY id DESC`, ids
  );
  const [subscriptionRows] = await executor.query(
    `SELECT s.user_id, p.price AS plan_price FROM affiliate_subscriptions s
       INNER JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.user_id IN (${placeholders}) AND s.status = 'active' AND p.status = 'active'
        AND (s.start_date IS NULL OR s.start_date <= NOW())
        AND (s.end_date IS NULL OR s.end_date > NOW())
      ORDER BY p.price DESC, s.end_date DESC, s.id DESC`, ids
  );
  const verifications = new Map();
  verificationRows.forEach((row) => { if (!verifications.has(Number(row.writer_user_id))) verifications.set(Number(row.writer_user_id), row); });
  const prices = new Map();
  subscriptionRows.forEach((row) => { if (!prices.has(Number(row.user_id))) prices.set(Number(row.user_id), Number(row.plan_price)); });
  return Object.fromEntries(ids.map((id) => {
    const verification = verifications.get(id);
    const price = prices.get(id);
    let badge = paidBadgeForPrice(price);
    let source = 'subscription';
    if (verification?.badge_type === 'official') { badge = BADGES.OFFICIAL; source = 'admin'; }
    else if (verification?.badge_type === 'gold' && price >= 499) { badge = BADGES.GOLD; source = 'organization_verification'; }
    return [id, normalizeBadge(badge, source)];
  }));
}

module.exports = {
  BADGES,
  emptyBadge,
  paidBadgeForPrice,
  getApprovedIdentityVerification,
  getActiveWriterSubscription,
  resolveWriterVerificationBadge,
  resolveWriterVerificationBadges,
};
