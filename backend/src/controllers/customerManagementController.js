const pool = require('../config/db');

function toPositiveInt(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function isAdmin(user) {
  return user?.role === 'admin';
}

function isAffiliate(user) {
  return user?.role === 'affiliate';
}

async function getCustomersList({ viewer, affiliateId = null, websiteId = null, search = '' }) {
  let sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      u.email_verified_at,
      u.last_login_at,
      u.registered_under_affiliate_id,
      u.registered_under_website_id,
      u.signup_source,
      u.created_at,
      u.updated_at,

      a.name AS registered_affiliate_name,
      a.email AS registered_affiliate_email,

      aw.website_name AS registered_website_name,
      aw.slug AS registered_website_slug,
      aw.custom_domain AS registered_website_domain
    FROM users u
    LEFT JOIN users a
      ON a.id = u.registered_under_affiliate_id
    LEFT JOIN affiliate_websites aw
      ON aw.id = u.registered_under_website_id
    WHERE u.role = 'customer'
  `;
  const params = [];

  if (isAffiliate(viewer)) {
    sql += ` AND u.registered_under_affiliate_id = ? `;
    params.push(viewer.id);
  } else if (isAdmin(viewer)) {
    if (affiliateId) {
      sql += ` AND u.registered_under_affiliate_id = ? `;
      params.push(affiliateId);
    }

    if (websiteId) {
      sql += ` AND u.registered_under_website_id = ? `;
      params.push(websiteId);
    }
  } else {
    return [];
  }

  if (search) {
    sql += ` AND (u.name LIKE ? OR u.email LIKE ?) `;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY u.id DESC `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getCustomerStats({ viewer }) {
  let totalSql = `
    SELECT COUNT(*) AS total_customers
    FROM users
    WHERE role = 'customer'
  `;
  const totalParams = [];

  if (isAffiliate(viewer)) {
    totalSql += ` AND registered_under_affiliate_id = ? `;
    totalParams.push(viewer.id);
  }

  const [[totalRow]] = await pool.query(totalSql, totalParams);

  let activeSql = `
    SELECT COUNT(*) AS active_customers
    FROM users
    WHERE role = 'customer'
      AND status = 'active'
  `;
  const activeParams = [];

  if (isAffiliate(viewer)) {
    activeSql += ` AND registered_under_affiliate_id = ? `;
    activeParams.push(viewer.id);
  }

  const [[activeRow]] = await pool.query(activeSql, activeParams);

  let mainMarketplaceSql = `
    SELECT COUNT(*) AS main_marketplace_signups
    FROM users
    WHERE role = 'customer'
      AND signup_source = 'main_marketplace'
  `;
  const mainParams = [];

  if (isAffiliate(viewer)) {
    mainMarketplaceSql += ` AND registered_under_affiliate_id = ? `;
    mainParams.push(viewer.id);
  }

  const [[mainRow]] = await pool.query(mainMarketplaceSql, mainParams);

  return {
    total_customers: Number(totalRow?.total_customers || 0),
    active_customers: Number(activeRow?.active_customers || 0),
    main_marketplace_signups: Number(mainRow?.main_marketplace_signups || 0),
  };
}

async function getAdminCustomers(req, res) {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Only admin can view all customers.',
      });
    }

    const affiliateId = toPositiveInt(req.query?.affiliate_id);
    const websiteId = toPositiveInt(req.query?.website_id);
    const search = String(req.query?.search || '').trim();

    const [customers, stats] = await Promise.all([
      getCustomersList({
        viewer: req.user,
        affiliateId,
        websiteId,
        search,
      }),
      getCustomerStats({ viewer: req.user }),
    ]);

    return res.status(200).json({
      ok: true,
      stats,
      customers: customers.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        email_verified_at: row.email_verified_at,
        last_login_at: row.last_login_at,
        registered_under_affiliate_id: row.registered_under_affiliate_id,
        registered_under_website_id: row.registered_under_website_id,
        signup_source: row.signup_source,
        created_at: row.created_at,
        updated_at: row.updated_at,
        registered_affiliate: row.registered_under_affiliate_id
          ? {
              id: row.registered_under_affiliate_id,
              name: row.registered_affiliate_name,
              email: row.registered_affiliate_email,
            }
          : null,
        registered_website: row.registered_under_website_id
          ? {
              id: row.registered_under_website_id,
              website_name: row.registered_website_name,
              slug: row.registered_website_slug,
              custom_domain: row.registered_website_domain,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('getAdminCustomers error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch customers.',
      error: error.message,
    });
  }
}

async function getAffiliateCustomers(req, res) {
  try {
    if (!isAffiliate(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Only affiliates can view their customers.',
      });
    }

    const websiteId = toPositiveInt(req.query?.website_id);
    const search = String(req.query?.search || '').trim();

    const [customers, stats] = await Promise.all([
      getCustomersList({
        viewer: req.user,
        websiteId,
        search,
      }),
      getCustomerStats({ viewer: req.user }),
    ]);

    return res.status(200).json({
      ok: true,
      stats,
      customers: customers.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        email_verified_at: row.email_verified_at,
        last_login_at: row.last_login_at,
        registered_under_affiliate_id: row.registered_under_affiliate_id,
        registered_under_website_id: row.registered_under_website_id,
        signup_source: row.signup_source,
        created_at: row.created_at,
        updated_at: row.updated_at,
        registered_website: row.registered_under_website_id
          ? {
              id: row.registered_under_website_id,
              website_name: row.registered_website_name,
              slug: row.registered_website_slug,
              custom_domain: row.registered_website_domain,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('getAffiliateCustomers error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch affiliate customers.',
      error: error.message,
    });
  }
}

async function adminUpdateCustomerStatus(req, res) {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Only admin can update customer status.',
      });
    }

    const customerId = toPositiveInt(req.params?.customerId);
    const status = String(req.body?.status || '').trim();

    if (!customerId) {
      return res.status(400).json({
        ok: false,
        message: 'customerId is required.',
      });
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid status.',
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = ?
        AND role = 'customer'
      LIMIT 1
      `,
      [customerId]
    );

    if (!existingRows[0]) {
      return res.status(404).json({
        ok: false,
        message: 'Customer not found.',
      });
    }

    await pool.query(
      `
      UPDATE users
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND role = 'customer'
      `,
      [status, customerId]
    );

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        status,
        last_login_at,
        registered_under_affiliate_id,
        registered_under_website_id,
        signup_source,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
        AND role = 'customer'
      LIMIT 1
      `,
      [customerId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Customer status updated successfully.',
      customer: rows[0] || null,
    });
  } catch (error) {
    console.error('adminUpdateCustomerStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update customer status.',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminCustomers,
  getAffiliateCustomers,
  adminUpdateCustomerStatus,
};