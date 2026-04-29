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

function toDateOnly(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getSlugFromUrl(value) {
  const raw = cleanText(value);

  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const firstPath = parsed.pathname.split('/').filter(Boolean)[0];
    return cleanText(firstPath);
  } catch (error) {
    const firstPath = raw.split('/').filter(Boolean)[0];
    return cleanText(firstPath);
  }
}

async function getDbToday(connection = pool) {
  const [rows] = await connection.query(`
    SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today
  `);

  return rows[0]?.today || toDateOnly(new Date());
}

function isCampaignEndedByDate(campaign, today) {
  const endDate = toDateOnly(campaign?.end_date);
  if (!endDate || !today) return false;
  return endDate < today;
}

async function tableExists(tableName, connection = pool) {
  const [rows] = await connection.query(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    [tableName]
  );

  return rows.length > 0;
}

async function columnExists(tableName, columnName, connection = pool) {
  const [rows] = await connection.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return rows.length > 0;
}

function getAdEnabledColumn(adType) {
  if (adType === 'product') return 'product_ads_enabled';
  if (adType === 'website') return 'website_ads_enabled';
  return 'post_template_ads_enabled';
}

function isPublisherSettingEnabled(settings, adType) {
  if (!settings) return false;
  if (settings.status !== 'active') return false;

  const enabledColumn = getAdEnabledColumn(adType);
  return Number(settings[enabledColumn] || 0) === 1;
}

async function resolvePublisherContext(connection, source = {}) {
  const publisherWebsiteId = Number(
    source.publisher_website_id ||
      source.publisherWebsiteId ||
      source.website_id_for_ads ||
      0
  );

  const publisherAffiliateId = Number(
    source.publisher_affiliate_id ||
      source.publisherAffiliateId ||
      0
  );

  const publisherWebsiteSlug = cleanText(
    source.publisher_website_slug ||
      source.publisherWebsiteSlug ||
      source.website_slug ||
      source.websiteSlug ||
      ''
  );

  const pageUrlSlug = getSlugFromUrl(source.page_url || source.referrer || '');

  if (publisherWebsiteId) {
    const [rows] = await connection.query(
      `
        SELECT
          id,
          user_id,
          website_name,
          slug,
          status
        FROM affiliate_websites
        WHERE id = ?
        LIMIT 1
      `,
      [publisherWebsiteId]
    );

    if (rows.length) {
      return {
        website_id: rows[0].id,
        affiliate_id: rows[0].user_id,
        website: rows[0],
      };
    }
  }

  const slugToUse = publisherWebsiteSlug || pageUrlSlug;

  if (slugToUse) {
    const [rows] = await connection.query(
      `
        SELECT
          id,
          user_id,
          website_name,
          slug,
          status
        FROM affiliate_websites
        WHERE slug = ?
        LIMIT 1
      `,
      [slugToUse]
    );

    if (rows.length) {
      return {
        website_id: rows[0].id,
        affiliate_id: rows[0].user_id,
        website: rows[0],
      };
    }
  }

  if (publisherAffiliateId) {
    const [rows] = await connection.query(
      `
        SELECT
          id,
          user_id,
          website_name,
          slug,
          status
        FROM affiliate_websites
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [publisherAffiliateId]
    );

    if (rows.length) {
      return {
        website_id: rows[0].id,
        affiliate_id: rows[0].user_id,
        website: rows[0],
      };
    }

    return {
      website_id: null,
      affiliate_id: publisherAffiliateId,
      website: null,
    };
  }

  return null;
}

async function getPublisherAdSettings(connection, publisher) {
  if (!publisher?.affiliate_id) return null;

  const settingsTableExists = await tableExists('affiliate_template_ad_settings', connection);
  if (!settingsTableExists) return null;

  const [rows] = await connection.query(
    `
      SELECT *
      FROM affiliate_template_ad_settings
      WHERE affiliate_id = ?
        AND (
          website_id = ?
          OR website_id IS NULL
        )
      ORDER BY
        CASE WHEN website_id = ? THEN 0 ELSE 1 END,
        id DESC
      LIMIT 1
    `,
    [publisher.affiliate_id, publisher.website_id || null, publisher.website_id || null]
  );

  return rows[0] || null;
}

async function isPublisherEligibleForAds(connection, publisher, adType) {
  const settings = await getPublisherAdSettings(connection, publisher);

  return {
    ok: isPublisherSettingEnabled(settings, adType),
    settings,
  };
}

async function createRevenueLedger({
  connection,
  campaign,
  publisher,
  publisherSettings,
  eventType,
  eventTable,
  eventId,
  grossAmount,
}) {
  if (!connection || !campaign || !eventId) return;
  if (!publisher?.affiliate_id) return;
  if (!publisherSettings) return;

  const ledgerExists = await tableExists('affiliate_ad_revenue_ledger', connection);
  if (!ledgerExists) return;

  const gross = Number(grossAmount || 0);
  if (!gross || gross <= 0) return;

  const publisherSharePercent = Number(publisherSettings.revenue_share_percent || 60);
  const platformSharePercent = Number(publisherSettings.platform_share_percent || 40);

  const publisherAmount = Number(((gross * publisherSharePercent) / 100).toFixed(4));
  const platformAmount = Number((gross - publisherAmount).toFixed(4));

  await connection.query(
    `
      INSERT IGNORE INTO affiliate_ad_revenue_ledger
        (
          campaign_id,
          advertiser_affiliate_id,
          publisher_affiliate_id,
          publisher_website_id,
          event_type,
          event_table,
          event_id,
          gross_amount,
          publisher_amount,
          platform_amount,
          publisher_share_percent,
          platform_share_percent,
          currency,
          settlement_status
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      campaign.id,
      campaign.affiliate_id,
      publisher.affiliate_id,
      publisher.website_id || null,
      eventType,
      eventTable,
      eventId,
      gross,
      publisherAmount,
      platformAmount,
      publisherSharePercent,
      platformSharePercent,
      campaign.currency || 'USD',
    ]
  );
}

async function runAffiliateAdsMaintenance() {
  await pool.query(
    `
      UPDATE affiliate_ads_campaigns
      SET
        status = 'ended',
        ended_at = COALESCE(ended_at, NOW())
      WHERE approval_status = 'approved'
        AND status IN ('active', 'paused', 'daily_paused', 'exhausted')
        AND end_date IS NOT NULL
        AND DATE(end_date) < CURDATE()
    `
  );

  await pool.query(
    `
      UPDATE affiliate_ads_campaigns
      SET
        today_spent = 0.0000,
        today_spent_date = CURDATE(),
        status = CASE
          WHEN status = 'daily_paused'
            AND approval_status = 'approved'
            AND remaining_budget > 0
            AND (start_date IS NULL OR DATE(start_date) <= CURDATE())
            AND (end_date IS NULL OR DATE(end_date) >= CURDATE())
          THEN 'active'
          ELSE status
        END
      WHERE today_spent_date IS NULL
        OR DATE(today_spent_date) <> CURDATE()
    `
  );

  await pool.query(
    `
      UPDATE affiliate_ads_campaigns
      SET status = 'active'
      WHERE status = 'ended'
        AND approval_status = 'approved'
        AND remaining_budget > 0
        AND ended_at IS NOT NULL
        AND end_date IS NOT NULL
        AND DATE(end_date) >= CURDATE()
        AND (start_date IS NULL OR DATE(start_date) <= CURDATE())
    `
  );
}

async function getPublicAffiliateAds(req, res, next) {
  try {
    const adType = cleanText(req.query.ad_type);
    const placementKey = normalizePlacement(req.query.placement_key);
    const categoryId = Number(req.query.category_id || 0);
    const limit = Math.min(Number(req.query.limit) || 8, 24);

    const isMarketplacePlacement =
      placementKey.startsWith('homepage_') ||
      placementKey.startsWith('category_');

    const isHomepagePlacement = placementKey.startsWith('homepage_');
    const isCategoryPlacement = placementKey.startsWith('category_');

    const productHasCategory = await columnExists('products', 'category_id');
    const postHasCategory = await columnExists('product_posts', 'category_id');

    await runAffiliateAdsMaintenance();

    if (['product', 'post', 'website'].includes(adType) && !isMarketplacePlacement) {
      const publisher = await resolvePublisherContext(pool, req.query);
      const publisherEligibility = await isPublisherEligibleForAds(pool, publisher, adType);

      if (!publisherEligibility.ok) {
        return res.status(200).json({
          ok: true,
          placement_key: placementKey,
          category_id: categoryId || null,
          publisher_ads_enabled: false,
          fallback_used: false,
          rotation: {
            mode: 'fair_rotation',
            limit,
          },
          ads: [],
        });
      }
    }

    const postCategorySelect = postHasCategory ? `pp.category_id` : `NULL`;
    const productCategorySelect = productHasCategory ? `p.category_id` : `NULL`;

    async function fetchAds({ useCategory = true }) {
      const params = [];
      const where = [
        `c.status = 'active'`,
        `c.approval_status = 'approved'`,
        `c.remaining_budget > 0`,
        `(c.start_date IS NULL OR DATE(c.start_date) <= CURDATE())`,
        `(c.end_date IS NULL OR DATE(c.end_date) >= CURDATE())`,
        `(
          c.daily_budget_cap IS NULL
          OR c.daily_budget_cap <= 0
          OR c.today_spent < c.daily_budget_cap
        )`,
      ];

      if (['product', 'post', 'website'].includes(adType)) {
        where.push(`c.ad_type = ?`);
        params.push(adType);
      }

      if (useCategory && categoryId > 0) {
        if (adType === 'post' && postHasCategory) {
          where.push(`pp.category_id = ?`);
          params.push(categoryId);
        } else if (adType === 'product' && productHasCategory) {
          where.push(`p.category_id = ?`);
          params.push(categoryId);
        } else if (!adType) {
          const categoryParts = [];

          if (postHasCategory) {
            categoryParts.push(`(c.ad_type = 'post' AND pp.category_id = ?)`);
            params.push(categoryId);
          }

          if (productHasCategory) {
            categoryParts.push(`(c.ad_type = 'product' AND p.category_id = ?)`);
            params.push(categoryId);
          }

          if (categoryParts.length) {
            where.push(`(${categoryParts.join(' OR ')})`);
          }
        }
      }

      const queryParams = [placementKey, ...params, limit];

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
            c.campaign_image AS campaign_image_url,
            c.currency,
            c.cost_per_view,
            c.bid_cost_per_view,
            c.cost_per_click,
            c.bid_cost_per_click,
            c.remaining_budget,
            c.daily_budget_cap,
            c.today_spent,
            c.today_spent_date,
            c.total_views,
            c.total_clicks,
            c.total_spent,
            c.start_date,
            c.end_date,
            c.status,
            c.approval_status,

            CASE
              WHEN c.ad_type = 'product' THEN p.title
              WHEN c.ad_type = 'post' THEN pp.title
              WHEN c.ad_type = 'website' THEN aw.website_name
              ELSE c.campaign_title
            END AS target_title,

            CASE
              WHEN c.campaign_image IS NOT NULL AND c.campaign_image <> '' THEN c.campaign_image
              WHEN c.ad_type = 'product' THEN p.product_image
              WHEN c.ad_type = 'post' THEN pp.featured_image
              WHEN c.ad_type = 'website' THEN aw.logo
              ELSE NULL
            END AS target_image,

            CASE
              WHEN c.campaign_image IS NOT NULL AND c.campaign_image <> '' THEN c.campaign_image
              WHEN c.ad_type = 'product' THEN p.product_image
              WHEN c.ad_type = 'post' THEN pp.featured_image
              WHEN c.ad_type = 'website' THEN aw.logo
              ELSE NULL
            END AS display_image,

            CASE
              WHEN c.ad_type = 'product' THEN ${productCategorySelect}
              WHEN c.ad_type = 'post' THEN ${postCategorySelect}
              ELSE NULL
            END AS category_id,

            aw.website_name,
            aw.slug AS website_slug,
            p.slug AS product_slug,
            pp.slug AS post_slug,

            COALESCE(rot.recent_impressions, 0) AS recent_impressions,
            rot.last_shown_at,

            COALESCE(c.bid_cost_per_click, c.cost_per_click, 0) AS effective_click_bid,
            COALESCE(c.bid_cost_per_view, c.cost_per_view, 0) AS effective_view_bid

          FROM affiliate_ads_campaigns c

          LEFT JOIN products p
            ON c.ad_type = 'product'
            AND p.id = c.target_id

          LEFT JOIN product_posts pp
            ON c.ad_type = 'post'
            AND pp.id = c.target_id

          LEFT JOIN affiliate_websites aw
            ON (
              c.ad_type = 'website'
              AND aw.id = c.target_id
            )
            OR (
              c.website_id IS NOT NULL
              AND aw.id = c.website_id
            )

          LEFT JOIN (
            SELECT
              campaign_id,
              COUNT(*) AS recent_impressions,
              MAX(created_at) AS last_shown_at
            FROM affiliate_ads_views
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
              AND placement_key = ?
            GROUP BY campaign_id
          ) rot
            ON rot.campaign_id = c.id

          WHERE ${where.join(' AND ')}

          ORDER BY
            CASE WHEN rot.last_shown_at IS NULL THEN 0 ELSE 1 END ASC,
            COALESCE(rot.recent_impressions, 0) ASC,
            rot.last_shown_at ASC,
            COALESCE(c.bid_cost_per_click, c.cost_per_click, 0) DESC,
            COALESCE(c.bid_cost_per_view, c.cost_per_view, 0) DESC,
            RAND()

          LIMIT ?
        `,
        queryParams
      );

      return rows;
    }

    let ads = await fetchAds({ useCategory: true });
    let fallbackUsed = false;

    if (!ads.length && categoryId > 0) {
      ads = await fetchAds({ useCategory: false });
      fallbackUsed = true;
    }

    return res.status(200).json({
      ok: true,
      placement_key: placementKey,
      category_id: categoryId || null,
      publisher_ads_enabled: isMarketplacePlacement ? null : true,
      marketplace_placement: isMarketplacePlacement,
      homepage_placement: isHomepagePlacement,
      category_placement: isCategoryPlacement,
      fallback_used: fallbackUsed,
      rotation: {
        mode: 'fair_rotation',
        rule: fallbackUsed
          ? 'No same-category ad found, showing approved active ads by fair rotation.'
          : 'Same-category ads first, lowest recent impressions first, older last shown first, then stronger bids.',
        window_hours: 24,
        limit,
      },
      ads,
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
    const today = await getDbToday(connection);
    const publisher = await resolvePublisherContext(connection, {
      ...req.body,
      page_url: pageUrl,
      referrer,
    });

    let publisherEligibility = {
      ok: false,
      settings: null,
    };

    if (publisher?.affiliate_id) {
      publisherEligibility = await isPublisherEligibleForAds(
        connection,
        publisher,
        campaign.ad_type
      );
    }

    if (isCampaignEndedByDate(campaign, today)) {
      await connection.query(
        `
          UPDATE affiliate_ads_campaigns
          SET status = 'ended', ended_at = COALESCE(ended_at, NOW())
          WHERE id = ?
        `,
        [campaign.id]
      );

      await connection.commit();
      connection.release();

      return res.status(200).json({
        ok: true,
        charged: false,
        ended: true,
        message: 'Campaign has ended.',
      });
    }

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

    let todaySpent = Number(campaign.today_spent || 0);
    const todaySpentDate = toDateOnly(campaign.today_spent_date);

    if (todaySpentDate !== today) {
      todaySpent = 0;
    }

    const viewCost = Number(campaign.bid_cost_per_view || campaign.cost_per_view || 0);
    const remainingBudget = Number(campaign.remaining_budget || 0);
    const dailyCap = Number(campaign.daily_budget_cap || 0);

    const dailyCapReached = dailyCap > 0 && todaySpent >= dailyCap;
    const canChargeDaily = dailyCap <= 0 || todaySpent + viewCost <= dailyCap;

    const charged =
      !dailyCapReached &&
      canChargeDaily &&
      remainingBudget >= viewCost &&
      viewCost > 0;

    const actualCost = charged ? viewCost : 0;
    const nextRemaining = Math.max(remainingBudget - actualCost, 0);
    const nextTodaySpent = todaySpent + actualCost;
    const exhausted = charged && nextRemaining <= 0;
    const dailyPaused = dailyCap > 0 && nextTodaySpent >= dailyCap;

    const [insertResult] = await connection.query(
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

    if (charged && publisherEligibility.ok && publisher?.affiliate_id) {
      await createRevenueLedger({
        connection,
        campaign,
        publisher,
        publisherSettings: publisherEligibility.settings,
        eventType: 'view',
        eventTable: 'affiliate_ads_views',
        eventId: insertResult.insertId,
        grossAmount: actualCost,
      });
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      charged,
      cost: actualCost,
      exhausted,
      daily_paused: dailyPaused,
      publisher_revenue_created: charged && publisherEligibility.ok && !!publisher?.affiliate_id,
      message: exhausted
        ? 'View tracked. Ad balance exhausted.'
        : dailyPaused
        ? 'View tracked. Daily cap reached.'
        : 'View tracked.',
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
    const today = await getDbToday(connection);
    const publisher = await resolvePublisherContext(connection, {
      ...req.body,
      page_url: pageUrl,
      referrer,
    });

    let publisherEligibility = {
      ok: false,
      settings: null,
    };

    if (publisher?.affiliate_id) {
      publisherEligibility = await isPublisherEligibleForAds(
        connection,
        publisher,
        campaign.ad_type
      );
    }

    if (isCampaignEndedByDate(campaign, today)) {
      await connection.query(
        `
          UPDATE affiliate_ads_campaigns
          SET status = 'ended', ended_at = COALESCE(ended_at, NOW())
          WHERE id = ?
        `,
        [campaign.id]
      );

      await connection.commit();
      connection.release();

      return res.status(200).json({
        ok: true,
        charged: false,
        ended: true,
        message: 'Campaign has ended.',
      });
    }

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

    let todaySpent = Number(campaign.today_spent || 0);
    const todaySpentDate = toDateOnly(campaign.today_spent_date);

    if (todaySpentDate !== today) {
      todaySpent = 0;
    }

    const clickCost = Number(campaign.bid_cost_per_click || campaign.cost_per_click || 0);
    const remainingBudget = Number(campaign.remaining_budget || 0);
    const dailyCap = Number(campaign.daily_budget_cap || 0);

    const dailyCapReached = dailyCap > 0 && todaySpent >= dailyCap;
    const canChargeDaily = dailyCap <= 0 || todaySpent + clickCost <= dailyCap;

    const charged =
      !dailyCapReached &&
      canChargeDaily &&
      remainingBudget >= clickCost &&
      clickCost > 0;

    const actualCost = charged ? clickCost : 0;
    const nextRemaining = Math.max(remainingBudget - actualCost, 0);
    const nextTodaySpent = todaySpent + actualCost;
    const exhausted = charged && nextRemaining <= 0;
    const dailyPaused = dailyCap > 0 && nextTodaySpent >= dailyCap;

    const [insertResult] = await connection.query(
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

    if (charged && publisherEligibility.ok && publisher?.affiliate_id) {
      await createRevenueLedger({
        connection,
        campaign,
        publisher,
        publisherSettings: publisherEligibility.settings,
        eventType: 'click',
        eventTable: 'affiliate_ads_clicks',
        eventId: insertResult.insertId,
        grossAmount: actualCost,
      });
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      charged,
      cost: actualCost,
      exhausted,
      daily_paused: dailyPaused,
      publisher_revenue_created: charged && publisherEligibility.ok && !!publisher?.affiliate_id,
      message: exhausted
        ? 'Click tracked. Ad balance exhausted.'
        : dailyPaused
        ? 'Click tracked. Daily cap reached.'
        : 'Click tracked.',
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