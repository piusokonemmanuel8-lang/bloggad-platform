const pool = require('../../config/db');
const {
  ensureAffiliateAdsSettings,
} = require('../admin/adminAffiliateAdsSettingsController');

function getAffiliateId(req) {
  return req.user?.id || req.user?.user_id || null;
}

function cleanText(value) {
  return String(value || '').trim();
}

function normalizeAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Number(amount.toFixed(4));
}

async function getAffiliateAdsSettingsRow() {
  await ensureAffiliateAdsSettings();

  const [rows] = await pool.query(`
    SELECT *
    FROM affiliate_ads_settings
    WHERE id = 1
    LIMIT 1
  `);

  return rows[0] || {
    minimum_budget: 10,
    product_cost_per_view: 0.0015,
    product_cost_per_click: 0.07,
    post_cost_per_view: 0.001,
    post_cost_per_click: 0.04,
    website_cost_per_view: 0.001,
    website_cost_per_click: 0.05,
    currency: 'USD',
  };
}

function getRatesFromSettings(settings, adType) {
  if (adType === 'product') {
    return {
      cost_per_view: normalizeAmount(settings.product_cost_per_view),
      cost_per_click: normalizeAmount(settings.product_cost_per_click),
    };
  }

  if (adType === 'post') {
    return {
      cost_per_view: normalizeAmount(settings.post_cost_per_view),
      cost_per_click: normalizeAmount(settings.post_cost_per_click),
    };
  }

  return {
    cost_per_view: normalizeAmount(settings.website_cost_per_view),
    cost_per_click: normalizeAmount(settings.website_cost_per_click),
  };
}

async function getAffiliateWebsite(affiliateId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        user_id,
        website_name,
        slug,
        custom_domain,
        logo,
        banner,
        status,
        created_at
      FROM affiliate_websites
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [affiliateId]
  );

  return rows[0] || null;
}

async function getAffiliateProductsList(affiliateId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        user_id,
        website_id,
        title,
        product_image AS image,
        status,
        created_at
      FROM products
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 300
    `,
    [affiliateId]
  );

  return rows;
}

async function getAffiliatePostsList(affiliateId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        user_id,
        website_id,
        product_id,
        title,
        featured_image AS image,
        status,
        created_at
      FROM product_posts
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 300
    `,
    [affiliateId]
  );

  return rows;
}

async function validateAffiliateTarget(affiliateId, adType, targetId) {
  if (adType === 'website') {
    const website = await getAffiliateWebsite(affiliateId);

    if (!website) {
      return {
        ok: false,
        message: 'No affiliate website found for your account.',
      };
    }

    if (Number(website.id) !== Number(targetId)) {
      return {
        ok: false,
        message: 'You can only promote your own website.',
      };
    }

    return {
      ok: true,
      website_id: website.id,
      target: website,
    };
  }

  if (adType === 'product') {
    const products = await getAffiliateProductsList(affiliateId);
    const product = products.find((item) => Number(item.id) === Number(targetId));

    if (!product) {
      return {
        ok: false,
        message: 'Selected product was not found under your affiliate account.',
      };
    }

    return {
      ok: true,
      target: product,
    };
  }

  if (adType === 'post') {
    const posts = await getAffiliatePostsList(affiliateId);
    const post = posts.find((item) => Number(item.id) === Number(targetId));

    if (!post) {
      return {
        ok: false,
        message: 'Selected post was not found under your affiliate account.',
      };
    }

    return {
      ok: true,
      target: post,
    };
  }

  return {
    ok: false,
    message: 'Invalid ad type.',
  };
}

async function getAffiliateAdsOptions(req, res, next) {
  try {
    const affiliateId = getAffiliateId(req);

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    const settings = await getAffiliateAdsSettingsRow();
    const [website, products, posts] = await Promise.all([
      getAffiliateWebsite(affiliateId),
      getAffiliateProductsList(affiliateId),
      getAffiliatePostsList(affiliateId),
    ]);

    return res.status(200).json({
      ok: true,
      settings,
      website,
      products,
      posts,
    });
  } catch (error) {
    next(error);
  }
}

async function getAffiliateAds(req, res, next) {
  try {
    const affiliateId = getAffiliateId(req);

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    const [rows] = await pool.query(
      `
        SELECT
          id,
          affiliate_id,
          website_id,
          ad_type,
          target_id,
          campaign_title,
          campaign_description,
          campaign_image,
          currency,
          total_budget,
          remaining_budget,
          total_spent,
          cost_per_view,
          cost_per_click,
          total_views,
          total_clicks,
          status,
          approval_status,
          payment_status,
          admin_note,
          rejection_reason,
          approved_at,
          rejected_at,
          paused_at,
          exhausted_at,
          last_funded_at,
          last_modified_at,
          created_at,
          updated_at
        FROM affiliate_ads_campaigns
        WHERE affiliate_id = ?
        ORDER BY created_at DESC
      `,
      [affiliateId]
    );

    return res.status(200).json({
      ok: true,
      campaigns: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function createAffiliateAd(req, res, next) {
  try {
    const affiliateId = getAffiliateId(req);

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    const settings = await getAffiliateAdsSettingsRow();
    const minimumBudget = normalizeAmount(settings.minimum_budget || 10);

    const adType = cleanText(req.body.ad_type);
    const targetId = Number(req.body.target_id);
    let websiteId = req.body.website_id ? Number(req.body.website_id) : null;

    const campaignTitle = cleanText(req.body.campaign_title || req.body.title);
    const campaignDescription = cleanText(
      req.body.campaign_description || req.body.description
    );
    const campaignImage = cleanText(req.body.campaign_image || req.body.image);
    const budgetAmount = normalizeAmount(req.body.total_budget || req.body.budget_amount);
    const currency = cleanText(req.body.currency || settings.currency) || 'USD';

    if (!['product', 'post', 'website'].includes(adType)) {
      return res.status(400).json({
        ok: false,
        message: 'Ad type must be product, post, or website.',
      });
    }

    if (!targetId) {
      return res.status(400).json({
        ok: false,
        message: 'Please choose the exact item you want to promote.',
      });
    }

    if (!campaignTitle) {
      return res.status(400).json({
        ok: false,
        message: 'Campaign title is required.',
      });
    }

    if (budgetAmount < minimumBudget) {
      return res.status(400).json({
        ok: false,
        message: `Minimum ad budget is $${minimumBudget}.`,
      });
    }

    const validation = await validateAffiliateTarget(affiliateId, adType, targetId);

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        message: validation.message,
      });
    }

    if (adType === 'website') {
      websiteId = validation.website_id;
    }

    const rates = getRatesFromSettings(settings, adType);

    const [result] = await pool.query(
      `
        INSERT INTO affiliate_ads_campaigns
          (
            affiliate_id,
            website_id,
            ad_type,
            target_id,
            campaign_title,
            campaign_description,
            campaign_image,
            currency,
            total_budget,
            remaining_budget,
            total_spent,
            cost_per_view,
            cost_per_click,
            total_views,
            total_clicks,
            status,
            approval_status,
            payment_status,
            last_funded_at
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0000, ?, ?, 0, 0, 'pending', 'pending', 'paid', NOW())
      `,
      [
        affiliateId,
        websiteId,
        adType,
        targetId,
        campaignTitle,
        campaignDescription || null,
        campaignImage || null,
        currency,
        budgetAmount,
        budgetAmount,
        rates.cost_per_view,
        rates.cost_per_click,
      ]
    );

    await pool.query(
      `
        INSERT INTO affiliate_ads_topups
          (campaign_id, affiliate_id, amount, currency, payment_status, payment_method)
        VALUES
          (?, ?, ?, ?, 'paid', 'manual_test')
      `,
      [result.insertId, affiliateId, budgetAmount, currency]
    );

    const [rows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      message: 'Ad submitted successfully. Payment marked as paid. Waiting for admin approval.',
      campaign: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateAffiliateAd(req, res, next) {
  try {
    const affiliateId = getAffiliateId(req);
    const campaignId = Number(req.params.id);

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    const [existingRows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
          AND affiliate_id = ?
        LIMIT 1
      `,
      [campaignId, affiliateId]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Ad campaign not found.',
      });
    }

    const campaignTitle = cleanText(req.body.campaign_title || req.body.title);
    const campaignDescription = cleanText(
      req.body.campaign_description || req.body.description
    );
    const campaignImage = cleanText(req.body.campaign_image || req.body.image);

    if (!campaignTitle) {
      return res.status(400).json({
        ok: false,
        message: 'Campaign title is required.',
      });
    }

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET
          campaign_title = ?,
          campaign_description = ?,
          campaign_image = ?,
          status = 'pending',
          approval_status = 'pending',
          admin_note = NULL,
          rejection_reason = NULL,
          approved_by = NULL,
          approved_at = NULL,
          rejected_at = NULL,
          last_modified_at = NOW()
        WHERE id = ?
          AND affiliate_id = ?
      `,
      [
        campaignTitle,
        campaignDescription || null,
        campaignImage || null,
        campaignId,
        affiliateId,
      ]
    );

    const [rows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message:
        'Ad updated successfully. It has been returned to pending admin approval.',
      campaign: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function topUpAffiliateAd(req, res, next) {
  try {
    const affiliateId = getAffiliateId(req);
    const campaignId = Number(req.params.id);
    const amount = normalizeAmount(req.body.amount);
    const settings = await getAffiliateAdsSettingsRow();
    const minimumBudget = normalizeAmount(settings.minimum_budget || 10);
    const currency = cleanText(req.body.currency || settings.currency) || 'USD';

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    if (!campaignId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid campaign ID is required.',
      });
    }

    if (amount < minimumBudget) {
      return res.status(400).json({
        ok: false,
        message: `Minimum top-up amount is $${minimumBudget}.`,
      });
    }

    const [existingRows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
          AND affiliate_id = ?
        LIMIT 1
      `,
      [campaignId, affiliateId]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Ad campaign not found.',
      });
    }

    const existing = existingRows[0];

    let nextStatus = existing.status;

    if (
      existing.approval_status === 'approved' &&
      existing.status !== 'paused' &&
      existing.status !== 'rejected'
    ) {
      nextStatus = 'active';
    }

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET
          total_budget = total_budget + ?,
          remaining_budget = remaining_budget + ?,
          payment_status = 'paid',
          status = ?,
          exhausted_at = NULL,
          last_funded_at = NOW()
        WHERE id = ?
          AND affiliate_id = ?
      `,
      [amount, amount, nextStatus, campaignId, affiliateId]
    );

    await pool.query(
      `
        INSERT INTO affiliate_ads_topups
          (campaign_id, affiliate_id, amount, currency, payment_status, payment_method)
        VALUES
          (?, ?, ?, ?, 'paid', 'manual_test')
      `,
      [campaignId, affiliateId, amount, currency]
    );

    const [rows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
        LIMIT 1
      `,
      [campaignId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Ad balance topped up successfully. Payment marked as paid.',
      campaign: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function pauseAffiliateAd(req, res, next) {
  try {
    const affiliateId = getAffiliateId(req);
    const campaignId = Number(req.params.id);

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET status = 'paused', paused_at = NOW()
        WHERE id = ?
          AND affiliate_id = ?
          AND approval_status = 'approved'
      `,
      [campaignId, affiliateId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Ad paused successfully.',
    });
  } catch (error) {
    next(error);
  }
}

async function resumeAffiliateAd(req, res, next) {
  try {
    const affiliateId = getAffiliateId(req);
    const campaignId = Number(req.params.id);

    const [rows] = await pool.query(
      `
        SELECT *
        FROM affiliate_ads_campaigns
        WHERE id = ?
          AND affiliate_id = ?
        LIMIT 1
      `,
      [campaignId, affiliateId]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Ad campaign not found.',
      });
    }

    const campaign = rows[0];

    if (campaign.approval_status !== 'approved') {
      return res.status(400).json({
        ok: false,
        message: 'This ad must be approved before it can run.',
      });
    }

    if (Number(campaign.remaining_budget) <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Please top up this ad before resuming it.',
      });
    }

    await pool.query(
      `
        UPDATE affiliate_ads_campaigns
        SET status = 'active', paused_at = NULL
        WHERE id = ?
          AND affiliate_id = ?
      `,
      [campaignId, affiliateId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Ad resumed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAffiliateAdsOptions,
  getAffiliateAds,
  createAffiliateAd,
  updateAffiliateAd,
  topUpAffiliateAd,
  pauseAffiliateAd,
  resumeAffiliateAd,
};