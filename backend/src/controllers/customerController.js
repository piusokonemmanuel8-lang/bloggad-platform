const pool = require('../config/db');

function sanitizeCustomer(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    email_verified_at: user.email_verified_at,
    last_login_at: user.last_login_at,
    registered_under_affiliate_id: user.registered_under_affiliate_id ?? null,
    registered_under_website_id: user.registered_under_website_id ?? null,
    signup_source: user.signup_source ?? 'main_marketplace',
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

async function getCustomerById(customerId) {
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
      u.registered_under_affiliate_id,
      u.registered_under_website_id,
      u.signup_source,
      u.created_at,
      u.updated_at
    FROM users u
    WHERE u.id = ?
      AND u.role = 'customer'
    LIMIT 1
    `,
    [customerId]
  );

  return rows[0] || null;
}

async function getRegisteredAffiliate(customerId) {
  const [rows] = await pool.query(
    `
    SELECT
      a.id,
      a.name,
      a.email
    FROM users u
    INNER JOIN users a
      ON a.id = u.registered_under_affiliate_id
    WHERE u.id = ?
      AND u.role = 'customer'
    LIMIT 1
    `,
    [customerId]
  );

  return rows[0] || null;
}

async function getRegisteredWebsite(customerId) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id,
      aw.website_name,
      aw.slug,
      aw.custom_domain,
      aw.logo,
      aw.banner,
      aw.status
    FROM users u
    INNER JOIN affiliate_websites aw
      ON aw.id = u.registered_under_website_id
    WHERE u.id = ?
      AND u.role = 'customer'
    LIMIT 1
    `,
    [customerId]
  );

  return rows[0] || null;
}

async function getCustomerStats(customerId) {
  const [[savedPostsRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM customer_saved_posts
    WHERE customer_id = ?
    `,
    [customerId]
  );

  const [[savedProductsRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM customer_saved_products
    WHERE customer_id = ?
    `,
    [customerId]
  );

  const [[affiliateChatsRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM customer_affiliate_chats
    WHERE customer_id = ?
    `,
    [customerId]
  );

  const [[adminChatsRow]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM customer_admin_chats
    WHERE customer_id = ?
    `,
    [customerId]
  );

  return {
    saved_posts: Number(savedPostsRow?.total || 0),
    saved_products: Number(savedProductsRow?.total || 0),
    affiliate_chats: Number(affiliateChatsRow?.total || 0),
    admin_chats: Number(adminChatsRow?.total || 0),
  };
}

async function getCustomerDashboard(req, res) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        ok: false,
        message: 'Customer not found.',
      });
    }

    const [registeredAffiliate, registeredWebsite, stats] = await Promise.all([
      getRegisteredAffiliate(customerId),
      getRegisteredWebsite(customerId),
      getCustomerStats(customerId),
    ]);

    return res.status(200).json({
      ok: true,
      customer: sanitizeCustomer(customer),
      registered_under: {
        affiliate: registeredAffiliate
          ? {
              id: registeredAffiliate.id,
              name: registeredAffiliate.name,
              email: registeredAffiliate.email,
            }
          : null,
        website: registeredWebsite
          ? {
              id: registeredWebsite.id,
              affiliate_id: registeredWebsite.user_id,
              website_name: registeredWebsite.website_name,
              slug: registeredWebsite.slug,
              custom_domain: registeredWebsite.custom_domain,
              logo: registeredWebsite.logo,
              banner: registeredWebsite.banner,
              status: registeredWebsite.status,
            }
          : null,
      },
      stats,
    });
  } catch (error) {
    console.error('getCustomerDashboard error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch customer dashboard.',
      error: error.message,
    });
  }
}

async function getCustomerSettings(req, res) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        ok: false,
        message: 'Customer not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      settings: {
        profile: sanitizeCustomer(customer),
      },
    });
  } catch (error) {
    console.error('getCustomerSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch customer settings.',
      error: error.message,
    });
  }
}

async function saveCustomerSettings(req, res) {
  try {
    const customerId = req.user?.id;
    const rawName = String(req.body?.name || '').trim();

    if (!customerId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    if (!rawName) {
      return res.status(400).json({
        ok: false,
        message: 'Name is required.',
      });
    }

    await pool.query(
      `
      UPDATE users
      SET
        name = ?,
        updated_at = NOW()
      WHERE id = ?
        AND role = 'customer'
      `,
      [rawName, customerId]
    );

    const customer = await getCustomerById(customerId);

    return res.status(200).json({
      ok: true,
      message: 'Customer settings saved successfully.',
      customer: sanitizeCustomer(customer),
    });
  } catch (error) {
    console.error('saveCustomerSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save customer settings.',
      error: error.message,
    });
  }
}

module.exports = {
  getCustomerDashboard,
  getCustomerSettings,
  saveCustomerSettings,
};