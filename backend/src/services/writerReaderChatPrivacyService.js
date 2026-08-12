const pool = require('../config/db');

function toPositiveInt(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

async function getWriterMessageSettings(writerUserId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      writer_user_id,
      contact_policy,
      paid_members_direct
    FROM writer_message_settings
    WHERE writer_user_id = ?
    LIMIT 1
    `,
    [writerUserId]
  );

  if (!rows[0]) {
    return {
      writer_user_id: writerUserId,
      contact_policy: 'followers',
      paid_members_direct: true,
      is_default: true,
    };
  }

  return {
    writer_user_id: Number(rows[0].writer_user_id),
    contact_policy: rows[0].contact_policy,
    paid_members_direct: Boolean(rows[0].paid_members_direct),
    is_default: false,
  };
}

async function saveWriterMessageSettings(
  writerUserId,
  { contactPolicy, paidMembersDirect }
) {
  const allowedPolicies = [
    'everyone',
    'followers',
    'paid_members',
    'nobody',
  ];

  if (!allowedPolicies.includes(contactPolicy)) {
    throw new Error('Invalid Writer message contact policy.');
  }

  await pool.query(
    `
    INSERT INTO writer_message_settings (
      writer_user_id,
      contact_policy,
      paid_members_direct,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      contact_policy = VALUES(contact_policy),
      paid_members_direct = VALUES(paid_members_direct),
      updated_at = NOW()
    `,
    [
      writerUserId,
      contactPolicy,
      paidMembersDirect ? 1 : 0,
    ]
  );

  return getWriterMessageSettings(writerUserId);
}

async function getRelationship(readerUserId, writerUserId, connection = pool) {
  const [[followRow]] = await connection.query(
    `
    SELECT id
    FROM writer_follows
    WHERE reader_user_id = ?
      AND writer_user_id = ?
    LIMIT 1
    `,
    [readerUserId, writerUserId]
  );

  const [[membershipRow]] = await connection.query(
    `
    SELECT id
    FROM writer_memberships
    WHERE reader_user_id = ?
      AND writer_user_id = ?
      AND status = 'active'
      AND starts_at <= NOW()
      AND ends_at > NOW()
    ORDER BY ends_at DESC, id DESC
    LIMIT 1
    `,
    [readerUserId, writerUserId]
  );

  return {
    is_follower: Boolean(followRow),
    is_paid_member: Boolean(membershipRow),
  };
}

async function getMessageControls(readerUserId, writerUserId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      writer_muted,
      writer_blocked,
      reader_muted,
      reader_blocked
    FROM writer_reader_message_controls
    WHERE writer_user_id = ?
      AND reader_user_id = ?
    LIMIT 1
    `,
    [writerUserId, readerUserId]
  );

  const row = rows[0] || {};

  return {
    writer_muted: Boolean(row.writer_muted),
    writer_blocked: Boolean(row.writer_blocked),
    reader_muted: Boolean(row.reader_muted),
    reader_blocked: Boolean(row.reader_blocked),
  };
}

async function getReaderStartDecision(
  readerUserId,
  writerUserId,
  connection = pool
) {
  const [settings, relationship, controls] = await Promise.all([
    getWriterMessageSettings(writerUserId, connection),
    getRelationship(readerUserId, writerUserId, connection),
    getMessageControls(readerUserId, writerUserId, connection),
  ]);

  if (controls.writer_blocked || controls.reader_blocked) {
    return {
      allowed: false,
      reason: 'Messaging is blocked between these accounts.',
      request_status: null,
      settings,
      relationship,
      controls,
    };
  }

  let allowed = false;

  if (settings.contact_policy === 'everyone') {
    allowed = true;
  } else if (settings.contact_policy === 'followers') {
    allowed = relationship.is_follower || relationship.is_paid_member;
  } else if (settings.contact_policy === 'paid_members') {
    allowed = relationship.is_paid_member;
  } else if (settings.contact_policy === 'nobody') {
    allowed = false;
  }

  if (!allowed) {
    return {
      allowed: false,
      reason:
        settings.contact_policy === 'nobody'
          ? 'This Writer is not accepting new messages.'
          : settings.contact_policy === 'paid_members'
          ? 'Only active paid members can message this Writer.'
          : 'Follow this Writer before sending a message request.',
      request_status: null,
      settings,
      relationship,
      controls,
    };
  }

  const direct =
    relationship.is_paid_member &&
    settings.paid_members_direct;

  return {
    allowed: true,
    reason: null,
    request_status: direct ? 'accepted' : 'pending',
    settings,
    relationship,
    controls,
  };
}

async function ensureMessageRateLimit(senderUserId, connection = pool) {
  const [[row]] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM customer_affiliate_chat_messages
    WHERE sender_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    `,
    [senderUserId]
  );

  if (Number(row?.total || 0) >= 10) {
    throw new Error('Message rate limit reached. Please wait before sending again.');
  }
}

async function setMessageControl({
  writerUserId,
  readerUserId,
  actorUserId,
  actorRole,
  action,
}) {
  const allowed = [
    'mute',
    'unmute',
    'block',
    'unblock',
  ];

  if (!allowed.includes(action)) {
    throw new Error('Invalid message control action.');
  }

  const controls = await getMessageControls(readerUserId, writerUserId);

  const next = {
    writer_muted: controls.writer_muted ? 1 : 0,
    writer_blocked: controls.writer_blocked ? 1 : 0,
    reader_muted: controls.reader_muted ? 1 : 0,
    reader_blocked: controls.reader_blocked ? 1 : 0,
  };

  const isWriter = actorRole === 'affiliate';

  if (action === 'mute') {
    if (isWriter) next.writer_muted = 1;
    else next.reader_muted = 1;
  } else if (action === 'unmute') {
    if (isWriter) next.writer_muted = 0;
    else next.reader_muted = 0;
  } else if (action === 'block') {
    if (isWriter) next.writer_blocked = 1;
    else next.reader_blocked = 1;
  } else if (action === 'unblock') {
    if (isWriter) next.writer_blocked = 0;
    else next.reader_blocked = 0;
  }

  await pool.query(
    `
    INSERT INTO writer_reader_message_controls (
      writer_user_id,
      reader_user_id,
      writer_muted,
      writer_blocked,
      reader_muted,
      reader_blocked,
      updated_by_user_id,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      writer_muted = VALUES(writer_muted),
      writer_blocked = VALUES(writer_blocked),
      reader_muted = VALUES(reader_muted),
      reader_blocked = VALUES(reader_blocked),
      updated_by_user_id = VALUES(updated_by_user_id),
      updated_at = NOW()
    `,
    [
      writerUserId,
      readerUserId,
      next.writer_muted,
      next.writer_blocked,
      next.reader_muted,
      next.reader_blocked,
      actorUserId,
    ]
  );

  return getMessageControls(readerUserId, writerUserId);
}

async function createChatReport({
  chatId,
  reporterUserId,
  reportedUserId,
  reason,
}) {
  const cleanReason = String(reason || '').trim().slice(0, 500);

  if (!cleanReason) {
    throw new Error('Report reason is required.');
  }

  const [result] = await pool.query(
    `
    INSERT INTO writer_reader_chat_reports (
      chat_id,
      reporter_user_id,
      reported_user_id,
      reason,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, 'open', NOW(), NOW())
    `,
    [chatId, reporterUserId, reportedUserId, cleanReason]
  );

  return result.insertId;
}

async function createMessageNotification({
  recipientUserId,
  actorUserId,
  type,
  title,
  message,
}) {
  await pool.query(
    `
    INSERT INTO user_notifications (
      recipient_user_id,
      actor_user_id,
      notification_type,
      title,
      message,
      is_read,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, 0, NOW())
    `,
    [
      recipientUserId,
      actorUserId,
      String(type).slice(0, 60),
      String(title).slice(0, 180),
      String(message).slice(0, 500),
    ]
  );
}

module.exports = {
  toPositiveInt,
  getWriterMessageSettings,
  saveWriterMessageSettings,
  getRelationship,
  getMessageControls,
  getReaderStartDecision,
  ensureMessageRateLimit,
  setMessageControl,
  createChatReport,
  createMessageNotification,
};