const pool = require('../config/db');

function toPositiveInt(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function isCustomer(user) {
  return user?.role === 'customer';
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

async function getChatById(chatId) {
  const [rows] = await pool.query(
    `
    SELECT
      cac.id,
      cac.customer_id,
      cac.subject,
      cac.status,
      cac.last_message_at,
      cac.created_at,
      cac.updated_at,
      u.name AS customer_name,
      u.email AS customer_email
    FROM customer_admin_chats cac
    LEFT JOIN users u
      ON u.id = cac.customer_id
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
      m.is_read,
      m.read_at,
      m.created_at,
      u.name AS sender_name,
      u.email AS sender_email
    FROM customer_admin_chat_messages m
    LEFT JOIN users u
      ON u.id = m.sender_id
    WHERE m.chat_id = ?
    ORDER BY m.created_at ASC, m.id ASC
    `,
    [chatId]
  );

  return rows;
}

async function openOrFindCustomerAdminChat({ customerId, subject = null }) {
  const [existingRows] = await pool.query(
    `
    SELECT id
    FROM customer_admin_chats
    WHERE customer_id = ?
      AND status = 'open'
      AND (
        (subject IS NULL AND ? IS NULL)
        OR subject = ?
      )
    ORDER BY id DESC
    LIMIT 1
    `,
    [customerId, subject, subject]
  );

  if (existingRows[0]) {
    return existingRows[0].id;
  }

  const [result] = await pool.query(
    `
    INSERT INTO customer_admin_chats (
      customer_id,
      subject,
      status,
      last_message_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, 'open', NOW(), NOW(), NOW())
    `,
    [customerId, subject]
  );

  return result.insertId;
}

async function createCustomerAdminChat(req, res) {
  try {
    const subject = String(req.body?.subject || '').trim() || null;
    const message = String(req.body?.message || '').trim();

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'message is required.',
      });
    }

    let customerId = null;
    let senderRole = null;

    if (isCustomer(req.user)) {
      customerId = req.user.id;
      senderRole = 'customer';
    } else if (isAdmin(req.user)) {
      customerId = toPositiveInt(req.body?.customer_id);

      if (!customerId) {
        return res.status(400).json({
          ok: false,
          message: 'customer_id is required.',
        });
      }

      senderRole = 'admin';
    } else {
      return res.status(403).json({
        ok: false,
        message: 'Only customers or admin can start this support chat.',
      });
    }

    const customer = await getCustomerById(customerId);

    if (!customer || customer.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Customer account is not active.',
      });
    }

    const chatId = await openOrFindCustomerAdminChat({
      customerId,
      subject,
    });

    await pool.query(
      `
      INSERT INTO customer_admin_chat_messages (
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
      UPDATE customer_admin_chats
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
    console.error('createCustomerAdminChat error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create customer-admin chat.',
      error: error.message,
    });
  }
}

async function sendCustomerAdminMessage(req, res) {
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

    if (isCustomer(req.user) && req.user.id === chat.customer_id) {
      senderRole = 'customer';
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
      INSERT INTO customer_admin_chat_messages (
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
      UPDATE customer_admin_chats
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
    console.error('sendCustomerAdminMessage error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to send message.',
      error: error.message,
    });
  }
}

async function getMyCustomerAdminChats(req, res) {
  try {
    if (!isCustomer(req.user) && !isAdmin(req.user)) {
      return res.status(403).json({
        ok: false,
        message: 'Unauthorized role.',
      });
    }

    let sql = `
      SELECT
        cac.id,
        cac.customer_id,
        cac.subject,
        cac.status,
        cac.last_message_at,
        cac.created_at,
        cac.updated_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM customer_admin_chats cac
      LEFT JOIN users u
        ON u.id = cac.customer_id
      WHERE 1 = 1
    `;
    const params = [];

    if (isCustomer(req.user)) {
      sql += ` AND cac.customer_id = ? `;
      params.push(req.user.id);
    } else if (isAdmin(req.user)) {
      const customerId = toPositiveInt(req.query?.customer_id);
      if (customerId) {
        sql += ` AND cac.customer_id = ? `;
        params.push(customerId);
      }
    }

    sql += ` ORDER BY cac.last_message_at DESC, cac.id DESC `;

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      ok: true,
      chats: rows.map((row) => ({
        id: row.id,
        customer_id: row.customer_id,
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
      })),
    });
  } catch (error) {
    console.error('getMyCustomerAdminChats error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch chats.',
      error: error.message,
    });
  }
}

async function getCustomerAdminChatDetails(req, res) {
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
    const isViewingAdmin = isAdmin(req.user);

    if (!isOwnerCustomer && !isViewingAdmin) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to view this chat.',
      });
    }

    if (isOwnerCustomer) {
      await pool.query(
        `
        UPDATE customer_admin_chat_messages
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
        UPDATE customer_admin_chat_messages
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
    console.error('getCustomerAdminChatDetails error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch chat details.',
      error: error.message,
    });
  }
}

async function closeCustomerAdminChat(req, res) {
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
      (isCustomer(req.user) && req.user.id === chat.customer_id) || isAdmin(req.user);

    if (!canClose) {
      return res.status(403).json({
        ok: false,
        message: 'You are not allowed to close this chat.',
      });
    }

    await pool.query(
      `
      UPDATE customer_admin_chats
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
    console.error('closeCustomerAdminChat error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to close chat.',
      error: error.message,
    });
  }
}

module.exports = {
  createCustomerAdminChat,
  sendCustomerAdminMessage,
  getMyCustomerAdminChats,
  getCustomerAdminChatDetails,
  closeCustomerAdminChat,
};