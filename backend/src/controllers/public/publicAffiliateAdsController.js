const pool = require('../../config/db');

function getVisitorIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')?.[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    ''
  );
}

function cleanText(value) {
  return String(value || '').trim();
}

function normalizePlacement(value) {
  return cleanText(value) || 'general';
}

function normalizeUrl(value) {
  const url = cleanText(value);
  return url.length > 700 ? url.slice(0, 700) : url;
}

async function getPublicAffiliateAds(req, res, next) {
  try {
    const adType = cleanText(req.query.ad_type);
    const placementKey = normalizePlacement(req.query.placement_key);
    const limit = Math.min(Number(req.query.limit) || 12, 30);

    const params = [];
    let typeFilter = '';

    if (['product', 'post', 'website'].includes(adType)) {
      typeFilter = 'AND c.ad_type = ?';
      params.push(adType);
    }

    params.push(limit);

    const [rows] = await pool.query(
      `
        SELECT
          c.id,
          c.affiliate_id,
          c.website_id,
          c.ad_type,
          c.target_id,
          c.campaign_title,
          c.campaign_description,
          c.campaign_image,
          c.cost_per_view,
          c.cost_per_click,
          c.remaining_budget,
          c.total_views,
          c.total_clicks,
          c.total_spent,
          c.status,
          c.approval_status
        FROM affiliate_ads_campaigns c
        WHERE c.status = 'active'
          AND c.approval_status = 'approved'
          AND c.remaining_budget > 0
          ${typeFilter}
        ORDER BY c.created_at DESC
        LIMIT ?
      `,
      params
    );

    return res.status(200).json({
      ok: true,
      placement_key: placementKey,
      ads: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function trackAffiliateAdView(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const campaignId = Number(req.params.id || req.body.campaign_id);
    const placementKey = normalizePlacement(req.body.placement_key);
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
        FROM affiliate_ads_campaigns
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
        message: 'Ad campaign not found.',
      });
    }

    const campaign = rows[0];

    if (
      campaign.status !== 'active' ||
      campaign.approval_status !== 'approved' ||
      Number(campaign.remaining_budget) <= 0
    ) {
      await connection.rollback();
      connection.release();
      return res.status(200).json({
        ok: true,
        charged: false,
        message: 'Ad is not active.',
      });
    }

    const viewCost = Number(campaign.cost_per_view || 0);
    const remainingBudget = Number(campaign.remaining_budget || 0);
    const charged = remainingBudget >= viewCost && viewCost > 0;
    const actualCost = charged ? viewCost : 0;
    const nextRemaining = Math.max(remainingBudget - actualCost, 0);
    const exhausted = charged && nextRemaining <= 0;

    await connection.query(
      `
        INSERT INTO affiliate_ads_views
          (
            campaign_id,
            affiliate_id,
            website_id,
            ad_type,
            target_id,
            placement_key,
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
        campaign.affiliate_id,
        campaign.website_id,
        campaign.ad_type,
        campaign.target_id,
        placementKey,
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
        UPDATE affiliate_ads_campaigns
        SET
          total_views = total_views + 1,
          total_spent = total_spent + ?,
          remaining_budget = ?,
          status = CASE WHEN ? = 1 THEN 'exhausted' ELSE status END,
          exhausted_at = CASE WHEN ? = 1 THEN NOW() ELSE exhausted_at END
        WHERE id = ?
      `,
      [actualCost, nextRemaining, exhausted ? 1 : 0, exhausted ? 1 : 0, campaign.id]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      charged,
      cost: actualCost,
      exhausted,
      message: exhausted ? 'View tracked. Ad balance exhausted.' : 'View tracked.',
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

async function trackAffiliateAdClick(req, res, next) {
  const connection = await pool.getConnection();

  try {
    const campaignId = Number(req.params.id || req.body.campaign_id);
    const placementKey = normalizePlacement(req.body.placement_key);
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
        FROM affiliate_ads_campaigns
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
        message: 'Ad campaign not found.',
      });
    }

    const campaign = rows[0];

    if (
      campaign.status !== 'active' ||
      campaign.approval_status !== 'approved' ||
      Number(campaign.remaining_budget) <= 0
    ) {
      await connection.rollback();
      connection.release();
      return res.status(200).json({
        ok: true,
        charged: false,
        message: 'Ad is not active.',
      });
    }

    const clickCost = Number(campaign.cost_per_click || 0);
    const remainingBudget = Number(campaign.remaining_budget || 0);
    const charged = remainingBudget >= clickCost && clickCost > 0;
    const actualCost = charged ? clickCost : 0;
    const nextRemaining = Math.max(remainingBudget - actualCost, 0);
    const exhausted = charged && nextRemaining <= 0;

    await connection.query(
      `
        INSERT INTO affiliate_ads_clicks
          (
            campaign_id,
            affiliate_id,
            website_id,
            ad_type,
            target_id,
            placement_key,
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
        campaign.affiliate_id,
        campaign.website_id,
        campaign.ad_type,
        campaign.target_id,
        placementKey,
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
        UPDATE affiliate_ads_campaigns
        SET
          total_clicks = total_clicks + 1,
          total_spent = total_spent + ?,
          remaining_budget = ?,
          status = CASE WHEN ? = 1 THEN 'exhausted' ELSE status END,
          exhausted_at = CASE WHEN ? = 1 THEN NOW() ELSE exhausted_at END
        WHERE id = ?
      `,
      [actualCost, nextRemaining, exhausted ? 1 : 0, exhausted ? 1 : 0, campaign.id]
    );

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      charged,
      cost: actualCost,
      exhausted,
      message: exhausted ? 'Click tracked. Ad balance exhausted.' : 'Click tracked.',
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

module.exports = {
  getPublicAffiliateAds,
  trackAffiliateAdView,
  trackAffiliateAdClick,
};