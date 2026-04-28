const pool = require('../../config/db');

function cleanAmount(value, fallback = 0) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;
  return Number(amount.toFixed(4));
}

async function ensureAffiliateAdsSettings() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS affiliate_ads_settings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

      minimum_budget DECIMAL(12,4) NOT NULL DEFAULT 10.0000,

      product_cost_per_view DECIMAL(12,4) NOT NULL DEFAULT 0.0015,
      product_cost_per_click DECIMAL(12,4) NOT NULL DEFAULT 0.0700,

      post_cost_per_view DECIMAL(12,4) NOT NULL DEFAULT 0.0010,
      post_cost_per_click DECIMAL(12,4) NOT NULL DEFAULT 0.0400,

      website_cost_per_view DECIMAL(12,4) NOT NULL DEFAULT 0.0010,
      website_cost_per_click DECIMAL(12,4) NOT NULL DEFAULT 0.0500,

      currency VARCHAR(10) NOT NULL DEFAULT 'USD',

      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    INSERT INTO affiliate_ads_settings (
      id,
      minimum_budget,
      product_cost_per_view,
      product_cost_per_click,
      post_cost_per_view,
      post_cost_per_click,
      website_cost_per_view,
      website_cost_per_click,
      currency
    )
    VALUES (
      1,
      10.0000,
      0.0015,
      0.0700,
      0.0010,
      0.0400,
      0.0010,
      0.0500,
      'USD'
    )
    ON DUPLICATE KEY UPDATE
      id = id
  `);
}

async function getAffiliateAdsSettings(req, res, next) {
  try {
    await ensureAffiliateAdsSettings();

    const [rows] = await pool.query(`
      SELECT *
      FROM affiliate_ads_settings
      WHERE id = 1
      LIMIT 1
    `);

    return res.status(200).json({
      ok: true,
      settings: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateAffiliateAdsSettings(req, res, next) {
  try {
    await ensureAffiliateAdsSettings();

    const minimumBudget = cleanAmount(req.body.minimum_budget, 10);

    const productCostPerView = cleanAmount(req.body.product_cost_per_view, 0.0015);
    const productCostPerClick = cleanAmount(req.body.product_cost_per_click, 0.07);

    const postCostPerView = cleanAmount(req.body.post_cost_per_view, 0.001);
    const postCostPerClick = cleanAmount(req.body.post_cost_per_click, 0.04);

    const websiteCostPerView = cleanAmount(req.body.website_cost_per_view, 0.001);
    const websiteCostPerClick = cleanAmount(req.body.website_cost_per_click, 0.05);

    const currency = String(req.body.currency || 'USD').trim().toUpperCase() || 'USD';

    if (minimumBudget <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Minimum budget must be greater than zero.',
      });
    }

    await pool.query(
      `
        UPDATE affiliate_ads_settings
        SET
          minimum_budget = ?,
          product_cost_per_view = ?,
          product_cost_per_click = ?,
          post_cost_per_view = ?,
          post_cost_per_click = ?,
          website_cost_per_view = ?,
          website_cost_per_click = ?,
          currency = ?
        WHERE id = 1
      `,
      [
        minimumBudget,
        productCostPerView,
        productCostPerClick,
        postCostPerView,
        postCostPerClick,
        websiteCostPerView,
        websiteCostPerClick,
        currency,
      ]
    );

    const [rows] = await pool.query(`
      SELECT *
      FROM affiliate_ads_settings
      WHERE id = 1
      LIMIT 1
    `);

    return res.status(200).json({
      ok: true,
      message: 'Affiliate ads pricing settings updated successfully.',
      settings: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ensureAffiliateAdsSettings,
  getAffiliateAdsSettings,
  updateAffiliateAdsSettings,
};