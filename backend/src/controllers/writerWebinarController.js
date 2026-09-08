const crypto = require('crypto');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const pool = require('../config/db');
const { getS3Client } = require('../config/s3Storage');
const {
  positiveInt,
  cleanText,
  normalizeWebinarType,
  normalizeVisibility,
  normalizeTimezone,
  isValidTimezone,
  parseScheduledDate,
  ensureOwnedWriterPage,
  getOwnedWebinar,
  getLatestWebinarMedia,
  getLatestWebinarSession,
  buildUniqueWebinarSlug,
  buildPlaybackUrl,
} = require('../services/webinarService');
const {
  getWebinarSubscriptionOverview,
  assertWebinarEntitlement,
} = require('../services/webinarUsageService');

function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);
  const safeStatus =
    Number.isInteger(status) && status >= 400 && status <= 599
      ? status
      : 500;

  return res.status(safeStatus).json({
    ok: false,
    code: error?.code || null,
    message: error?.message || fallback,
  });
}

function normalizeRegistrationMode(value, fallback = 'free') {
  const mode = cleanText(value, 20).toLowerCase();
  return ['free', 'paid'].includes(mode) ? mode : fallback;
}

function normalizeTicketPrice(value, registrationMode) {
  if (registrationMode === 'free') return '0.00';

  const raw = String(value ?? '').trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    return null;
  }

  const amount = Number(raw);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999) {
    return null;
  }

  return amount.toFixed(2);
}

function creatorState(webinar, media, session) {
  const mediaReady = media?.status === 'ready';
  const archived = webinar?.status === 'archived';
  const ended = webinar?.status === 'ended';
  const live = webinar?.status === 'live';

  let nextStep = 'complete_details';

  if (archived) nextStep = 'archived';
  else if (ended) nextStep = 'ended';
  else if (live) nextStep = 'live';
  else if (!media) nextStep = 'upload_video';
  else if (media.status === 'processing' || media.status === 'queued') {
    nextStep = 'processing_video';
  } else if (media.status === 'failed') {
    nextStep = 'retry_video';
  } else if (webinar?.status === 'scheduled') {
    nextStep = 'scheduled';
  } else if (mediaReady) {
    nextStep = 'publish';
  }

  return {
    next_step: nextStep,
    can_edit: !archived && !live,
    can_upload_video: !archived && !ended && !live,
    can_publish:
      !archived &&
      !ended &&
      !live &&
      webinar?.webinar_type !== 'live' &&
      mediaReady,
    can_return_to_draft:
      ['ready', 'scheduled', 'error'].includes(String(webinar?.status || '')),
    can_archive: !live && !archived,
    media_ready: mediaReady,
    session_status: session?.status || null,
  };
}

async function requireOwnedWebinar(req, res, next) {
  try {
    const webinar = await getOwnedWebinar(
      req.params?.webinarId,
      req.user.id
    );

    if (!webinar) {
      return res.status(404).json({
        ok: false,
        message: 'Writer webinar not found.',
      });
    }

    req.webinar = webinar;
    next();
  } catch (error) {
    console.error('requireOwnedWebinar error:', error);
    return sendError(res, error, 'Failed to validate Writer webinar.');
  }
}

async function requireWebinarUploadEntitlement(req, res, next) {
  try {
    req.webinarSubscriptionOverview = await assertWebinarEntitlement(
      req.user.id,
      'upload'
    );
    next();
  } catch (error) {
    return sendError(
      res,
      error,
      'An active webinar subscription with upload capacity is required.'
    );
  }
}

async function getCreatorCapabilities(req, res) {
  try {
    const overview = await getWebinarSubscriptionOverview(req.user.id);

    return res.status(200).json({
      ok: true,
      ...overview,
      creator: {
        supported_webinar_types: [
          'prerecorded',
          'evergreen',
          'hybrid',
          'live',
        ],
        publishable_webinar_types: [
          'prerecorded',
          'evergreen',
          'hybrid',
        ],
        live_broadcasting_available: false,
        accepted_video_mime: 'video/mp4',
      },
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to load webinar creator capabilities.'
    );
  }
}

async function listWriterWebinars(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        w.*,
        wp.name AS writer_page_name,
        wp.slug AS writer_page_slug,
        latest_media.id AS media_job_id,
        latest_media.status AS media_status,
        latest_media.hls_master_key,
        latest_media.error_message AS media_error,
        latest_session.id AS session_id,
        latest_session.status AS session_status,
        latest_session.session_type,
        latest_session.scheduled_start_at AS session_scheduled_start_at
      FROM webinars w
      INNER JOIN writer_pages wp
        ON wp.id = w.writer_page_id
      LEFT JOIN webinar_media_jobs latest_media
        ON latest_media.id = (
          SELECT wm.id
          FROM webinar_media_jobs wm
          WHERE wm.webinar_id = w.id
            AND wm.status <> 'superseded'
          ORDER BY wm.id DESC
          LIMIT 1
        )
      LEFT JOIN webinar_sessions latest_session
        ON latest_session.id = (
          SELECT ws.id
          FROM webinar_sessions ws
          WHERE ws.webinar_id = w.id
          ORDER BY ws.id DESC
          LIMIT 1
        )
      WHERE w.user_id = ?
      ORDER BY w.id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      webinars: rows.map((row) => ({
        ...row,
        playback_url:
          row.media_status === 'ready'
            ? buildPlaybackUrl(row.hls_master_key)
            : null,
        creator_state: creatorState(
          row,
          row.media_job_id
            ? { status: row.media_status }
            : null,
          row.session_id
            ? { status: row.session_status }
            : null
        ),
      })),
    });
  } catch (error) {
    console.error('listWriterWebinars error:', error);
    return sendError(res, error, 'Failed to load Writer webinars.');
  }
}

async function createWriterWebinar(req, res) {
  try {
    await assertWebinarEntitlement(req.user.id, 'create');

    const writerPageId = positiveInt(req.body?.writer_page_id);
    const title = cleanText(req.body?.title, 255);
    const description = cleanText(req.body?.description, 10000) || null;
    const webinarType = normalizeWebinarType(req.body?.webinar_type);
    const visibility = normalizeVisibility(req.body?.visibility);
    const timezone = normalizeTimezone(req.body?.timezone);
    const scheduledStartAt = parseScheduledDate(req.body?.scheduled_start_at);
    const registrationMode = normalizeRegistrationMode(
      req.body?.registration_mode,
      'free'
    );
    const ticketPriceUsd = normalizeTicketPrice(
      req.body?.ticket_price_usd,
      registrationMode
    );

    if (!writerPageId || !title) {
      return res.status(400).json({
        ok: false,
        message: 'Writer Page and webinar title are required.',
      });
    }

    if (!isValidTimezone(timezone)) {
      return res.status(400).json({
        ok: false,
        message: 'A valid IANA timezone is required.',
      });
    }

    if (scheduledStartAt === false) {
      return res.status(400).json({
        ok: false,
        message: 'scheduled_start_at must be a valid date and time.',
      });
    }

    if (ticketPriceUsd === null) {
      return res.status(400).json({
        ok: false,
        message: 'Paid webinars require a valid positive ticket_price_usd.',
      });
    }

    const writerPage = await ensureOwnedWriterPage(
      writerPageId,
      req.user.id
    );

    if (!writerPage) {
      return res.status(404).json({
        ok: false,
        message: 'Active Writer Page not found.',
      });
    }

    const slug = await buildUniqueWebinarSlug(title, req.user.id);

    const [result] = await pool.query(
      `
      INSERT INTO webinars (
        user_id,
        writer_page_id,
        title,
        slug,
        description,
        webinar_type,
        visibility,
        status,
        timezone,
        scheduled_start_at,
        allow_registration,
        allow_chat,
        registration_mode,
        ticket_price_usd,
        ticket_currency_code,
        published_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, 1, 1, ?, ?, 'USD', NULL, NOW(), NOW())
      `,
      [
        req.user.id,
        writerPageId,
        title,
        slug,
        description,
        webinarType,
        visibility,
        timezone,
        scheduledStartAt,
        registrationMode,
        ticketPriceUsd,
      ]
    );

    return res.status(201).json({
      ok: true,
      message: 'Webinar draft created.',
      webinar_id: result.insertId,
      slug,
      status: 'draft',
    });
  } catch (error) {
    console.error('createWriterWebinar error:', error);
    return sendError(res, error, 'Failed to create Writer webinar.');
  }
}

async function getWriterWebinar(req, res) {
  try {
    const webinar = req.webinar;
    const latestMedia = await getLatestWebinarMedia(webinar.id);
    const latestSession = await getLatestWebinarSession(webinar.id);

    const [[stats]] = await pool.query(
      `
      SELECT
        (
          SELECT COUNT(*)
          FROM webinar_registrations wr
          WHERE wr.webinar_id = ?
        ) AS total_registrations,
        (
          SELECT COUNT(DISTINCT COALESCE(
            CAST(wa.registration_id AS CHAR),
            CONCAT('u:', CAST(wa.user_id AS CHAR)),
            CONCAT('v:', wa.visitor_token)
          ))
          FROM webinar_attendance wa
          WHERE wa.webinar_id = ?
        ) AS total_attendees
      `,
      [webinar.id, webinar.id]
    );

    return res.status(200).json({
      ok: true,
      webinar: {
        ...webinar,
        media: latestMedia
          ? {
              ...latestMedia,
              playback_url:
                latestMedia.status === 'ready'
                  ? buildPlaybackUrl(latestMedia.hls_master_key)
                  : null,
            }
          : null,
        session: latestSession || null,
        creator_state: creatorState(
          webinar,
          latestMedia,
          latestSession
        ),
        stats: {
          total_registrations: Number(stats?.total_registrations || 0),
          total_attendees: Number(stats?.total_attendees || 0),
        },
      },
    });
  } catch (error) {
    console.error('getWriterWebinar error:', error);
    return sendError(res, error, 'Failed to load Writer webinar.');
  }
}

async function updateWriterWebinar(req, res) {
  try {
    const webinar = req.webinar;

    if (['archived', 'live'].includes(String(webinar.status))) {
      return res.status(409).json({
        ok: false,
        message: 'This webinar cannot be edited in its current state.',
      });
    }

    const title =
      req.body?.title === undefined
        ? webinar.title
        : cleanText(req.body.title, 255);

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: 'Webinar title is required.',
      });
    }

    let writerPageId = webinar.writer_page_id;

    if (req.body?.writer_page_id !== undefined) {
      writerPageId = positiveInt(req.body.writer_page_id);

      const writerPage = await ensureOwnedWriterPage(
        writerPageId,
        req.user.id
      );

      if (!writerPage) {
        return res.status(404).json({
          ok: false,
          message: 'Active Writer Page not found.',
        });
      }
    }

    const slug =
      title === webinar.title
        ? webinar.slug
        : await buildUniqueWebinarSlug(
            title,
            req.user.id,
            pool,
            webinar.id
          );

    const description =
      req.body?.description === undefined
        ? webinar.description
        : cleanText(req.body.description, 10000) || null;

    const webinarType =
      req.body?.webinar_type === undefined
        ? webinar.webinar_type
        : normalizeWebinarType(
            req.body.webinar_type,
            webinar.webinar_type
          );

    const visibility =
      req.body?.visibility === undefined
        ? webinar.visibility
        : normalizeVisibility(
            req.body.visibility,
            webinar.visibility
          );

    const timezone =
      req.body?.timezone === undefined
        ? webinar.timezone
        : normalizeTimezone(
            req.body.timezone,
            webinar.timezone
          );

    if (!isValidTimezone(timezone)) {
      return res.status(400).json({
        ok: false,
        message: 'A valid IANA timezone is required.',
      });
    }

    const parsedSchedule =
      req.body?.scheduled_start_at === undefined
        ? webinar.scheduled_start_at
        : parseScheduledDate(req.body.scheduled_start_at);

    if (parsedSchedule === false) {
      return res.status(400).json({
        ok: false,
        message: 'scheduled_start_at must be a valid date and time.',
      });
    }

    const registrationMode =
      req.body?.registration_mode === undefined
        ? normalizeRegistrationMode(webinar.registration_mode, 'free')
        : normalizeRegistrationMode(
            req.body.registration_mode,
            webinar.registration_mode
          );

    const ticketPriceUsd = normalizeTicketPrice(
      req.body?.ticket_price_usd === undefined
        ? webinar.ticket_price_usd
        : req.body.ticket_price_usd,
      registrationMode
    );

    if (ticketPriceUsd === null) {
      return res.status(400).json({
        ok: false,
        message: 'Paid webinars require a valid positive ticket_price_usd.',
      });
    }

    const pricingChanged =
      registrationMode !== String(webinar.registration_mode || 'free') ||
      Number(ticketPriceUsd) !== Number(webinar.ticket_price_usd || 0);

    if (pricingChanged) {
      const [[registrationCount]] = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM webinar_registrations
        WHERE webinar_id = ?
        `,
        [webinar.id]
      );

      if (Number(registrationCount?.total || 0) > 0) {
        return res.status(409).json({
          ok: false,
          code: 'WEBINAR_REGISTRATION_PRICING_LOCKED',
          message: 'Registration pricing cannot change after attendees have registered.',
        });
      }
    }

    const allowRegistration =
      req.body?.allow_registration === undefined
        ? Number(webinar.allow_registration) === 1
        : Boolean(req.body.allow_registration);

    const allowChat =
      req.body?.allow_chat === undefined
        ? Number(webinar.allow_chat) === 1
        : Boolean(req.body.allow_chat);

    await pool.query(
      `
      UPDATE webinars
      SET
        writer_page_id = ?,
        title = ?,
        slug = ?,
        description = ?,
        webinar_type = ?,
        visibility = ?,
        timezone = ?,
        scheduled_start_at = ?,
        allow_registration = ?,
        allow_chat = ?,
        registration_mode = ?,
        ticket_price_usd = ?,
        ticket_currency_code = 'USD',
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        writerPageId,
        title,
        slug,
        description,
        webinarType,
        visibility,
        timezone,
        parsedSchedule,
        allowRegistration ? 1 : 0,
        allowChat ? 1 : 0,
        registrationMode,
        ticketPriceUsd,
        webinar.id,
        req.user.id,
      ]
    );

    return res.status(200).json({
      ok: true,
      message: 'Webinar updated.',
      slug,
    });
  } catch (error) {
    console.error('updateWriterWebinar error:', error);
    return sendError(res, error, 'Failed to update Writer webinar.');
  }
}

async function queueWebinarVideo(req, res) {
  const connection = await pool.getConnection();

  try {
    if (!req.file) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: 'MP4 webinar video is required.',
      });
    }

    const overview =
      req.webinarSubscriptionOverview ||
      (await assertWebinarEntitlement(req.user.id, 'upload'));

    const remainingStorage =
      overview?.usage?.remaining?.storage_bytes;

    if (
      remainingStorage !== null &&
      remainingStorage !== undefined &&
      Number(req.file.size || 0) > Number(remainingStorage)
    ) {
      connection.release();

      try {
        await getS3Client().send(
          new DeleteObjectCommand({
            Bucket: req.file.bucket,
            Key: req.file.key,
          })
        );
      } catch {}

      return res.status(413).json({
        ok: false,
        code: 'WEBINAR_STORAGE_LIMIT_EXCEEDED',
        message: 'This video exceeds the remaining webinar storage allowance.',
      });
    }

    await connection.beginTransaction();

    const webinar = await getOwnedWebinar(
      req.webinar.id,
      req.user.id,
      connection
    );

    if (!webinar) {
      throw new Error('Writer webinar not found after upload.');
    }

    if (['archived', 'ended', 'live'].includes(String(webinar.status))) {
      const error = new Error(
        'A video cannot be uploaded to this webinar in its current state.'
      );
      error.status = 409;
      throw error;
    }

    await connection.query(
      `
      UPDATE webinar_media_jobs
      SET
        status = 'superseded',
        updated_at = NOW()
      WHERE webinar_id = ?
        AND status IN ('queued', 'failed')
      `,
      [webinar.id]
    );

    const [result] = await connection.query(
      `
      INSERT INTO webinar_media_jobs (
        webinar_id,
        source_bucket,
        source_key,
        source_filename,
        source_mime,
        source_size_bytes,
        status,
        attempts,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, NOW(), NOW())
      `,
      [
        webinar.id,
        req.file.bucket,
        req.file.key,
        cleanText(req.file.originalname, 255),
        cleanText(req.file.mimetype, 100) || 'video/mp4',
        Number(req.file.size || 0),
      ]
    );

    await connection.query(
      `
      UPDATE webinars
      SET
        status = 'processing',
        updated_at = NOW()
      WHERE id = ?
      `,
      [webinar.id]
    );

    await connection.commit();
    connection.release();

    return res.status(202).json({
      ok: true,
      message: 'Webinar video uploaded and queued for HLS processing.',
      media_job_id: result.insertId,
      status: 'queued',
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    connection.release();

    if (req.file?.bucket && req.file?.key) {
      try {
        await getS3Client().send(
          new DeleteObjectCommand({
            Bucket: req.file.bucket,
            Key: req.file.key,
          })
        );
      } catch (cleanupError) {
        console.error(
          'queueWebinarVideo source cleanup error:',
          cleanupError.message
        );
      }
    }

    console.error('queueWebinarVideo error:', error);
    return sendError(res, error, 'Failed to queue webinar video.');
  }
}

async function retryWebinarMedia(req, res) {
  try {
    await assertWebinarEntitlement(req.user.id, 'upload');

    const mediaJobId = positiveInt(req.params?.mediaJobId);

    if (!mediaJobId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid media job ID is required.',
      });
    }

    if (['archived', 'ended', 'live'].includes(String(req.webinar.status))) {
      return res.status(409).json({
        ok: false,
        message: 'Media cannot be retried for this webinar state.',
      });
    }

    const [result] = await pool.query(
      `
      UPDATE webinar_media_jobs
      SET
        status = 'queued',
        attempts = 0,
        claimed_at = NULL,
        error_message = NULL,
        updated_at = NOW()
      WHERE id = ?
        AND webinar_id = ?
        AND status = 'failed'
      `,
      [mediaJobId, req.webinar.id]
    );

    if (!result.affectedRows) {
      return res.status(409).json({
        ok: false,
        message: 'Only a failed media job can be retried.',
      });
    }

    await pool.query(
      `
      UPDATE webinars
      SET
        status = 'processing',
        updated_at = NOW()
      WHERE id = ?
      `,
      [req.webinar.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Webinar media job queued for retry.',
    });
  } catch (error) {
    console.error('retryWebinarMedia error:', error);
    return sendError(res, error, 'Failed to retry webinar media.');
  }
}

async function publishWriterWebinar(req, res) {
  const connection = await pool.getConnection();

  try {
    await assertWebinarEntitlement(req.user.id, 'stream');

    await connection.beginTransaction();

    const webinar = await getOwnedWebinar(
      req.webinar.id,
      req.user.id,
      connection
    );

    if (!webinar) {
      const error = new Error('Writer webinar not found.');
      error.status = 404;
      throw error;
    }

    if (String(webinar.status) === 'archived') {
      const error = new Error('Archived webinars cannot be published.');
      error.status = 409;
      throw error;
    }

    if (String(webinar.webinar_type) === 'live') {
      const error = new Error(
        'True live broadcasting is not available in the current webinar runtime.'
      );
      error.status = 409;
      error.code = 'WEBINAR_LIVE_INGEST_NOT_AVAILABLE';
      throw error;
    }

    const media = await getLatestWebinarMedia(webinar.id, connection);

    if (!media || String(media.status) !== 'ready') {
      const error = new Error(
        'A successfully processed webinar video is required before publishing.'
      );
      error.status = 409;
      error.code = 'WEBINAR_MEDIA_NOT_READY';
      throw error;
    }

    const requestedSchedule =
      req.body?.scheduled_start_at === undefined
        ? parseScheduledDate(webinar.scheduled_start_at)
        : parseScheduledDate(req.body.scheduled_start_at);

    if (requestedSchedule === false) {
      const error = new Error(
        'scheduled_start_at must be a valid date and time.'
      );
      error.status = 400;
      throw error;
    }

    const isEvergreen = String(webinar.webinar_type) === 'evergreen';
    const hasSchedule = requestedSchedule instanceof Date;

    if (
      hasSchedule &&
      requestedSchedule.getTime() <= Date.now() + 60 * 1000
    ) {
      const error = new Error(
        'Scheduled webinar start must be more than one minute in the future.'
      );
      error.status = 400;
      throw error;
    }

    await connection.query(
      `
      UPDATE webinar_sessions
      SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE webinar_id = ?
        AND status = 'scheduled'
      `,
      [webinar.id]
    );

    let sessionId = null;
    let sessionKey = null;
    let nextStatus = 'ready';

    if (!isEvergreen && hasSchedule) {
      sessionKey = crypto.randomBytes(24).toString('hex');

      const [sessionResult] = await connection.query(
        `
        INSERT INTO webinar_sessions (
          webinar_id,
          session_key,
          session_type,
          status,
          scheduled_start_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, 'scheduled', 'scheduled', ?, NOW(), NOW())
        `,
        [webinar.id, sessionKey, requestedSchedule]
      );

      sessionId = Number(sessionResult.insertId);
      nextStatus = 'scheduled';
    }

    await connection.query(
      `
      UPDATE webinars
      SET
        status = ?,
        scheduled_start_at = ?,
        published_at = COALESCE(published_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        nextStatus,
        isEvergreen ? null : requestedSchedule,
        webinar.id,
        req.user.id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      message:
        nextStatus === 'scheduled'
          ? 'Webinar scheduled.'
          : 'Webinar published and ready.',
      status: nextStatus,
      session_id: sessionId,
      session_key: sessionKey,
      scheduled_start_at:
        isEvergreen ? null : requestedSchedule,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error('publishWriterWebinar error:', error);
    return sendError(res, error, 'Failed to publish webinar.');
  } finally {
    connection.release();
  }
}

async function returnWriterWebinarToDraft(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const webinar = await getOwnedWebinar(
      req.webinar.id,
      req.user.id,
      connection
    );

    if (!webinar) {
      const error = new Error('Writer webinar not found.');
      error.status = 404;
      throw error;
    }

    if (['live', 'ended', 'archived'].includes(String(webinar.status))) {
      const error = new Error(
        'This webinar cannot be returned to draft in its current state.'
      );
      error.status = 409;
      throw error;
    }

    await connection.query(
      `
      UPDATE webinar_sessions
      SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE webinar_id = ?
        AND status = 'scheduled'
      `,
      [webinar.id]
    );

    await connection.query(
      `
      UPDATE webinars
      SET
        status = 'draft',
        published_at = NULL,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [webinar.id, req.user.id]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      message: 'Webinar returned to draft.',
      status: 'draft',
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error('returnWriterWebinarToDraft error:', error);
    return sendError(res, error, 'Failed to return webinar to draft.');
  } finally {
    connection.release();
  }
}

async function archiveWriterWebinar(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const webinar = await getOwnedWebinar(
      req.webinar.id,
      req.user.id,
      connection
    );

    if (!webinar) {
      const error = new Error('Writer webinar not found.');
      error.status = 404;
      throw error;
    }

    if (String(webinar.status) === 'live') {
      const error = new Error('A live webinar cannot be archived.');
      error.status = 409;
      throw error;
    }

    await connection.query(
      `
      UPDATE webinar_sessions
      SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE webinar_id = ?
        AND status = 'scheduled'
      `,
      [webinar.id]
    );

    await connection.query(
      `
      UPDATE webinars
      SET
        status = 'archived',
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [webinar.id, req.user.id]
    );

    await connection.commit();

    return res.status(200).json({
      ok: true,
      message: 'Webinar archived.',
      status: 'archived',
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error('archiveWriterWebinar error:', error);
    return sendError(res, error, 'Failed to archive webinar.');
  } finally {
    connection.release();
  }
}

async function listWriterWebinarRegistrations(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        wr.id,
        wr.session_id,
        wr.user_id,
        wr.attendee_name,
        wr.attendee_email,
        wr.source,
        wr.registration_token,
        wr.status,
        wr.payment_status,
        wr.confirmed_at,
        wr.registered_at,
        wr.created_at,
        p.provider,
        p.expected_amount_usd,
        p.currency_code,
        p.status AS purchase_status,
        p.paid_at
      FROM webinar_registrations wr
      LEFT JOIN webinar_registration_purchases p
        ON p.id = (
          SELECT p2.id
          FROM webinar_registration_purchases p2
          WHERE p2.registration_id = wr.id
          ORDER BY p2.id DESC
          LIMIT 1
        )
      WHERE wr.webinar_id = ?
      ORDER BY wr.id DESC
      `,
      [req.webinar.id]
    );

    const [[summary]] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_registrations,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_registrations,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_registrations,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pending_payments
      FROM webinar_registrations
      WHERE webinar_id = ?
      `,
      [req.webinar.id]
    );

    const [[revenue]] = await pool.query(
      `
      SELECT COALESCE(SUM(expected_amount_usd), 0) AS gross_paid_usd
      FROM webinar_registration_purchases
      WHERE webinar_id = ?
        AND status = 'paid'
      `,
      [req.webinar.id]
    );

    return res.status(200).json({
      ok: true,
      summary: {
        total_registrations: Number(summary?.total_registrations || 0),
        confirmed_registrations: Number(summary?.confirmed_registrations || 0),
        paid_registrations: Number(summary?.paid_registrations || 0),
        pending_payments: Number(summary?.pending_payments || 0),
        gross_paid_usd: Number(revenue?.gross_paid_usd || 0).toFixed(2),
      },
      registrations: rows,
    });
  } catch (error) {
    console.error('listWriterWebinarRegistrations error:', error);
    return sendError(res, error, 'Failed to load webinar registrations.');
  }
}

function buildSourceFilename(req, file) {
  const original = cleanText(file.originalname, 255);
  const extension = original.toLowerCase().endsWith('.mp4')
    ? '.mp4'
    : '.mp4';

  return `${Date.now()}-${crypto.randomUUID()}${extension}`;
}

module.exports = {
  requireOwnedWebinar,
  requireWebinarUploadEntitlement,
  getCreatorCapabilities,
  listWriterWebinars,
  createWriterWebinar,
  getWriterWebinar,
  updateWriterWebinar,
  queueWebinarVideo,
  retryWebinarMedia,
  publishWriterWebinar,
  returnWriterWebinarToDraft,
  archiveWriterWebinar,
  listWriterWebinarRegistrations,
  buildSourceFilename,
};
