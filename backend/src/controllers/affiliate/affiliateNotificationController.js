const pool = require('../../config/db');
const {
  ensureNotificationTables,
} = require('../admin/adminNotificationController');

function getAffiliateId(req) {
  return req.user?.id || req.user?.user_id || null;
}

async function getAffiliateNotifications(req, res, next) {
  try {
    await ensureNotificationTables();

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
          n.id,
          n.title,
          n.message,
          n.category,
          n.priority,
          n.status,
          n.published_at,
          n.created_at,
          n.updated_at,
          CASE
            WHEN r.id IS NULL THEN 0
            ELSE r.is_read
          END AS is_read,
          r.read_at
        FROM admin_notifications n
        LEFT JOIN affiliate_notification_reads r
          ON r.notification_id = n.id
          AND r.affiliate_id = :affiliate_id
        WHERE n.status = 'published'
        ORDER BY
          CASE
            WHEN r.id IS NULL OR r.is_read = 0 THEN 0
            ELSE 1
          END ASC,
          n.created_at DESC
      `,
      {
        affiliate_id: affiliateId,
      }
    );

    const unreadCount = rows.filter((item) => Number(item.is_read) !== 1).length;

    return res.status(200).json({
      ok: true,
      unread_count: unreadCount,
      notifications: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function markAffiliateNotificationRead(req, res, next) {
  try {
    await ensureNotificationTables();

    const affiliateId = getAffiliateId(req);
    const notificationId = Number(req.params.id);

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid notification ID is required.',
      });
    }

    const [notificationRows] = await pool.query(
      `
        SELECT id
        FROM admin_notifications
        WHERE id = :id
          AND status = 'published'
        LIMIT 1
      `,
      {
        id: notificationId,
      }
    );

    if (!notificationRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Notification not found.',
      });
    }

    await pool.query(
      `
        INSERT INTO affiliate_notification_reads
          (notification_id, affiliate_id, is_read, read_at)
        VALUES
          (:notification_id, :affiliate_id, 1, NOW())
        ON DUPLICATE KEY UPDATE
          is_read = 1,
          read_at = NOW(),
          updated_at = CURRENT_TIMESTAMP
      `,
      {
        notification_id: notificationId,
        affiliate_id: affiliateId,
      }
    );

    return res.status(200).json({
      ok: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

async function markAffiliateNotificationUnread(req, res, next) {
  try {
    await ensureNotificationTables();

    const affiliateId = getAffiliateId(req);
    const notificationId = Number(req.params.id);

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid notification ID is required.',
      });
    }

    const [notificationRows] = await pool.query(
      `
        SELECT id
        FROM admin_notifications
        WHERE id = :id
          AND status = 'published'
        LIMIT 1
      `,
      {
        id: notificationId,
      }
    );

    if (!notificationRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Notification not found.',
      });
    }

    await pool.query(
      `
        INSERT INTO affiliate_notification_reads
          (notification_id, affiliate_id, is_read, read_at)
        VALUES
          (:notification_id, :affiliate_id, 0, NULL)
        ON DUPLICATE KEY UPDATE
          is_read = 0,
          read_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      `,
      {
        notification_id: notificationId,
        affiliate_id: affiliateId,
      }
    );

    return res.status(200).json({
      ok: true,
      message: 'Notification marked as unread.',
    });
  } catch (error) {
    next(error);
  }
}

async function markAllAffiliateNotificationsRead(req, res, next) {
  try {
    await ensureNotificationTables();

    const affiliateId = getAffiliateId(req);

    if (!affiliateId) {
      return res.status(401).json({
        ok: false,
        message: 'Affiliate account not found.',
      });
    }

    const [notifications] = await pool.query(`
      SELECT id
      FROM admin_notifications
      WHERE status = 'published'
    `);

    if (!notifications.length) {
      return res.status(200).json({
        ok: true,
        message: 'No notifications to mark as read.',
      });
    }

    const values = notifications.map((item) => [
      item.id,
      affiliateId,
      1,
    ]);

    await pool.query(
      `
        INSERT INTO affiliate_notification_reads
          (notification_id, affiliate_id, is_read, read_at)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          is_read = 1,
          read_at = NOW(),
          updated_at = CURRENT_TIMESTAMP
      `,
      [values.map((item) => [...item, new Date()])]
    );

    return res.status(200).json({
      ok: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAffiliateNotifications,
  markAffiliateNotificationRead,
  markAffiliateNotificationUnread,
  markAllAffiliateNotificationsRead,
};