const pool = require('../../config/db');

async function ensureNotificationTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      category VARCHAR(60) NOT NULL DEFAULT 'update',
      priority ENUM('normal', 'important', 'urgent') NOT NULL DEFAULT 'normal',
      status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
      created_by BIGINT UNSIGNED NULL,
      published_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_admin_notifications_status (status),
      INDEX idx_admin_notifications_created_at (created_at),
      INDEX idx_admin_notifications_priority (priority)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS affiliate_notification_reads (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      notification_id BIGINT UNSIGNED NOT NULL,
      affiliate_id BIGINT UNSIGNED NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 1,
      read_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_affiliate_notification (notification_id, affiliate_id),
      INDEX idx_affiliate_notification_reads_affiliate (affiliate_id),
      INDEX idx_affiliate_notification_reads_notification (notification_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function cleanText(value) {
  return String(value || '').trim();
}

async function getAdminNotifications(req, res, next) {
  try {
    await ensureNotificationTables();

    const [rows] = await pool.query(`
      SELECT
        n.id,
        n.title,
        n.message,
        n.category,
        n.priority,
        n.status,
        n.created_by,
        n.published_at,
        n.created_at,
        n.updated_at,
        COUNT(r.id) AS total_reads
      FROM admin_notifications n
      LEFT JOIN affiliate_notification_reads r
        ON r.notification_id = n.id
        AND r.is_read = 1
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `);

    return res.status(200).json({
      ok: true,
      notifications: rows,
    });
  } catch (error) {
    next(error);
  }
}

async function createAdminNotification(req, res, next) {
  try {
    await ensureNotificationTables();

    const title = cleanText(req.body.title);
    const message = cleanText(req.body.message);
    const category = cleanText(req.body.category) || 'update';
    const priority = cleanText(req.body.priority) || 'normal';
    const status = cleanText(req.body.status) || 'published';

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: 'Notification title is required.',
      });
    }

    if (!message) {
      return res.status(400).json({
        ok: false,
        message: 'Notification message is required.',
      });
    }

    const allowedPriorities = ['normal', 'important', 'urgent'];
    const allowedStatuses = ['draft', 'published'];

    const safePriority = allowedPriorities.includes(priority) ? priority : 'normal';
    const safeStatus = allowedStatuses.includes(status) ? status : 'published';

    const publishedAt = safeStatus === 'published' ? new Date() : null;
    const createdBy = req.user?.id || null;

    const [result] = await pool.query(
      `
        INSERT INTO admin_notifications
          (title, message, category, priority, status, created_by, published_at)
        VALUES
          (:title, :message, :category, :priority, :status, :created_by, :published_at)
      `,
      {
        title,
        message,
        category,
        priority: safePriority,
        status: safeStatus,
        created_by: createdBy,
        published_at: publishedAt,
      }
    );

    const [rows] = await pool.query(
      `
        SELECT *
        FROM admin_notifications
        WHERE id = :id
        LIMIT 1
      `,
      { id: result.insertId }
    );

    return res.status(201).json({
      ok: true,
      message: 'Notification created successfully.',
      notification: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminNotification(req, res, next) {
  try {
    await ensureNotificationTables();

    const notificationId = Number(req.params.id);

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid notification ID is required.',
      });
    }

    const title = cleanText(req.body.title);
    const message = cleanText(req.body.message);
    const category = cleanText(req.body.category) || 'update';
    const priority = cleanText(req.body.priority) || 'normal';
    const status = cleanText(req.body.status) || 'published';

    if (!title || !message) {
      return res.status(400).json({
        ok: false,
        message: 'Title and message are required.',
      });
    }

    const allowedPriorities = ['normal', 'important', 'urgent'];
    const allowedStatuses = ['draft', 'published'];

    const safePriority = allowedPriorities.includes(priority) ? priority : 'normal';
    const safeStatus = allowedStatuses.includes(status) ? status : 'published';

    const [existingRows] = await pool.query(
      `
        SELECT id, status, published_at
        FROM admin_notifications
        WHERE id = :id
        LIMIT 1
      `,
      { id: notificationId }
    );

    if (!existingRows.length) {
      return res.status(404).json({
        ok: false,
        message: 'Notification not found.',
      });
    }

    const existing = existingRows[0];

    const publishedAt =
      safeStatus === 'published' && !existing.published_at
        ? new Date()
        : existing.published_at;

    await pool.query(
      `
        UPDATE admin_notifications
        SET
          title = :title,
          message = :message,
          category = :category,
          priority = :priority,
          status = :status,
          published_at = :published_at
        WHERE id = :id
      `,
      {
        id: notificationId,
        title,
        message,
        category,
        priority: safePriority,
        status: safeStatus,
        published_at: publishedAt,
      }
    );

    const [rows] = await pool.query(
      `
        SELECT *
        FROM admin_notifications
        WHERE id = :id
        LIMIT 1
      `,
      { id: notificationId }
    );

    return res.status(200).json({
      ok: true,
      message: 'Notification updated successfully.',
      notification: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdminNotification(req, res, next) {
  try {
    await ensureNotificationTables();

    const notificationId = Number(req.params.id);

    if (!notificationId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid notification ID is required.',
      });
    }

    await pool.query(
      `
        DELETE FROM affiliate_notification_reads
        WHERE notification_id = :id
      `,
      { id: notificationId }
    );

    const [result] = await pool.query(
      `
        DELETE FROM admin_notifications
        WHERE id = :id
      `,
      { id: notificationId }
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        ok: false,
        message: 'Notification not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ensureNotificationTables,
  getAdminNotifications,
  createAdminNotification,
  updateAdminNotification,
  deleteAdminNotification,
};