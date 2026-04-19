const pool = require('../config/db');

async function trackProductView({
  productId,
  websiteId,
  ipAddress = null,
  referrer = null,
  userAgent = null,
}) {
  await pool.query(
    `
    INSERT INTO analytics_product_views
    (
      product_id,
      website_id,
      user_id,
      ip_address,
      referrer,
      user_agent,
      created_at
    )
    VALUES (?, ?, NULL, ?, ?, ?, NOW())
    `,
    [productId, websiteId, ipAddress, referrer, userAgent]
  );
}

async function trackProductClick({
  productId,
  websiteId,
  clickType,
  ipAddress = null,
  referrer = null,
  userAgent = null,
}) {
  await pool.query(
    `
    INSERT INTO analytics_product_clicks
    (
      product_id,
      website_id,
      click_type,
      referrer,
      ip_address,
      user_agent,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [productId, websiteId, clickType, referrer, ipAddress, userAgent]
  );
}

async function trackPostView({
  postId,
  productId = null,
  websiteId,
  ipAddress = null,
  referrer = null,
  userAgent = null,
}) {
  await pool.query(
    `
    INSERT INTO analytics_post_views
    (
      post_id,
      product_id,
      website_id,
      referrer,
      ip_address,
      user_agent,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [postId, productId, websiteId, referrer, ipAddress, userAgent]
  );
}

async function trackSliderClick({
  sliderId,
  websiteId,
  ipAddress = null,
  referrer = null,
  userAgent = null,
}) {
  await pool.query(
    `
    INSERT INTO analytics_slider_clicks
    (
      slider_id,
      website_id,
      referrer,
      ip_address,
      user_agent,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, NOW())
    `,
    [sliderId, websiteId, referrer, ipAddress, userAgent]
  );
}

module.exports = {
  trackProductView,
  trackProductClick,
  trackPostView,
  trackSliderClick,
};