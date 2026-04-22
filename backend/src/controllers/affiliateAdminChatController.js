const pool = require('../config/db');

function toPositiveInt(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function isAffiliate(user) {
  return user?.role === 'affiliate';
}

function isAdmin(user) {
  return user?.role === 'admin';
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

async function getChatById(chatId) {
  const [rows] = await pool.query(
    `
    SELECT
      aac.id,
      aac.affiliate_id,
      aac.subject,
      aac.status,
      aac.last_message_at,
      aac.created_at,
      aac.updated_at,
      u.name AS affiliate_name,
      u.email AS affiliate_email
    FROM affiliate_admin_chats aac
    LEFT JOIN users u
      ON u.id = aac.affiliate_id
    WHERE aac.id = ?
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
      m.is_read,
      m.read_at,
      m.created_at,
      u.name AS sender_name,
      u.email AS sender_email
    FROM affiliate_admin_chat_messages m
    LEFT JOIN users u
      ON u.id = m.sender_id
    WHERE m.chat_id = ?
    ORDER BY m.created_at ASC, m.id ASC
    `,
    [chatId]
  );

  return rows;
}

async function openOrFindAffiliateAdminChat({ affiliateId, subject = null }) {
  const [existingRows] = await pool.query(
    `
    SELECT id
    FROM affiliate_admin_chats
    WHERE affiliate_id = ?
      AND status = 'open'
      AND (
        (subject IS NULL AND ? IS NULL)
        OR subject = ?
      )
    ORDER BY id DESC
    LIMIT 1
    `,
    [affiliateId, subject, subject]
  );

  if (existingRows[0]) {
    return existingRows[0].id;
  }

  const [result] = await pool.query(
    `
    INSERT INTO affiliate_admin_chats (
      affiliate_id,
      subject,
      status,
      last_message_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, 'open', NOW(), NOW(), NOW())
    `,
    [affiliateId, subject]
  );

  return result.insertId;
}

async function createAffiliateAdminChat(req, res) {
  try {
    const subject = String(req.body?.subject || '').trim() || null;
    const message = String(req.body?.message || '').trim();

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'message is required.',
      });
    }

    let affiliateId = null;
    let senderRole = null;

    if (isAffiliate(req.user)) {
      affiliateId = req.user.id;
      senderRole = 'affiliate';
    } else if (isAdmin(req.user)) {
      affiliateId = toPositiveInt(req.body?.affiliate_id);

      if (!affiliateId) {
        return res.status(400).json({
          ok: false,
          message: 'affiliate_id is required.',
        });
      }

      senderRole = 'admin';
    } else {
      return res.status(403).json({
        ok: false,
        message: 'Only affiliates or admin can start this support chat.',
      });
    }

    const affiliate = await getAffiliateById(affiliateId);

    if (!affiliate || affiliate.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Affiliate account is not active.',
      });
    }

    const chatId = await openOrFindAffiliateAdminChat({
      affiliateId,
      subject,
    });

    await pool.query(
      `
      INSERT INTO affiliate_admin_chat_messages (
        chat_id,
        sender_id,
        sender_role,
        message,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, ?, 0, NOW())
      `,
      [chatId, req.user.id, senderRole, message]
    );

    await pool.query(
      `
      UPDATE affiliate_admin_chats
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
      message: 'Support chat started successfully.',
      chat,
      messages,
    });
  } catch (error) {
    console.error('createAffiliateAdminChat error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create affiliate-admin chat.',
      error: error.message,
    });
  }
}

async function sendAffiliateAdminMessage(req, res) {
  try {
    const chatId = toPositiveInt(req.params?.chatId);
    const message = String(req.body?.message || '').trim();

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

    if (isAffiliate(req.user) && req.user.id === chat.affiliate_id) {
      senderRole = 'affiliate';
    } else if (isAdmin(req.user)) {
      senderRole = 'admin';
    } else {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to send message in this chat.',
      });
    }

    await pool.query(
      `
      INSERT INTO affiliate_admin_chat_messages (
        chat_id,
        sender_id,
        sender_role,
        message,
        is_read,
        created_at
      )
      VALUES (?, ?, ?, ?, 0, NOW())
      `,
      [chatId, req.user.id, senderRole, message]
    );

    await pool.query(
      `
      UPDATE affiliate_admin_chats
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
    console.error('sendAffiliateAdminMessage error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to send message.',
      error: error.message,
    });
  }
}

async function getMyAffiliateAdminChats(req, res) {
  try {
    if (!isAffiliate(req.user) && !isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Unauthorized role.',
      });
    }

    let sql = `
      SELECT
        aac.id,
        aac.affiliate_id,
        aac.subject,
        aac.status,
        aac.last_message_at,
        aac.created_at,
        aac.updated_at,
        u.name AS affiliate_name,
        u.email AS affiliate_email
      FROM affiliate_admin_chats aac
      LEFT JOIN users u
        ON u.id = aac.affiliate_id
      WHERE 1 = 1
    `;
    const params = [];

    if (isAffiliate(req.user)) {
      sql += ` AND aac.affiliate_id = ? `;
      params.push(req.user.id);
    } else if (isAdmin(req.user)) {
      const affiliateId = toPositiveInt(req.query?.affiliate_id);
      if (affiliateId) {
        sql += ` AND aac.affiliate_id = ? `;
        params.push(affiliateId);
      }
    }

    sql += ` ORDER BY aac.last_message_at DESC, aac.id DESC `;

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      ok: true,
      chats: rows.map((row) => ({
        id: row.id,
        affiliate_id: row.affiliate_id,
        subject: row.subject,
        status: row.status,
        last_message_at: row.last_message_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        affiliate: {
          id: row.affiliate_id,
          name: row.affiliate_name,
          email: row.affiliate_email,
        },
      })),
    });
  } catch (error) {
    console.error('getMyAffiliateAdminChats error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch chats.',
      error: error.message,
    });
  }
}

async function getAffiliateAdminChatDetails(req, res) {
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

    const isOwnerAffiliate = isAffiliate(req.user) && req.user.id === chat.affiliate_id;
    const isViewingAdmin = isAdmin(req.user);

    if (!isOwnerAffiliate && !isViewingAdmin) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to view this chat.',
      });
    }

    if (isOwnerAffiliate) {
      await pool.query(
        `
        UPDATE affiliate_admin_chat_messages
        SET
          is_read = 1,
          read_at = NOW()
        WHERE chat_id = ?
          AND sender_role = 'admin'
          AND is_read = 0
        `,
        [chatId]
      );
    }

    if (isViewingAdmin) {
      await pool.query(
        `
        UPDATE affiliate_admin_chat_messages
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

    const messages = await getMessagesByChatId(chatId);

    return res.status(200).json({
      ok: true,
      chat,
      messages,
    });
  } catch (error) {
    console.error('getAffiliateAdminChatDetails error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch chat details.',
      error: error.message,
    });
  }
}

async function closeAffiliateAdminChat(req, res) {
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
      (isAffiliate(req.user) && req.user.id === chat.affiliate_id) || isAdmin(req.user);

    if (!canClose) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to close this chat.',
      });
    }

    await pool.query(
      `
      UPDATE affiliate_admin_chats
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
    console.error('closeAffiliateAdminChat error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to close chat.',
      error: error.message,
    });
  }
}

module.exports = {
  createAffiliateAdminChat,
  sendAffiliateAdminMessage,
  getMyAffiliateAdminChats,
  getAffiliateAdminChatDetails,
  closeAffiliateAdminChat,
};