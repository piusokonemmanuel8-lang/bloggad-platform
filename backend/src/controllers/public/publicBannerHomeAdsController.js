const pool = require('../../config/db');

function cleanText(value) {
  return String(value || '').trim();
}

function normalizeUrl(value) {
  const url = cleanText(value);
  return url.length > 700 ? url.slice(0, 700) : url;
}

function getVisitorIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')?.[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    ''
  );
}

function sanitizeSettings(row) {
  if (!row) {
    return {
      ad_insert_position: 5,
      max_admin_slides: 4,
      max_active_ads: 1,
      video_autoplay: true,
      status: 'active',
    };
  }

  return {
    ad_insert_position: Number(row.ad_insert_position || 5),
    max_admin_slides: Number(row.max_admin_slides || 4),
    max_active_ads: Number(row.max_active_ads || 1),
    video_autoplay: Number(row.video_autoplay || 0) === 1,
    status: row.status || 'active',
  };
}

function sanitizeAdminSlide(row) {
  if (!row) return null;

  return {
    id: `admin-${row.id}`,
    source: 'admin',
    real_id: row.id,
    slot_position: Number(row.slot_position || 1),
    media_type: row.media_type || 'image',
    image_url: row.image_url || null,
    video_url: row.video_url || null,
    poster_url: row.poster_url || null,
    eyebrow_text: row.eyebrow_text || null,
    title: row.title || '',
    subtitle: row.subtitle || null,
    promo_text: row.promo_text || null,
    cta_label: row.cta_label || 'Shop Now',
    cta_url: row.cta_url || '#',
    secondary_cta_label: row.secondary_cta_label || null,
    secondary_cta_url: row.secondary_cta_url || null,
    theme_key: row.theme_key || null,
    background_color: row.background_color || null,
    text_color: row.text_color || null,
    sort_order: Number(row.sort_order || 0),
    status: row.status || 'active',
  };
}

function sanitizeAdSlide(row) {
  if (!row) return null;

  return {
    id: `ad-${row.id}`,
    source: 'ad',
    real_id: row.id,
    campaign_id: row.id,
    owner_type: row.owner_type,
    affiliate_id: row.affiliate_id,
    website_id: row.website_id,
    media_type: row.media_type || 'image',
    image_url: row.image_url || null,
    video_url: row.video_url || null,
    poster_url: row.poster_url || null,
    eyebrow_text: row.eyebrow_text || 'Sponsored',
    title: row.title || row.campaign_title || '',
    subtitle: row.subtitle || row.campaign_description || null,
    promo_text: row.promo_text || null,
    cta_label: row.cta_label || 'Shop Now',
    cta_url: row.cta_url || '#',
    secondary_cta_label: row.secondary_cta_label || null,
    secondary_cta_url: row.secondary_cta_url || null,
    campaign_title: row.campaign_title,
    campaign_description: row.campaign_description,
    total_budget: Number(row.total_budget || 0),
    remaining_budget: Number(row.remaining_budget || 0),
    total_views: Number(row.total_views || 0),
    total_clicks: Number(row.total_clicks || 0),
    total_spent: Number(row.total_spent || 0),
    status: row.status,
    approval_status: row.approval_status,
    is_ad: true,
  };
}

async function getSettings(connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT *
    FROM banner_home_ads_settings
    WHERE setting_key = 'default'
      AND status = 'active'
    LIMIT 1
    `
  );

  return sanitizeSettings(rows[0]);
}

function insertAdSlide(adminSlides, adSlide, insertPosition) {
  if (!adSlide) return adminSlides;

  const slides = [...adminSlides];
  const index = Math.min(Math.max(Number(insertPosition || 5), 1), 5) - 1;

  slides.splice(index, 0, adSlide);
  return slides;
}

async function getPublicBannerHomeSlides(req, res) {
  try {
    const settings = await getSettings();

    const [adminRows] = await pool.query(
      `
      SELECT *
      FROM banner_home_admin_slides
      WHERE status = 'active'
      ORDER BY slot_position ASC, sort_order ASC, id ASC
      LIMIT 4
      `
    );

    const [adRows] = await pool.query(
      `
      SELECT *
      FROM banner_home_ads_campaigns
      WHERE status = 'active'
        AND approval_status = 'approved'
        AND payment_status = 'paid'
        AND remaining_budget > 0
        AND (start_date IS NULL OR DATE(start_date) <= CURDATE())
        AND (end_date IS NULL OR DATE(end_date) >= CURDATE())
        AND (
          daily_budget_cap IS NULL
          OR daily_budget_cap <= 0
          OR today_spent_date IS NULL
          OR DATE(today_spent_date) <> CURDATE()
          OR today_spent < daily_budget_cap
        )
      ORDER BY
        total_views ASC,
        total_clicks ASC,
        id DESC
      LIMIT 1
      `
    );

    const adminSlides = adminRows.map(sanitizeAdminSlide).filter(Boolean);
    const adSlide = sanitizeAdSlide(adRows[0]);

    const slides = insertAdSlide(adminSlides, adSlide, settings.ad_insert_position);

    return res.status(200).json({
      ok: true,
      settings,
      slides,
      admin_slides: adminSlides,
      ad_slide: adSlide,
    });
  } catch (error) {
    console.error('getPublicBannerHomeSlides error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch homepage banner slides',
      error: error.message,
    });
  }
}

async function trackBannerHomeAdView(req, res) {
  const connection = await pool.getConnection();

  try {
    const campaignId = Number(req.params.id || req.body.campaign_id);
    const placementKey = cleanText(req.body.placement_key) || 'homepage_slider';
    const slidePosition = Number(req.body.slide_position || 0) || null;
    const pageUrl = normalizeUrl(req.body.page_url);
    const referrer = normalizeUrl(req.body.referrer || req.headers.referer);
    const visitorIp = getVisitorIp(req);
    const userAgent = cleanText(req.headers['user-agent']);

    if (!campaignId) {
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM banner_home_ads_campaigns
      WHERE id = ?
      FOR UPDATE
      `,
      [campaignId]
    );

    if (!rows.length) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        ok: false,
        message: 'Banner home ad campaign not found.',
      });
    }

    const campaign = rows[0];

    if (
      campaign.status !== 'active' ||
      campaign.approval_status !== 'approved' ||
      campaign.payment_status !== 'paid' ||
      Number(campaign.remaining_budget || 0) <= 0
    ) {
      await connection.rollback();
      connection.release();

      return res.status(200).json({
        ok: true,
        charged: false,
        message: 'Banner home ad is not active.',
      });
    }

    let todaySpent = Number(campaign.today_spent || 0);
    const todaySpentDate = campaign.today_spent_date
      ? String(campaign.today_spent_date).slice(0, 10)
      : null;

    const [todayRows] = await connection.query(`SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today`);
    const today = todayRows[0]?.today;

    if (todaySpentDate !== today) {
      todaySpent = 0;
    }

    const viewCost = Number(campaign.cost_per_view || 0);
    const remainingBudget = Number(campaign.remaining_budget || 0);
    const dailyCap = Number(campaign.daily_budget_cap || 0);

    const canChargeDaily = dailyCap <= 0 || todaySpent + viewCost <= dailyCap;
    const charged = viewCost > 0 && remainingBudget >= viewCost && canChargeDaily;

    const actualCost = charged ? viewCost : 0;
    const nextRemaining = Math.max(remainingBudget - actualCost, 0);
    const nextTodaySpent = todaySpent + actualCost;
    const exhausted = charged && nextRemaining <= 0;
    const dailyPaused = dailyCap > 0 && nextTodaySpent >= dailyCap;

    await connection.query(
      `
      INSERT INTO banner_home_ads_views
        (
          campaign_id,
          owner_type,
          affiliate_id,
          website_id,
          placement_key,
          slide_position,
          page_url,
          referrer,
          visitor_ip,
          user_agent,
          view_cost,
          charged
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        campaign.id,
        campaign.owner_type,
        campaign.affiliate_id,
        campaign.website_id,
        placementKey,
        slidePosition,
        pageUrl || null,
        referrer || null,
        visitorIp || null,
        userAgent || null,
        actualCost,
        charged ? 1 : 0,
      ]
    );

    await connection.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        total_views = total_views + 1,
        total_spent = total_spent + ?,
        remaining_budget = ?,
        today_spent = ?,
        today_spent_date = CURDATE(),
        status = CASE
          WHEN ? = 1 THEN 'exhausted'
          WHEN ? = 1 THEN 'daily_paused'
          ELSE status
        END,
        exhausted_at = CASE WHEN ? = 1 THEN NOW() ELSE exhausted_at END
      WHERE id = ?
      `,
      [
        actualCost,
        nextRemaining,
        nextTodaySpent,
        exhausted ? 1 : 0,
        dailyPaused ? 1 : 0,
        exhausted ? 1 : 0,
        campaign.id,
      ]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      charged,
      cost: actualCost,
      exhausted,
      daily_paused: dailyPaused,
      message: 'Banner home ad view tracked.',
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    return res.status(500).json({
      ok: false,
      message: 'Failed to track banner home ad view',
      error: error.message,
    });
  }
}

async function trackBannerHomeAdClick(req, res) {
  const connection = await pool.getConnection();

  try {
    const campaignId = Number(req.params.id || req.body.campaign_id);
    const placementKey = cleanText(req.body.placement_key) || 'homepage_slider';
    const slidePosition = Number(req.body.slide_position || 0) || null;
    const pageUrl = normalizeUrl(req.body.page_url);
    const destinationUrl = normalizeUrl(req.body.destination_url);
    const referrer = normalizeUrl(req.body.referrer || req.headers.referer);
    const visitorIp = getVisitorIp(req);
    const userAgent = cleanText(req.headers['user-agent']);

    if (!campaignId) {
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM banner_home_ads_campaigns
      WHERE id = ?
      FOR UPDATE
      `,
      [campaignId]
    );

    if (!rows.length) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        ok: false,
        message: 'Banner home ad campaign not found.',
      });
    }

    const campaign = rows[0];

    if (
      campaign.status !== 'active' ||
      campaign.approval_status !== 'approved' ||
      campaign.payment_status !== 'paid' ||
      Number(campaign.remaining_budget || 0) <= 0
    ) {
      await connection.rollback();
      connection.release();

      return res.status(200).json({
        ok: true,
        charged: false,
        message: 'Banner home ad is not active.',
      });
    }

    let todaySpent = Number(campaign.today_spent || 0);
    const todaySpentDate = campaign.today_spent_date
      ? String(campaign.today_spent_date).slice(0, 10)
      : null;

    const [todayRows] = await connection.query(`SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today`);
    const today = todayRows[0]?.today;

    if (todaySpentDate !== today) {
      todaySpent = 0;
    }

    const clickCost = Number(campaign.cost_per_click || 0);
    const remainingBudget = Number(campaign.remaining_budget || 0);
    const dailyCap = Number(campaign.daily_budget_cap || 0);

    const canChargeDaily = dailyCap <= 0 || todaySpent + clickCost <= dailyCap;
    const charged = clickCost > 0 && remainingBudget >= clickCost && canChargeDaily;

    const actualCost = charged ? clickCost : 0;
    const nextRemaining = Math.max(remainingBudget - actualCost, 0);
    const nextTodaySpent = todaySpent + actualCost;
    const exhausted = charged && nextRemaining <= 0;
    const dailyPaused = dailyCap > 0 && nextTodaySpent >= dailyCap;

    await connection.query(
      `
      INSERT INTO banner_home_ads_clicks
        (
          campaign_id,
          owner_type,
          affiliate_id,
          website_id,
          placement_key,
          slide_position,
          page_url,
          destination_url,
          referrer,
          visitor_ip,
          user_agent,
          click_cost,
          charged
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        campaign.id,
        campaign.owner_type,
        campaign.affiliate_id,
        campaign.website_id,
        placementKey,
        slidePosition,
        pageUrl || null,
        destinationUrl || null,
        referrer || null,
        visitorIp || null,
        userAgent || null,
        actualCost,
        charged ? 1 : 0,
      ]
    );

    await connection.query(
      `
      UPDATE banner_home_ads_campaigns
      SET
        total_clicks = total_clicks + 1,
        total_spent = total_spent + ?,
        remaining_budget = ?,
        today_spent = ?,
        today_spent_date = CURDATE(),
        status = CASE
          WHEN ? = 1 THEN 'exhausted'
          WHEN ? = 1 THEN 'daily_paused'
          ELSE status
        END,
        exhausted_at = CASE WHEN ? = 1 THEN NOW() ELSE exhausted_at END
      WHERE id = ?
      `,
      [
        actualCost,
        nextRemaining,
        nextTodaySpent,
        exhausted ? 1 : 0,
        dailyPaused ? 1 : 0,
        exhausted ? 1 : 0,
        campaign.id,
      ]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      charged,
      cost: actualCost,
      exhausted,
      daily_paused: dailyPaused,
      message: 'Banner home ad click tracked.',
    });
  } catch (error) {
    await connection.rollback();
    connection.release();

    return res.status(500).json({
      ok: false,
      message: 'Failed to track banner home ad click',
      error: error.message,
    });
  }
}

module.exports = {
  getPublicBannerHomeSlides,
  trackBannerHomeAdView,
  trackBannerHomeAdClick,
};