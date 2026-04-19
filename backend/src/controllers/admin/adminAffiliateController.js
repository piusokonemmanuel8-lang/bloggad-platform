const pool = require('../../config/db');

function sanitizeAffiliateUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    email_verified_at: row.email_verified_at,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    website: row.website_id
      ? {
          id: row.website_id,
          website_name: row.website_name,
          slug: row.website_slug,
          custom_domain: row.custom_domain,
          website_status: row.website_status,
        }
      : null,
    subscription: row.subscription_id
      ? {
          id: row.subscription_id,
          plan_id: row.plan_id,
          plan_name: row.plan_name,
          plan_price: row.plan_price !== null ? Number(row.plan_price) : null,
          subscription_status: row.subscription_status,
          trial_start: row.trial_start,
          trial_end: row.trial_end,
          start_date: row.start_date,
          end_date: row.end_date,
          amount_paid: row.amount_paid !== null ? Number(row.amount_paid) : null,
        }
      : null,
  };
}

async function getAffiliateById(affiliateId) {
  const [rows] = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      u.email_verified_at,
      u.last_login_at,
      u.created_at,
      u.updated_at,

      aw.id AS website_id,
      aw.website_name,
      aw.slug AS website_slug,
      aw.custom_domain,
      aw.status AS website_status,

      s.id AS subscription_id,
      s.plan_id,
      sp.name AS plan_name,
      sp.price AS plan_price,
      s.status AS subscription_status,
      s.trial_start,
      s.trial_end,
      s.start_date,
      s.end_date,
      s.amount_paid

    FROM users u
    LEFT JOIN affiliate_websites aw
      ON aw.user_id = u.id
    LEFT JOIN affiliate_subscriptions s
      ON s.user_id = u.id
    LEFT JOIN subscription_plans sp
      ON sp.id = s.plan_id
    WHERE u.id = ?
      AND u.role = 'affiliate'
    ORDER BY s.id DESC
    LIMIT 1
    `,
    [affiliateId]
  );

  return rows[0] || null;
}

async function getAllAffiliates(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.email_verified_at,
        u.last_login_at,
        u.created_at,
        u.updated_at,

        aw.id AS website_id,
        aw.website_name,
        aw.slug AS website_slug,
        aw.custom_domain,
        aw.status AS website_status,

        s.id AS subscription_id,
        s.plan_id,
        sp.name AS plan_name,
        sp.price AS plan_price,
        s.status AS subscription_status,
        s.trial_start,
        s.trial_end,
        s.start_date,
        s.end_date,
        s.amount_paid

      FROM users u
      LEFT JOIN affiliate_websites aw
        ON aw.user_id = u.id
      LEFT JOIN (
        SELECT t1.*
        FROM affiliate_subscriptions t1
        INNER JOIN (
          SELECT user_id, MAX(id) AS max_id
          FROM affiliate_subscriptions
          GROUP BY user_id
        ) t2
          ON t1.user_id = t2.user_id
         AND t1.id = t2.max_id
      ) s
        ON s.user_id = u.id
      LEFT JOIN subscription_plans sp
        ON sp.id = s.plan_id
      WHERE u.role = 'affiliate'
      ORDER BY u.id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      affiliates: rows.map(sanitizeAffiliateUser),
    });
  } catch (error) {
    console.error('getAllAffiliates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch affiliates',
      error: error.message,
    });
  }
}

async function getSingleAffiliate(req, res) {
  try {
    const affiliateId = Number(req.params.id);

    if (!Number.isInteger(affiliateId) || affiliateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid affiliate id',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate not found',
      });
    }

    const [productRows] = await pool.query(
      `
      SELECT COUNT(*) AS total_products
      FROM products
      WHERE user_id = ?
      `,
      [affiliateId]
    );

    const [postRows] = await pool.query(
      `
      SELECT COUNT(*) AS total_posts
      FROM product_posts
      WHERE user_id = ?
      `,
      [affiliateId]
    );

    return res.status(200).json({
      ok: true,
      affiliate: {
        ...sanitizeAffiliateUser(affiliate),
        stats: {
          total_products: Number(productRows[0]?.total_products || 0),
          total_posts: Number(postRows[0]?.total_posts || 0),
        },
      },
    });
  } catch (error) {
    console.error('getSingleAffiliate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch affiliate',
      error: error.message,
    });
  }
}

async function updateAffiliateStatus(req, res) {
  try {
    const affiliateId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(affiliateId) || affiliateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid affiliate id',
      });
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid affiliate status',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate not found',
      });
    }

    await pool.query(
      `
      UPDATE users
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND role = 'affiliate'
      `,
      [status, affiliateId]
    );

    const updatedAffiliate = await getAffiliateById(affiliateId);

    return res.status(200).json({
      ok: true,
      message: 'Affiliate status updated successfully',
      affiliate: sanitizeAffiliateUser(updatedAffiliate),
    });
  } catch (error) {
    console.error('updateAffiliateStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update affiliate status',
      error: error.message,
    });
  }
}

async function updateAffiliateWebsiteStatus(req, res) {
  try {
    const affiliateId = Number(req.params.id);
    const { website_status } = req.body;

    if (!Number.isInteger(affiliateId) || affiliateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid affiliate id',
      });
    }

    if (!['draft', 'active', 'inactive', 'suspended'].includes(website_status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid website status',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate not found',
      });
    }

    if (!affiliate.website?.id) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    await pool.query(
      `
      UPDATE affiliate_websites
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [website_status, affiliate.website.id]
    );

    const updatedAffiliate = await getAffiliateById(affiliateId);

    return res.status(200).json({
      ok: true,
      message: 'Affiliate website status updated successfully',
      affiliate: sanitizeAffiliateUser(updatedAffiliate),
    });
  } catch (error) {
    console.error('updateAffiliateWebsiteStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update affiliate website status',
      error: error.message,
    });
  }
}

async function assignSubscriptionToAffiliate(req, res) {
  try {
    const affiliateId = Number(req.params.id);
    const {
      plan_id,
      status,
      amount_paid,
      trial_start,
      trial_end,
      start_date,
      end_date,
    } = req.body;

    const planId = Number(plan_id);

    if (!Number.isInteger(affiliateId) || affiliateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid affiliate id',
      });
    }

    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid plan id is required',
      });
    }

    if (!['trial', 'active', 'expired', 'cancelled'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid subscription status',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate not found',
      });
    }

    const [plans] = await pool.query(
      `
      SELECT id, name
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [planId]
    );

    if (!plans.length) {
      return res.status(404).json({
        ok: false,
        message: 'Subscription plan not found',
      });
    }

    await pool.query(
      `
      INSERT INTO affiliate_subscriptions
      (
        user_id,
        plan_id,
        trial_start,
        trial_end,
        start_date,
        end_date,
        status,
        amount_paid,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        affiliateId,
        planId,
        trial_start || null,
        trial_end || null,
        start_date || null,
        end_date || null,
        status,
        amount_paid !== undefined && amount_paid !== null && amount_paid !== ''
          ? Number(amount_paid)
          : 0,
      ]
    );

    const updatedAffiliate = await getAffiliateById(affiliateId);

    return res.status(201).json({
      ok: true,
      message: 'Subscription assigned successfully',
      affiliate: sanitizeAffiliateUser(updatedAffiliate),
    });
  } catch (error) {
    console.error('assignSubscriptionToAffiliate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to assign subscription',
      error: error.message,
    });
  }
}

async function deleteAffiliate(req, res) {
  try {
    const affiliateId = Number(req.params.id);

    if (!Number.isInteger(affiliateId) || affiliateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid affiliate id',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate not found',
      });
    }

    await pool.query(
      `
      DELETE FROM users
      WHERE id = ?
        AND role = 'affiliate'
      `,
      [affiliateId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Affiliate deleted successfully',
    });
  } catch (error) {
    console.error('deleteAffiliate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete affiliate',
      error: error.message,
    });
  }
}

module.exports = {
  getAllAffiliates,
  getSingleAffiliate,
  updateAffiliateStatus,
  updateAffiliateWebsiteStatus,
  assignSubscriptionToAffiliate,
  deleteAffiliate,
};