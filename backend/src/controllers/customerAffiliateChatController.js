const pool = require('../config/db');

function toPositiveInt(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function isCustomer(user) {
  return user?.role === 'customer';
}

function isAffiliate(user) {
  return user?.role === 'affiliate';
}

function isAdmin(user) {
  return user?.role === 'admin';
}

async function getCustomerById(customerId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, email, role, status
    FROM users
    WHERE id = ?
      AND role = 'customer'
    LIMIT 1
    `,
    [customerId]
  );

  return rows[0] || null;
}

async function getAffiliateById(affiliateId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, email, role, status
    FROM users
    WHERE id = ?
      AND role = 'affiliate'
    LIMIT 1
    `,
    [affiliateId]
  );

  return rows[0] || null;
}

async function getWebsiteById(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id AS affiliate_id,
      aw.website_name,
      aw.slug,
      aw.status
    FROM affiliate_websites aw
    WHERE aw.id = ?
    LIMIT 1
    `,
    [websiteId]
  );

  return rows[0] || null;
}

async function getWebsiteBySlug(slug) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id AS affiliate_id,
      aw.website_name,
      aw.slug,
      aw.status
    FROM affiliate_websites aw
    WHERE aw.slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}

async function getProductById(productId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id AS affiliate_id,
      p.website_id,
      p.title,
      p.slug
    FROM products p
    WHERE p.id = ?
    LIMIT 1
    `,
    [productId]
  );

  return rows[0] || null;
}

async function getChatById(chatId) {
  const [rows] = await pool.query(
    `
    SELECT
      cac.id,
      cac.customer_id,
      cac.affiliate_id,
      cac.website_id,
      cac.chat_type,
      cac.product_id,
      cac.subject,
      cac.status,
      cac.last_message_at,
      cac.created_at,
      cac.updated_at,

      cu.name AS customer_name,
      cu.email AS customer_email,

      au.name AS affiliate_name,
      au.email AS affiliate_email,

      aw.website_name,
      aw.slug AS website_slug,

      p.title AS product_title,
      p.slug AS product_slug
    FROM customer_affiliate_chats cac
    LEFT JOIN users cu
      ON cu.id = cac.customer_id
    LEFT JOIN users au
      ON au.id = cac.affiliate_id
    LEFT JOIN affiliate_websites aw
      ON aw.id = cac.website_id
    LEFT JOIN products p
      ON p.id = cac.product_id
    WHERE cac.id = ?
    LIMIT 1
    `,
    [chatId]
  );

  return rows[0] || null;
}

async function getMessagesByChatId(chatId) {
  const [rows] = await pool.query(
    `
    SELECT
      m.id,
      m.chat_id,
      m.sender_id,
      m.sender_role,
      m.message,
      m.coupon_code,
      m.is_read,
      m.read_at,
      m.created_at,
      u.name AS sender_name,
      u.email AS sender_email
    FROM customer_affiliate_chat_messages m
    LEFT JOIN users u
      ON u.id = m.sender_id
    WHERE m.chat_id = ?
    ORDER BY m.created_at ASC, m.id ASC
    `,
    [chatId]
  );

  return rows;
}

async function openOrFindChat({
  customerId,
  affiliateId,
  websiteId,
  chatType,
  productId = null,
  subject = null,
}) {
  const [existingRows] = await pool.query(
    `
    SELECT id
    FROM customer_affiliate_chats
    WHERE customer_id = ?
      AND affiliate_id = ?
      AND website_id = ?
      AND chat_type = ?
      AND (
        (product_id IS NULL AND ? IS NULL)
        OR product_id = ?
      )
      AND status = 'open'
    ORDER BY id DESC
    LIMIT 1
    `,
    [customerId, affiliateId, websiteId, chatType, productId, productId]
  );

  if (existingRows[0]) {
    return existingRows[0].id;
  }

  const [result] = await pool.query(
    `
    INSERT INTO customer_affiliate_chats (
      customer_id,
      affiliate_id,
      website_id,
      chat_type,
      product_id,
      subject,
      status,
      last_message_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'open', NOW(), NOW(), NOW())
    `,
    [customerId, affiliateId, websiteId, chatType, productId, subject]
  );

  return result.insertId;
}

async function resolveWebsiteForChat({ websiteId, websiteSlug }) {
  if (websiteId) {
    return getWebsiteById(websiteId);
  }

  if (websiteSlug) {
    return getWebsiteBySlug(websiteSlug);
  }

  return null;
}

async function createCustomerAffiliateChat(req, res) {
  try {
    const websiteId = toPositiveInt(req.body?.website_id);
    const websiteSlug = String(req.body?.website_slug || '').trim();
    const requestedAffiliateId = toPositiveInt(req.body?.affiliate_id);
    const requestedCustomerId = toPositiveInt(req.body?.customer_id);
    const productId =
      req.body?.product_id !== undefined &&
      req.body?.product_id !== null &&
      req.body?.product_id !== ''
        ? toPositiveInt(req.body.product_id)
        : null;
    const chatType = String(req.body?.chat_type || 'general').trim();
    const subject = String(req.body?.subject || '').trim() || null;
    const message = String(req.body?.message || '').trim();
    const couponCode = String(req.body?.coupon_code || '').trim() || null;

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'message is required.',
      });
    }

    if (!['general', 'coupon_request', 'product_question', 'support'].includes(chatType)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid chat_type.',
      });
    }

    let customerId = null;
    let affiliateId = null;
    let senderRole = null;

    if (isCustomer(req.user)) {
      customerId = req.user.id;
      senderRole = 'customer';
    } else if (isAffiliate(req.user)) {
      customerId = requestedCustomerId;

      if (!customerId) {
        return res.status(400).json({
          ok: false,
          message: 'customer_id is required.',
        });
      }

      affiliateId = req.user.id;
      senderRole = 'affiliate';
    } else {
      return res.status(403).json({
        ok: false,
        message: 'Only customers or affiliates can start this chat.',
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer || customer.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Customer account is not active.',
      });
    }

    const website = await resolveWebsiteForChat({
      websiteId,
      websiteSlug,
    });

    if (!website || website.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Storefront not found.',
      });
    }

    if (isCustomer(req.user)) {
      if (requestedAffiliateId && requestedAffiliateId !== website.affiliate_id) {
        return res.status(400).json({
          ok: false,
          message: 'affiliate_id does not match this storefront.',
        });
      }

      affiliateId = website.affiliate_id;
    }

    if (isAffiliate(req.user) && website.affiliate_id !== req.user.id) {
      return res.status(403).json({
        ok: false,
        message: 'You can only start chats for your own storefront.',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate || affiliate.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate not found.',
      });
    }

    let finalProductId = null;

    if (productId) {
      const product = await getProductById(productId);

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: 'Product not found.',
        });
      }

      if (product.website_id !== website.id || product.affiliate_id !== affiliateId) {
        return res.status(400).json({
          ok: false,
          message: 'This product does not belong to the selected storefront.',
        });
      }

      finalProductId = product.id;
    }

    const chatId = await openOrFindChat({
      customerId,
      affiliateId,
      websiteId: website.id,
      chatType,
      productId: finalProductId,
      subject,
    });

    await pool.query(
      `
      INSERT INTO customer_affiliate_chat_messages (
        chat_id,
        sender_id,
        sender_role,
        message,
        coupon_code,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, 0, NOW())
      `,
      [chatId, req.user.id, senderRole, message, couponCode]
    );

    await pool.query(
      `
      UPDATE customer_affiliate_chats
      SET
        status = 'open',
        last_message_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [chatId]
    );

    const chat = await getChatById(chatId);
    const messages = await getMessagesByChatId(chatId);

    return res.status(201).json({
      ok: true,
      message: 'Chat started successfully.',
      chat,
      messages,
    });
  } catch (error) {
    console.error('createCustomerAffiliateChat error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create customer-affiliate chat.',
      error: error.message,
    });
  }
}

async function sendCustomerAffiliateMessage(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);
    const message = String(req.body?.message || '').trim();
    const couponCode = String(req.body?.coupon_code || '').trim() || null;

    if (!chatId) {
      return res.status(400).json({
        ok: false,
        message: 'chatId is required.',
      });
    }

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'message is required.',
      });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Chat not found.',
      });
    }

    let senderRole = null;

    if (isCustomer(req.user) && req.user.id === chat.customer_id) {
      senderRole = 'customer';
    } else if (isAffiliate(req.user) && req.user.id === chat.affiliate_id) {
      senderRole = 'affiliate';
    } else if (isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Admin cannot send messages in customer-affiliate chat.',
      });
    } else {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to send message in this chat.',
      });
    }

    await pool.query(
      `
      INSERT INTO customer_affiliate_chat_messages (
        chat_id,
        sender_id,
        sender_role,
        message,
        coupon_code,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, 0, NOW())
      `,
      [chatId, req.user.id, senderRole, message, couponCode]
    );

    await pool.query(
      `
      UPDATE customer_affiliate_chats
      SET
        status = 'open',
        last_message_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [chatId]
    );

    const freshChat = await getChatById(chatId);
    const messages = await getMessagesByChatId(chatId);

    return res.status(200).json({
      ok: true,
      message: 'Message sent successfully.',
      chat: freshChat,
      messages,
    });
  } catch (error) {
    console.error('sendCustomerAffiliateMessage error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to send message.',
      error: error.message,
    });
  }
}

async function getMyCustomerAffiliateChats(req, res) {
  try {
    if (!isCustomer(req.user) && !isAffiliate(req.user) && !isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Unauthorized role.',
      });
    }

    let sql = `
      SELECT
        cac.id,
        cac.customer_id,
        cac.affiliate_id,
        cac.website_id,
        cac.chat_type,
        cac.product_id,
        cac.subject,
        cac.status,
        cac.last_message_at,
        cac.created_at,
        cac.updated_at,

        cu.name AS customer_name,
        cu.email AS customer_email,

        au.name AS affiliate_name,
        au.email AS affiliate_email,

        aw.website_name,
        aw.slug AS website_slug,

        p.title AS product_title,
        p.slug AS product_slug
      FROM customer_affiliate_chats cac
      LEFT JOIN users cu
        ON cu.id = cac.customer_id
      LEFT JOIN users au
        ON au.id = cac.affiliate_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = cac.website_id
      LEFT JOIN products p
        ON p.id = cac.product_id
      WHERE 1 = 1
    `;
    const params = [];

    if (isCustomer(req.user)) {
      sql += ` AND cac.customer_id = ? `;
      params.push(req.user.id);
    } else if (isAffiliate(req.user)) {
      sql += ` AND cac.affiliate_id = ? `;
      params.push(req.user.id);
    } else if (isAdmin(req.user)) {
      const affiliateId = toPositiveInt(req.query?.affiliate_id);
      const customerId = toPositiveInt(req.query?.customer_id);
      const websiteId = toPositiveInt(req.query?.website_id);

      if (affiliateId) {
        sql += ` AND cac.affiliate_id = ? `;
        params.push(affiliateId);
      }

      if (customerId) {
        sql += ` AND cac.customer_id = ? `;
        params.push(customerId);
      }

      if (websiteId) {
        sql += ` AND cac.website_id = ? `;
        params.push(websiteId);
      }
    }

    sql += ` ORDER BY cac.last_message_at DESC, cac.id DESC `;

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      ok: true,
      chats: rows.map((row) => ({
        id: row.id,
        customer_id: row.customer_id,
        affiliate_id: row.affiliate_id,
        website_id: row.website_id,
        chat_type: row.chat_type,
        product_id: row.product_id,
        subject: row.subject,
        status: row.status,
        last_message_at: row.last_message_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        customer: {
          id: row.customer_id,
          name: row.customer_name,
          email: row.customer_email,
        },
        affiliate: {
          id: row.affiliate_id,
          name: row.affiliate_name,
          email: row.affiliate_email,
        },
        website: {
          id: row.website_id,
          website_name: row.website_name,
          slug: row.website_slug,
        },
        product: row.product_id
          ? {
              id: row.product_id,
              title: row.product_title,
              slug: row.product_slug,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('getMyCustomerAffiliateChats error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch chats.',
      error: error.message,
    });
  }
}

async function getCustomerAffiliateChatDetails(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);

    if (!chatId) {
      return res.status(400).json({
        ok: false,
        message: 'chatId is required.',
      });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Chat not found.',
      });
    }

    const isOwnerCustomer = isCustomer(req.user) && req.user.id === chat.customer_id;
    const isOwnerAffiliate = isAffiliate(req.user) && req.user.id === chat.affiliate_id;
    const isViewingAdmin = isAdmin(req.user);

    if (!isOwnerCustomer && !isOwnerAffiliate && !isViewingAdmin) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to view this chat.',
      });
    }

    if (isOwnerCustomer) {
      await pool.query(
        `
        UPDATE customer_affiliate_chat_messages
        SET
          is_read = 1,
          read_at = NOW()
        WHERE chat_id = ?
          AND sender_role = 'affiliate'
          AND is_read = 0
        `,
        [chatId]
      );
    }

    if (isOwnerAffiliate) {
      await pool.query(
        `
        UPDATE customer_affiliate_chat_messages
        SET
          is_read = 1,
          read_at = NOW()
        WHERE chat_id = ?
          AND sender_role = 'customer'
          AND is_read = 0
        `,
        [chatId]
      );
    }

    const messages = await getMessagesByChatId(chatId);

    return res.status(200).json({
      ok: true,
      chat,
      messages,
    });
  } catch (error) {
    console.error('getCustomerAffiliateChatDetails error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch chat details.',
      error: error.message,
    });
  }
}

async function closeCustomerAffiliateChat(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);

    if (!chatId) {
      return res.status(400).json({
        ok: false,
        message: 'chatId is required.',
      });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Chat not found.',
      });
    }

    const canClose =
      (isCustomer(req.user) && req.user.id === chat.customer_id) ||
      (isAffiliate(req.user) && req.user.id === chat.affiliate_id) ||
      isAdmin(req.user);

    if (!canClose) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to close this chat.',
      });
    }

    await pool.query(
      `
      UPDATE customer_affiliate_chats
      SET
        status = 'closed',
        updated_at = NOW()
      WHERE id = ?
      `,
      [chatId]
    );

    const freshChat = await getChatById(chatId);

    return res.status(200).json({
      ok: true,
      message: 'Chat closed successfully.',
      chat: freshChat,
    });
  } catch (error) {
    console.error('closeCustomerAffiliateChat error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to close chat.',
      error: error.message,
    });
  }
}

module.exports = {
  createCustomerAffiliateChat,
  sendCustomerAffiliateMessage,
  getMyCustomerAffiliateChats,
  getCustomerAffiliateChatDetails,
  closeCustomerAffiliateChat,
};