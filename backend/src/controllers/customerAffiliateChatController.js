const pool = require('../config/db');
const {
  toPositiveInt,
  getWriterMessageSettings,
  saveWriterMessageSettings,
  getMessageControls,
  getReaderStartDecision,
  ensureMessageRateLimit,
  setMessageControl,
  createChatReport,
  createMessageNotification,
} = require('../services/writerReaderChatPrivacyService');

function isCustomer(user) {
  return user?.role === 'customer';
}

function isAffiliate(user) {
  return user?.role === 'affiliate';
}

function isAdmin(user) {
  return user?.role === 'admin';
}

function normalizeRequestStatus(value) {
  return value || 'accepted';
}

async function getCustomerById(customerId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, role, status
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
    SELECT id, name, role, status
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
      COALESCE(cac.request_status, 'accepted') AS request_status,
      cac.initiated_by_role,
      cac.request_decided_at,
      cac.request_decided_by,
      cac.last_message_at,
      cac.created_at,
      cac.updated_at,
      cu.name AS customer_name,
      au.name AS affiliate_name,
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

function serializeChat(chat) {
  if (!chat) return null;

  return {
    id: chat.id,
    customer_id: chat.customer_id,
    affiliate_id: chat.affiliate_id,
    reader_id: chat.customer_id,
    writer_id: chat.affiliate_id,
    website_id: chat.website_id,
    chat_type: chat.chat_type,
    product_id: chat.product_id,
    subject: chat.subject,
    status: chat.status,
    request_status: normalizeRequestStatus(chat.request_status),
    initiated_by_role: chat.initiated_by_role,
    request_decided_at: chat.request_decided_at,
    request_decided_by: chat.request_decided_by,
    last_message_at: chat.last_message_at,
    created_at: chat.created_at,
    updated_at: chat.updated_at,
    reader: {
      id: chat.customer_id,
      name: chat.customer_name,
    },
    writer: {
      id: chat.affiliate_id,
      name: chat.affiliate_name,
    },
    customer: {
      id: chat.customer_id,
      name: chat.customer_name,
    },
    affiliate: {
      id: chat.affiliate_id,
      name: chat.affiliate_name,
    },
    website: {
      id: chat.website_id,
      website_name: chat.website_name,
      slug: chat.website_slug,
    },
    product: chat.product_id
      ? {
          id: chat.product_id,
          title: chat.product_title,
          slug: chat.product_slug,
        }
      : null,
  };
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
      u.name AS sender_name
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

async function findOpenChat({
  customerId,
  affiliateId,
  websiteId,
  chatType,
  productId = null,
}) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      COALESCE(request_status, 'accepted') AS request_status
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
      AND COALESCE(request_status, 'accepted') <> 'declined'
    ORDER BY id DESC
    LIMIT 1
    `,
    [customerId, affiliateId, websiteId, chatType, productId, productId]
  );

  return rows[0] || null;
}

async function createChatRow({
  customerId,
  affiliateId,
  websiteId,
  chatType,
  productId,
  subject,
  requestStatus,
  initiatedByRole,
}) {
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
      request_status,
      initiated_by_role,
      last_message_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, NOW(), NOW(), NOW())
    `,
    [
      customerId,
      affiliateId,
      websiteId,
      chatType,
      productId,
      subject,
      requestStatus,
      initiatedByRole,
    ]
  );

  return result.insertId;
}

async function resolveWebsiteForChat({ websiteId, websiteSlug }) {
  if (websiteId) return getWebsiteById(websiteId);
  if (websiteSlug) return getWebsiteBySlug(websiteSlug);
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
    const subject = String(req.body?.subject || '').trim().slice(0, 255) || null;
    const message = String(req.body?.message || '').trim();
    const couponCode = String(req.body?.coupon_code || '').trim() || null;

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'Message is required.',
      });
    }

    if (!['general', 'coupon_request', 'product_question', 'support'].includes(chatType)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid chat type.',
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
          message: 'Reader ID is required.',
        });
      }

      affiliateId = req.user.id;
      senderRole = 'affiliate';
    } else {
      return res.status(403).json({
        ok: false,
        message: 'Only Readers or Writers can start this conversation.',
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer || customer.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Reader account is not active.',
      });
    }

    const website = await resolveWebsiteForChat({
      websiteId,
      websiteSlug,
    });

    if (!website || website.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Writer Space not found.',
      });
    }

    if (isCustomer(req.user)) {
      if (requestedAffiliateId && requestedAffiliateId !== website.affiliate_id) {
        return res.status(400).json({
          ok: false,
          message: 'Writer ID does not match this Writer Space.',
        });
      }

      affiliateId = website.affiliate_id;
    }

    if (isAffiliate(req.user) && website.affiliate_id !== req.user.id) {
      return res.status(403).json({
        ok: false,
        message: 'You can only start conversations for your own Writer Space.',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate || affiliate.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Writer not found.',
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
          message: 'This product does not belong to the selected Writer Space.',
        });
      }

      finalProductId = product.id;
    }

    await ensureMessageRateLimit(req.user.id);

    let desiredRequestStatus = 'accepted';

    if (isCustomer(req.user)) {
      const decision = await getReaderStartDecision(customerId, affiliateId);

      if (!decision.allowed) {
        return res.status(403).json({
          ok: false,
          message: decision.reason,
          messaging: decision,
        });
      }

      desiredRequestStatus = decision.request_status;
    }

    const existing = await findOpenChat({
      customerId,
      affiliateId,
      websiteId: website.id,
      chatType,
      productId: finalProductId,
    });

    if (existing && normalizeRequestStatus(existing.request_status) === 'pending') {
      return res.status(409).json({
        ok: false,
        message: 'Your message request is already waiting for the Writer.',
        chat_id: existing.id,
        request_status: 'pending',
      });
    }

    const chatId = existing?.id || await createChatRow({
      customerId,
      affiliateId,
      websiteId: website.id,
      chatType,
      productId: finalProductId,
      subject,
      requestStatus: desiredRequestStatus,
      initiatedByRole: senderRole,
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

    if (!existing) {
      if (senderRole === 'customer') {
        await createMessageNotification({
          recipientUserId: affiliateId,
          actorUserId: customerId,
          type:
            desiredRequestStatus === 'accepted'
              ? 'reader_writer_message'
              : 'reader_writer_message_request',
          title:
            desiredRequestStatus === 'accepted'
              ? 'New message from a Reader'
              : 'New Reader message request',
          message:
            desiredRequestStatus === 'accepted'
              ? 'A Reader sent you a message.'
              : 'A Reader would like to message you.',
        });
      } else {
        await createMessageNotification({
          recipientUserId: customerId,
          actorUserId: affiliateId,
          type: 'writer_reader_message',
          title: 'New message from a Writer',
          message: 'A Writer sent you a message.',
        });
      }
    }

    const chat = await getChatById(chatId);
    const messages = await getMessagesByChatId(chatId);

    return res.status(201).json({
      ok: true,
      message:
        normalizeRequestStatus(chat.request_status) === 'pending'
          ? 'Message request sent to the Writer.'
          : 'Conversation started.',
      chat: serializeChat(chat),
      messages,
    });
  } catch (error) {
    console.error('createCustomerAffiliateChat error:', error);

    const status =
      /rate limit|required|invalid|blocked/i.test(error.message || '')
        ? 400
        : 500;

    return res.status(status).json({
      ok: false,
      message: error.message || 'Failed to create Reader-Writer conversation.',
    });
  }
}

async function sendCustomerAffiliateMessage(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);
    const message = String(req.body?.message || '').trim();
    const couponCode = String(req.body?.coupon_code || '').trim() || null;

    if (!chatId || !message) {
      return res.status(400).json({
        ok: false,
        message: 'Valid conversation ID and message are required.',
      });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Conversation not found.',
      });
    }

    let senderRole = null;

    if (isCustomer(req.user) && req.user.id === chat.customer_id) {
      senderRole = 'customer';
    } else if (isAffiliate(req.user) && req.user.id === chat.affiliate_id) {
      senderRole = 'affiliate';
    } else {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to send a message in this conversation.',
      });
    }

    if (chat.status !== 'open') {
      return res.status(400).json({
        ok: false,
        message: 'This conversation is closed.',
      });
    }

    const requestStatus = normalizeRequestStatus(chat.request_status);

    if (requestStatus === 'pending') {
      return res.status(403).json({
        ok: false,
        message: 'The Writer must accept this message request before more messages can be sent.',
      });
    }

    if (requestStatus === 'declined') {
      return res.status(403).json({
        ok: false,
        message: 'This message request was declined.',
      });
    }

    const controls = await getMessageControls(
      chat.customer_id,
      chat.affiliate_id
    );

    if (controls.writer_blocked || controls.reader_blocked) {
      return res.status(403).json({
        ok: false,
        message: 'Messaging is blocked between these accounts.',
      });
    }

    await ensureMessageRateLimit(req.user.id);

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
        last_message_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [chatId]
    );

    const recipientId =
      senderRole === 'customer'
        ? chat.affiliate_id
        : chat.customer_id;

    const recipientMuted =
      senderRole === 'customer'
        ? controls.writer_muted
        : controls.reader_muted;

    if (!recipientMuted) {
      await createMessageNotification({
        recipientUserId: recipientId,
        actorUserId: req.user.id,
        type:
          senderRole === 'customer'
            ? 'reader_writer_message'
            : 'writer_reader_message',
        title:
          senderRole === 'customer'
            ? 'New message from a Reader'
            : 'New message from a Writer',
        message: 'You have a new message.',
      });
    }

    const freshChat = await getChatById(chatId);
    const messages = await getMessagesByChatId(chatId);

    return res.status(200).json({
      ok: true,
      message: 'Message sent.',
      chat: serializeChat(freshChat),
      messages,
    });
  } catch (error) {
    console.error('sendCustomerAffiliateMessage error:', error);

    const status = /rate limit/i.test(error.message || '') ? 429 : 500;

    return res.status(status).json({
      ok: false,
      message: error.message || 'Failed to send message.',
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
        COALESCE(cac.request_status, 'accepted') AS request_status,
        cac.initiated_by_role,
        cac.request_decided_at,
        cac.request_decided_by,
        cac.last_message_at,
        cac.created_at,
        cac.updated_at,
        cu.name AS customer_name,
        au.name AS affiliate_name,
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
      chats: rows.map(serializeChat),
    });
  } catch (error) {
    console.error('getMyCustomerAffiliateChats error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch Reader-Writer conversations.',
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
        message: 'Valid conversation ID is required.',
      });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Conversation not found.',
      });
    }

    const isOwnerCustomer =
      isCustomer(req.user) &&
      req.user.id === chat.customer_id;

    const isOwnerAffiliate =
      isAffiliate(req.user) &&
      req.user.id === chat.affiliate_id;

    const isViewingAdmin = isAdmin(req.user);

    if (!isOwnerCustomer && !isOwnerAffiliate && !isViewingAdmin) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to view this conversation.',
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
    const controls = await getMessageControls(
      chat.customer_id,
      chat.affiliate_id
    );

    return res.status(200).json({
      ok: true,
      chat: serializeChat(chat),
      controls,
      messages,
    });
  } catch (error) {
    console.error('getCustomerAffiliateChatDetails error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch conversation details.',
      error: error.message,
    });
  }
}

async function closeCustomerAffiliateChat(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);
    const chat = chatId ? await getChatById(chatId) : null;

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Conversation not found.',
      });
    }

    const canClose =
      (isCustomer(req.user) && req.user.id === chat.customer_id) ||
      (isAffiliate(req.user) && req.user.id === chat.affiliate_id) ||
      isAdmin(req.user);

    if (!canClose) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to close this conversation.',
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
      message: 'Conversation closed.',
      chat: serializeChat(freshChat),
    });
  } catch (error) {
    console.error('closeCustomerAffiliateChat error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to close conversation.',
      error: error.message,
    });
  }
}

async function getWriterMessagingSettings(req, res) {
  try {
    if (!isAffiliate(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Writer account required.',
      });
    }

    const settings = await getWriterMessageSettings(req.user.id);

    return res.status(200).json({
      ok: true,
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer message settings.',
      error: error.message,
    });
  }
}

async function updateWriterMessagingSettings(req, res) {
  try {
    if (!isAffiliate(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Writer account required.',
      });
    }

    const contactPolicy = String(
      req.body?.contact_policy || ''
    ).trim();

    const paidMembersDirect =
      req.body?.paid_members_direct === undefined
        ? true
        : Boolean(req.body.paid_members_direct);

    const settings = await saveWriterMessageSettings(
      req.user.id,
      {
        contactPolicy,
        paidMembersDirect,
      }
    );

    return res.status(200).json({
      ok: true,
      message: 'Writer message settings updated.',
      settings,
    });
  } catch (error) {
    const status = /invalid/i.test(error.message || '') ? 400 : 500;

    return res.status(status).json({
      ok: false,
      message: error.message || 'Failed to update Writer message settings.',
    });
  }
}

async function getWriterMessagingEligibility(req, res) {
  try {
    const writerId = toPositiveInt(req.params?.writerId);

    if (!writerId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid Writer ID is required.',
      });
    }

    const writer = await getAffiliateById(writerId);

    if (!writer || writer.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Writer not found.',
      });
    }

    const settings = await getWriterMessageSettings(writerId);

    if (!isCustomer(req.user)) {
      return res.status(200).json({
        ok: true,
        writer_id: writerId,
        settings: {
          contact_policy: settings.contact_policy,
          paid_members_direct: settings.paid_members_direct,
        },
        messaging: {
          allowed: false,
          reason: 'Sign in as a Reader to message this Writer.',
        },
      });
    }

    const decision = await getReaderStartDecision(
      req.user.id,
      writerId
    );

    return res.status(200).json({
      ok: true,
      writer_id: writerId,
      settings: {
        contact_policy: settings.contact_policy,
        paid_members_direct: settings.paid_members_direct,
      },
      messaging: decision,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer messaging eligibility.',
      error: error.message,
    });
  }
}

async function decideMessageRequest(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);
    const action = String(req.params?.action || '').trim();

    if (!chatId || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        ok: false,
        message: 'Valid request action is required.',
      });
    }

    const chat = await getChatById(chatId);

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Conversation not found.',
      });
    }

    if (!isAffiliate(req.user) || req.user.id !== chat.affiliate_id) {
      return res.status(403).json({
        ok: false,
        message: 'Only this Writer can decide the message request.',
      });
    }

    if (normalizeRequestStatus(chat.request_status) !== 'pending') {
      return res.status(400).json({
        ok: false,
        message: 'This conversation is not awaiting a message-request decision.',
      });
    }

    const nextStatus = action === 'accept' ? 'accepted' : 'declined';
    const nextChatStatus = action === 'accept' ? 'open' : 'closed';

    await pool.query(
      `
      UPDATE customer_affiliate_chats
      SET
        request_status = ?,
        request_decided_at = NOW(),
        request_decided_by = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [nextStatus, req.user.id, nextChatStatus, chatId]
    );

    await createMessageNotification({
      recipientUserId: chat.customer_id,
      actorUserId: req.user.id,
      type:
        action === 'accept'
          ? 'writer_accepted_message_request'
          : 'writer_declined_message_request',
      title:
        action === 'accept'
          ? 'Writer accepted your message request'
          : 'Writer declined your message request',
      message:
        action === 'accept'
          ? 'You can now continue the conversation.'
          : 'The Writer is not accepting this conversation.',
    });

    const freshChat = await getChatById(chatId);

    return res.status(200).json({
      ok: true,
      message:
        action === 'accept'
          ? 'Message request accepted.'
          : 'Message request declined.',
      chat: serializeChat(freshChat),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Failed to update message request.',
      error: error.message,
    });
  }
}

async function updateMessageControl(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);
    const action = String(req.params?.action || '').trim();
    const chat = chatId ? await getChatById(chatId) : null;

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Conversation not found.',
      });
    }

    let actorRole = null;

    if (isCustomer(req.user) && req.user.id === chat.customer_id) {
      actorRole = 'customer';
    } else if (isAffiliate(req.user) && req.user.id === chat.affiliate_id) {
      actorRole = 'affiliate';
    } else {
      return res.status(403).json({
        ok: false,
        message: 'Only conversation participants can change message controls.',
      });
    }

    const controls = await setMessageControl({
      writerUserId: chat.affiliate_id,
      readerUserId: chat.customer_id,
      actorUserId: req.user.id,
      actorRole,
      action,
    });

    return res.status(200).json({
      ok: true,
      message: `Conversation ${action} updated.`,
      controls,
    });
  } catch (error) {
    const status = /invalid/i.test(error.message || '') ? 400 : 500;

    return res.status(status).json({
      ok: false,
      message: error.message || 'Failed to update message control.',
    });
  }
}

async function reportConversation(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);
    const chat = chatId ? await getChatById(chatId) : null;

    if (!chat) {
      return res.status(404).json({
        ok: false,
        message: 'Conversation not found.',
      });
    }

    let reportedUserId = null;

    if (isCustomer(req.user) && req.user.id === chat.customer_id) {
      reportedUserId = chat.affiliate_id;
    } else if (isAffiliate(req.user) && req.user.id === chat.affiliate_id) {
      reportedUserId = chat.customer_id;
    } else {
      return res.status(403).json({
        ok: false,
        message: 'Only conversation participants can report this conversation.',
      });
    }

    const reportId = await createChatReport({
      chatId,
      reporterUserId: req.user.id,
      reportedUserId,
      reason: req.body?.reason,
    });

    return res.status(201).json({
      ok: true,
      message: 'Conversation reported.',
      report_id: reportId,
    });
  } catch (error) {
    const status = /required/i.test(error.message || '') ? 400 : 500;

    return res.status(status).json({
      ok: false,
      message: error.message || 'Failed to report conversation.',
    });
  }
}

module.exports = {
  createCustomerAffiliateChat,
  sendCustomerAffiliateMessage,
  getMyCustomerAffiliateChats,
  getCustomerAffiliateChatDetails,
  closeCustomerAffiliateChat,
  getWriterMessagingSettings,
  updateWriterMessagingSettings,
  getWriterMessagingEligibility,
  decideMessageRequest,
  updateMessageControl,
  reportConversation,
};