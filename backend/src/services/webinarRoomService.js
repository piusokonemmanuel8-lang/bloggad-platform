const crypto = require('crypto');
const pool = require('../config/db');
const {
  cleanText,
  loadRegistrationByToken,
} = require('./webinarRegistrationService');
const {
  getLatestWebinarMedia,
  buildPlaybackUrl,
} = require('./webinarService');
const {
  getCurrentWebinarSubscription,
} = require('./webinarSubscriptionService');
const {
  ensureUsagePeriod,
  getWebinarSubscriptionOverview,
  consumeWebinarPlaybackSeconds,
} = require('./webinarUsageService');

function positiveInt(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function roomError(message, status = 400, code = null) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function safeJson(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function sanitizeEvent(row) {
  return {
    id: Number(row.id),
    event_type: row.event_type,
    entity_id: row.entity_id ? Number(row.entity_id) : null,
    payload: safeJson(row.payload_json, {}),
    created_at: row.created_at,
  };
}

function sanitizeChatMessage(row) {
  return {
    id: Number(row.id),
    sender_type: row.sender_type,
    sender_name: row.sender_name,
    message_body: row.message_body,
    status: row.status,
    sent_at: row.sent_at,
  };
}

function roomTimer(row) {
  const duration = Number(row.duration_seconds || 0);
  const elapsed = Math.max(0, Number(row.elapsed_seconds || 0));
  const startsIn = Math.max(0, Number(row.starts_in_seconds || 0));
  const open = row.session_status === 'open';
  const ended = row.session_status === 'ended';

  return {
    state: ended ? 'ended' : open ? 'running' : 'waiting',
    duration_seconds: duration || null,
    elapsed_seconds: open || ended ? Math.min(elapsed, duration || elapsed) : 0,
    remaining_seconds:
      duration > 0
        ? ended
          ? 0
          : open
          ? Math.max(0, duration - elapsed)
          : duration
        : null,
    starts_in_seconds: row.session_status === 'scheduled' ? startsIn : 0,
    playback_position_seconds:
      open && duration > 0 ? Math.min(elapsed, duration) : open ? elapsed : 0,
    sync_mode: 'session_clock',
  };
}

async function appendRoomEvent(
  connection,
  webinarId,
  sessionId,
  eventType,
  entityId = null,
  payload = null
) {
  const [result] = await connection.query(
    `
    INSERT INTO webinar_room_events (
      webinar_id,
      session_id,
      event_type,
      entity_id,
      payload_json,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, NOW())
    `,
    [
      webinarId,
      sessionId,
      cleanText(eventType, 60),
      entityId || null,
      payload ? JSON.stringify(payload) : null,
    ]
  );

  return Number(result.insertId);
}

async function loadSessionRoomRow(webinarId, sessionId, connection = pool) {
  const cleanWebinarId = positiveInt(webinarId);
  const cleanSessionId = positiveInt(sessionId);

  if (!cleanWebinarId || !cleanSessionId) return null;

  const [[row]] = await connection.query(
    `
    SELECT
      w.id AS webinar_id,
      w.user_id AS writer_user_id,
      w.writer_page_id,
      w.title,
      w.slug,
      w.webinar_type,
      w.status AS webinar_status,
      w.visibility,
      w.allow_chat,
      w.duration_seconds,
      w.published_at,
      wp.name AS writer_page_name,
      wp.slug AS writer_page_slug,
      ws.id AS session_id,
      ws.session_key,
      ws.session_type,
      ws.status AS session_status,
      ws.scheduled_start_at,
      ws.started_at,
      ws.ended_at,
      GREATEST(
        0,
        TIMESTAMPDIFF(
          SECOND,
          COALESCE(ws.started_at, ws.scheduled_start_at, NOW()),
          NOW()
        )
      ) AS elapsed_seconds,
      GREATEST(
        0,
        TIMESTAMPDIFF(SECOND, NOW(), COALESCE(ws.scheduled_start_at, NOW()))
      ) AS starts_in_seconds
    FROM webinar_sessions ws
    INNER JOIN webinars w
      ON w.id = ws.webinar_id
    INNER JOIN writer_pages wp
      ON wp.id = w.writer_page_id
    WHERE w.id = ?
      AND ws.id = ?
    LIMIT 1
    `,
    [cleanWebinarId, cleanSessionId]
  );

  return row || null;
}

async function loadAttendanceByVisitorToken(visitorToken, connection = pool) {
  const token = cleanText(visitorToken, 64);

  if (!token) return null;

  const [[row]] = await connection.query(
    `
    SELECT
      wa.*,
      wr.attendee_name,
      wr.attendee_email,
      wr.status AS registration_status,
      wr.payment_status,
      wr.registration_token,
      w.user_id AS writer_user_id,
      w.writer_page_id,
      w.title,
      w.slug,
      w.webinar_type,
      w.status AS webinar_status,
      w.visibility,
      w.allow_chat,
      w.duration_seconds,
      w.published_at,
      wp.name AS writer_page_name,
      wp.slug AS writer_page_slug,
      ws.session_key,
      ws.session_type,
      ws.status AS session_status,
      ws.scheduled_start_at,
      ws.started_at,
      ws.ended_at,
      GREATEST(
        0,
        TIMESTAMPDIFF(
          SECOND,
          COALESCE(ws.started_at, ws.scheduled_start_at, NOW()),
          NOW()
        )
      ) AS elapsed_seconds,
      GREATEST(
        0,
        TIMESTAMPDIFF(SECOND, NOW(), COALESCE(ws.scheduled_start_at, NOW()))
      ) AS starts_in_seconds
    FROM webinar_attendance wa
    INNER JOIN webinar_registrations wr
      ON wr.id = wa.registration_id
    INNER JOIN webinars w
      ON w.id = wa.webinar_id
    INNER JOIN writer_pages wp
      ON wp.id = w.writer_page_id
    INNER JOIN webinar_sessions ws
      ON ws.id = wa.session_id
    WHERE wa.visitor_token = ?
    LIMIT 1
    `,
    [token]
  );

  return row || null;
}

async function maybeAutoOpenScheduledSession(sessionId, connection = pool) {
  const cleanSessionId = positiveInt(sessionId);

  if (!cleanSessionId) return false;

  const [result] = await connection.query(
    `
    UPDATE webinar_sessions
    SET
      status = 'open',
      started_at = COALESCE(started_at, scheduled_start_at, NOW()),
      updated_at = NOW()
    WHERE id = ?
      AND status = 'scheduled'
      AND scheduled_start_at IS NOT NULL
      AND scheduled_start_at <= NOW()
    `,
    [cleanSessionId]
  );

  if (!result.affectedRows) return false;

  const [[session]] = await connection.query(
    `
    SELECT webinar_id
    FROM webinar_sessions
    WHERE id = ?
    LIMIT 1
    `,
    [cleanSessionId]
  );

  if (!session) return false;

  await connection.query(
    `
    UPDATE webinars
    SET
      status = 'live',
      updated_at = NOW()
    WHERE id = ?
      AND status IN ('ready','scheduled')
    `,
    [session.webinar_id]
  );

  await appendRoomEvent(
    connection,
    session.webinar_id,
    cleanSessionId,
    'session.opened',
    cleanSessionId,
    { automatic: true }
  );

  return true;
}

async function maybeAutoEndSession(sessionId, connection = pool) {
  const cleanSessionId = positiveInt(sessionId);

  if (!cleanSessionId) return false;

  const [[room]] = await connection.query(
    `
    SELECT
      ws.id,
      ws.webinar_id,
      ws.status,
      ws.started_at,
      w.webinar_type,
      w.duration_seconds,
      GREATEST(
        0,
        TIMESTAMPDIFF(SECOND, COALESCE(ws.started_at, NOW()), NOW())
      ) AS elapsed_seconds
    FROM webinar_sessions ws
    INNER JOIN webinars w
      ON w.id = ws.webinar_id
    WHERE ws.id = ?
    LIMIT 1
    `,
    [cleanSessionId]
  );

  if (
    !room ||
    room.status !== 'open' ||
    !Number(room.duration_seconds || 0) ||
    Number(room.elapsed_seconds || 0) < Number(room.duration_seconds || 0)
  ) {
    return false;
  }

  const [result] = await connection.query(
    `
    UPDATE webinar_sessions
    SET
      status = 'ended',
      ended_at = COALESCE(ended_at, NOW()),
      updated_at = NOW()
    WHERE id = ?
      AND status = 'open'
    `,
    [cleanSessionId]
  );

  if (!result.affectedRows) return false;

  if (room.webinar_type !== 'evergreen') {
    await connection.query(
      `
      UPDATE webinars
      SET
        status = 'ended',
        updated_at = NOW()
      WHERE id = ?
        AND status = 'live'
      `,
      [room.webinar_id]
    );
  }

  await appendRoomEvent(
    connection,
    room.webinar_id,
    cleanSessionId,
    'session.ended',
    cleanSessionId,
    { automatic: true }
  );

  return true;
}

async function ensureRegistrationSession(registration, connection) {
  if (registration.session_id) {
    await maybeAutoOpenScheduledSession(registration.session_id, connection);

    const session = await loadSessionRoomRow(
      registration.webinar_id,
      registration.session_id,
      connection
    );

    if (session && session.session_status !== 'cancelled') return session;
  }

  await connection.query(
    `
    SELECT id
    FROM webinar_registrations
    WHERE id = ?
    FOR UPDATE
    `,
    [registration.id]
  );

  const [[latest]] = await connection.query(
    `
    SELECT id
    FROM webinar_sessions
    WHERE webinar_id = ?
      AND status IN ('open','scheduled')
    ORDER BY
      CASE WHEN status = 'open' THEN 0 ELSE 1 END,
      id DESC
    LIMIT 1
    `,
    [registration.webinar_id]
  );

  let sessionId = latest ? Number(latest.id) : null;

  if (!sessionId && registration.webinar_type === 'evergreen') {
    const sessionKey = crypto.randomBytes(24).toString('hex');
    const [result] = await connection.query(
      `
      INSERT INTO webinar_sessions (
        webinar_id,
        session_key,
        session_type,
        status,
        scheduled_start_at,
        started_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, 'evergreen', 'open', NULL, NOW(), NOW(), NOW())
      `,
      [registration.webinar_id, sessionKey]
    );

    sessionId = Number(result.insertId);

    await appendRoomEvent(
      connection,
      registration.webinar_id,
      sessionId,
      'session.opened',
      sessionId,
      { automatic: true, evergreen: true }
    );
  }

  if (!sessionId) {
    throw roomError(
      'The webinar room has not started yet.',
      409,
      'WEBINAR_ROOM_NOT_STARTED'
    );
  }

  await maybeAutoOpenScheduledSession(sessionId, connection);

  await connection.query(
    `
    UPDATE webinar_registrations
    SET
      session_id = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [sessionId, registration.id]
  );

  const session = await loadSessionRoomRow(
    registration.webinar_id,
    sessionId,
    connection
  );

  if (!session || session.session_status === 'cancelled') {
    throw roomError(
      'The webinar room is not available.',
      409,
      'WEBINAR_ROOM_UNAVAILABLE'
    );
  }

  return session;
}

async function currentViewerCount(sessionId, connection = pool) {
  const [[row]] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM webinar_attendance
    WHERE session_id = ?
      AND left_at IS NULL
      AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND)
    `,
    [sessionId]
  );

  return Number(row?.total || 0);
}

async function currentWriterViewerCount(writerUserId, connection = pool) {
  const [[row]] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM webinar_attendance wa
    INNER JOIN webinars w
      ON w.id = wa.webinar_id
    WHERE w.user_id = ?
      AND wa.left_at IS NULL
      AND wa.last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND)
    `,
    [writerUserId]
  );

  return Number(row?.total || 0);
}

async function cleanupWriterWaitingRoom(writerUserId, connection = pool) {
  await connection.query(
    `
    UPDATE webinar_waiting_room_entries q
    INNER JOIN webinar_sessions ws
      ON ws.id = q.session_id
    INNER JOIN webinar_registrations wr
      ON wr.id = q.registration_id
    SET
      q.status = 'cancelled',
      q.updated_at = NOW()
    WHERE q.writer_user_id = ?
      AND q.status = 'waiting'
      AND (
        ws.status IN ('ended', 'cancelled')
        OR wr.status <> 'confirmed'
        OR wr.payment_status NOT IN ('not_required', 'paid')
      )
    `,
    [writerUserId]
  );
}

async function enqueueWaitingRoom(
  writerUserId,
  webinarId,
  sessionId,
  registrationId,
  connection = pool
) {
  await connection.query(
    `
    INSERT INTO webinar_waiting_room_entries (
      writer_user_id,
      webinar_id,
      session_id,
      registration_id,
      status,
      queued_at,
      admitted_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, 'waiting', NOW(), NULL, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      status = 'waiting',
      admitted_at = NULL,
      updated_at = NOW()
    `,
    [writerUserId, webinarId, sessionId, registrationId]
  );

  const [[entry]] = await connection.query(
    `
    SELECT *
    FROM webinar_waiting_room_entries
    WHERE registration_id = ?
      AND session_id = ?
    LIMIT 1
    FOR UPDATE
    `,
    [registrationId, sessionId]
  );

  return entry || null;
}

async function writerWaitingRoomHead(writerUserId, connection = pool) {
  const [[row]] = await connection.query(
    `
    SELECT *
    FROM webinar_waiting_room_entries
    WHERE writer_user_id = ?
      AND status = 'waiting'
    ORDER BY queued_at ASC, id ASC
    LIMIT 1
    FOR UPDATE
    `,
    [writerUserId]
  );

  return row || null;
}

async function waitingRoomPosition(entry, connection = pool) {
  if (!entry) return null;

  const [[row]] = await connection.query(
    `
    SELECT COUNT(*) AS position
    FROM webinar_waiting_room_entries
    WHERE writer_user_id = ?
      AND status = 'waiting'
      AND (
        queued_at < ?
        OR (queued_at = ? AND id <= ?)
      )
    `,
    [
      entry.writer_user_id,
      entry.queued_at,
      entry.queued_at,
      entry.id,
    ]
  );

  return Number(row?.position || 0);
}

async function admitWaitingRoomEntry(
  registrationId,
  sessionId,
  connection = pool
) {
  await connection.query(
    `
    UPDATE webinar_waiting_room_entries
    SET
      status = 'admitted',
      admitted_at = NOW(),
      updated_at = NOW()
    WHERE registration_id = ?
      AND session_id = ?
      AND status = 'waiting'
    `,
    [registrationId, sessionId]
  );
}


async function loadChatMessages(
  sessionId,
  { includeModerated = false, limit = 100 } = {},
  connection = pool
) {
  const safeLimit = Math.max(1, Math.min(200, Number(limit || 100)));
  const statusClause = includeModerated ? '' : "AND status = 'active'";

  const [rows] = await connection.query(
    `
    SELECT
      id,
      sender_type,
      sender_name,
      message_body,
      status,
      sent_at
    FROM webinar_chat_messages
    WHERE session_id = ?
      ${statusClause}
    ORDER BY id DESC
    LIMIT ${safeLimit}
    `,
    [sessionId]
  );

  return rows.reverse().map(sanitizeChatMessage);
}

async function loadPolls(sessionId, attendanceId = null, connection = pool) {
  const [pollRows] = await connection.query(
    `
    SELECT
      id,
      question,
      status,
      opened_at,
      closed_at,
      created_at
    FROM webinar_polls
    WHERE session_id = ?
    ORDER BY id ASC
    `,
    [sessionId]
  );

  if (!pollRows.length) return [];

  const pollIds = pollRows.map((row) => Number(row.id));
  const placeholders = pollIds.map(() => '?').join(',');

  const [optionRows] = await connection.query(
    `
    SELECT
      o.id,
      o.poll_id,
      o.option_text,
      o.sort_order,
      COUNT(v.id) AS vote_count
    FROM webinar_poll_options o
    LEFT JOIN webinar_poll_votes v
      ON v.option_id = o.id
    WHERE o.poll_id IN (${placeholders})
    GROUP BY o.id
    ORDER BY o.poll_id ASC, o.sort_order ASC, o.id ASC
    `,
    pollIds
  );

  let selectedByPoll = new Map();

  if (attendanceId) {
    const [voteRows] = await connection.query(
      `
      SELECT poll_id, option_id
      FROM webinar_poll_votes
      WHERE attendance_id = ?
        AND poll_id IN (${placeholders})
      `,
      [attendanceId, ...pollIds]
    );

    selectedByPoll = new Map(
      voteRows.map((row) => [Number(row.poll_id), Number(row.option_id)])
    );
  }

  const optionsByPoll = new Map();

  for (const option of optionRows) {
    const pollId = Number(option.poll_id);
    const list = optionsByPoll.get(pollId) || [];
    list.push({
      id: Number(option.id),
      option_text: option.option_text,
      sort_order: Number(option.sort_order || 0),
      vote_count: Number(option.vote_count || 0),
    });
    optionsByPoll.set(pollId, list);
  }

  return pollRows.map((poll) => ({
    id: Number(poll.id),
    question: poll.question,
    status: poll.status,
    opened_at: poll.opened_at,
    closed_at: poll.closed_at,
    created_at: poll.created_at,
    selected_option_id: selectedByPoll.get(Number(poll.id)) || null,
    options: optionsByPoll.get(Number(poll.id)) || [],
  }));
}

async function loadRoomEvents(sessionId, cursor = 0, connection = pool) {
  const cleanCursor = Math.max(0, Number(cursor || 0));
  const [rows] = await connection.query(
    `
    SELECT
      id,
      event_type,
      entity_id,
      payload_json,
      created_at
    FROM webinar_room_events
    WHERE session_id = ?
      AND id > ?
    ORDER BY id ASC
    LIMIT 201
    `,
    [sessionId, cleanCursor]
  );

  const hasMore = rows.length > 200;
  const visibleRows = rows.slice(0, 200);
  const events = visibleRows.map(sanitizeEvent);
  const nextCursor = events.length
    ? events[events.length - 1].id
    : cleanCursor;

  return {
    events,
    next_cursor: nextCursor,
    has_more: hasMore,
  };
}

async function buildPlaybackForRoom(room, connection = pool) {
  if (room.session_status !== 'open') return null;
  if (room.webinar_type === 'live') return null;

  const overview = await getWebinarSubscriptionOverview(room.writer_user_id);

  if (!overview.entitlement.can_stream) return null;

  const media = await getLatestWebinarMedia(room.webinar_id, connection);

  if (!media || media.status !== 'ready') return null;

  return buildPlaybackUrl(media.hls_master_key);
}

async function buildRoomState(
  room,
  {
    cursor = 0,
    attendanceId = null,
    includeModerated = false,
    includeInitial = true,
  } = {},
  connection = pool
) {
  await maybeAutoOpenScheduledSession(room.session_id, connection);
  await maybeAutoEndSession(room.session_id, connection);

  const freshRoom = await loadSessionRoomRow(
    room.webinar_id,
    room.session_id,
    connection
  );

  if (!freshRoom) {
    throw roomError('Webinar room not found.', 404, 'WEBINAR_ROOM_NOT_FOUND');
  }

  const [viewers, eventResult, playbackUrl] = await Promise.all([
    currentViewerCount(freshRoom.session_id, connection),
    loadRoomEvents(freshRoom.session_id, cursor, connection),
    buildPlaybackForRoom(freshRoom, connection),
  ]);

  let chatMessages = null;
  let polls = null;

  if (includeInitial || Number(cursor || 0) === 0) {
    [chatMessages, polls] = await Promise.all([
      loadChatMessages(
        freshRoom.session_id,
        { includeModerated, limit: 100 },
        connection
      ),
      loadPolls(freshRoom.session_id, attendanceId, connection),
    ]);
  }

  return {
    server_time: new Date().toISOString(),
    webinar: {
      id: Number(freshRoom.webinar_id),
      title: freshRoom.title,
      slug: freshRoom.slug,
      webinar_type: freshRoom.webinar_type,
      status: freshRoom.webinar_status,
      allow_chat: Number(freshRoom.allow_chat || 0) === 1,
      writer_page: {
        id: Number(freshRoom.writer_page_id),
        name: freshRoom.writer_page_name,
        slug: freshRoom.writer_page_slug,
      },
    },
    session: {
      id: Number(freshRoom.session_id),
      session_type: freshRoom.session_type,
      status: freshRoom.session_status,
      scheduled_start_at: freshRoom.scheduled_start_at,
      started_at: freshRoom.started_at,
      ended_at: freshRoom.ended_at,
    },
    timer: roomTimer(freshRoom),
    current_viewers: viewers,
    playback_url: playbackUrl,
    chat_messages: chatMessages,
    polls,
    ...eventResult,
  };
}

async function joinRoomByRegistrationToken(registrationToken) {
  const registration = await loadRegistrationByToken(registrationToken);

  if (!registration) {
    throw roomError(
      'Webinar registration not found.',
      404,
      'WEBINAR_REGISTRATION_NOT_FOUND'
    );
  }

  if (
    registration.status !== 'confirmed' ||
    !['not_required', 'paid'].includes(registration.payment_status)
  ) {
    throw roomError(
      'A confirmed webinar registration is required to enter the room.',
      403,
      'WEBINAR_REGISTRATION_NOT_CONFIRMED'
    );
  }

  if (!registration.published_at) {
    throw roomError(
      'This webinar is not published.',
      409,
      'WEBINAR_NOT_PUBLISHED'
    );
  }

  if (['draft', 'processing', 'error', 'archived'].includes(registration.webinar_status)) {
    throw roomError(
      'This webinar room is not available.',
      409,
      'WEBINAR_ROOM_UNAVAILABLE'
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[lockedRegistration]] = await connection.query(
      `
      SELECT
        wr.*,
        w.user_id AS writer_user_id,
        w.webinar_type,
        w.status AS webinar_status,
        w.published_at
      FROM webinar_registrations wr
      INNER JOIN webinars w
        ON w.id = wr.webinar_id
      WHERE wr.id = ?
      FOR UPDATE
      `,
      [registration.id]
    );

    if (!lockedRegistration) {
      throw roomError('Webinar registration not found.', 404);
    }

    if (
      lockedRegistration.status !== 'confirmed' ||
      !['not_required', 'paid'].includes(lockedRegistration.payment_status)
    ) {
      throw roomError(
        'A confirmed webinar registration is required to enter the room.',
        403,
        'WEBINAR_REGISTRATION_NOT_CONFIRMED'
      );
    }

    if (!lockedRegistration.published_at) {
      throw roomError(
        'This webinar is not published.',
        409,
        'WEBINAR_NOT_PUBLISHED'
      );
    }

    const session = await ensureRegistrationSession(
      lockedRegistration,
      connection
    );

    await maybeAutoEndSession(session.session_id, connection);

    const freshSession = await loadSessionRoomRow(
      lockedRegistration.webinar_id,
      session.session_id,
      connection
    );

    if (freshSession.session_status === 'ended') {
      throw roomError(
        'This webinar session has ended.',
        409,
        'WEBINAR_SESSION_ENDED'
      );
    }

    const subscription = await getCurrentWebinarSubscription(
      lockedRegistration.writer_user_id,
      {
        connection,
        forUpdate: true,
      }
    );

    if (!subscription) {
      throw roomError(
        'The webinar host does not have an active webinar subscription.',
        403,
        'WEBINAR_SUBSCRIPTION_REQUIRED'
      );
    }

    const usage = await ensureUsagePeriod(subscription, connection);
    const playbackLimit = subscription.plan.monthly_playback_seconds_limit;

    if (
      playbackLimit !== null &&
      Number(usage.playback_seconds || 0) >= Number(playbackLimit)
    ) {
      throw roomError(
        'The webinar host has reached the monthly viewing allowance.',
        403,
        'WEBINAR_MONTHLY_VIEWING_LIMIT_REACHED'
      );
    }

    let [[attendance]] = await connection.query(
      `
      SELECT *
      FROM webinar_attendance
      WHERE registration_id = ?
        AND session_id = ?
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
      `,
      [lockedRegistration.id, freshSession.session_id]
    );

    const attendanceIsActive =
      attendance &&
      attendance.left_at === null &&
      Number.isFinite(new Date(attendance.last_seen_at).getTime()) &&
      Date.now() - new Date(attendance.last_seen_at).getTime() <= 45000;

    const maxAttendees = subscription.plan.max_concurrent_attendees;

    if (!attendanceIsActive && maxAttendees !== null) {
      await cleanupWriterWaitingRoom(
        lockedRegistration.writer_user_id,
        connection
      );

      const currentAttendees = await currentWriterViewerCount(
        lockedRegistration.writer_user_id,
        connection
      );

      const currentQueue = await connection.query(
        `
        SELECT *
        FROM webinar_waiting_room_entries
        WHERE registration_id = ?
          AND session_id = ?
          AND status = 'waiting'
        LIMIT 1
        FOR UPDATE
        `,
        [lockedRegistration.id, freshSession.session_id]
      );

      let waitingEntry = currentQueue[0][0] || null;
      let head = await writerWaitingRoomHead(
        lockedRegistration.writer_user_id,
        connection
      );

      const capacityFull = currentAttendees >= Number(maxAttendees);
      const queueAhead =
        head &&
        (!waitingEntry || Number(head.id) !== Number(waitingEntry.id));

      if (capacityFull || queueAhead) {
        waitingEntry = await enqueueWaitingRoom(
          lockedRegistration.writer_user_id,
          lockedRegistration.webinar_id,
          freshSession.session_id,
          lockedRegistration.id,
          connection
        );

        head = await writerWaitingRoomHead(
          lockedRegistration.writer_user_id,
          connection
        );

        if (
          currentAttendees >= Number(maxAttendees) ||
          !head ||
          Number(head.id) !== Number(waitingEntry.id)
        ) {
          const position = await waitingRoomPosition(
            waitingEntry,
            connection
          );

          await connection.commit();

          return {
            waiting: true,
            waiting_room: {
              position,
              current_attendees: currentAttendees,
              max_attendees: Number(maxAttendees),
              scope: 'writer_account',
              retry_after_seconds: 5,
            },
          };
        }
      }

      await admitWaitingRoomEntry(
        lockedRegistration.id,
        freshSession.session_id,
        connection
      );
    }

    if (!attendance) {
      const visitorToken = crypto.randomBytes(32).toString('hex');
      const [result] = await connection.query(
        `
        INSERT INTO webinar_attendance (
          webinar_id,
          session_id,
          registration_id,
          user_id,
          visitor_token,
          joined_at,
          last_seen_at,
          left_at,
          watch_seconds,
          completed_percent,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NULL, 0, 0.00, NOW(), NOW())
        `,
        [
          lockedRegistration.webinar_id,
          freshSession.session_id,
          lockedRegistration.id,
          lockedRegistration.user_id || null,
          visitorToken,
        ]
      );

      [[attendance]] = await connection.query(
        `
        SELECT *
        FROM webinar_attendance
        WHERE id = ?
        LIMIT 1
        `,
        [result.insertId]
      );

      await appendRoomEvent(
        connection,
        lockedRegistration.webinar_id,
        freshSession.session_id,
        'attendance.joined',
        attendance.id,
        { attendance_id: Number(attendance.id) }
      );
    } else {
      let visitorToken = cleanText(attendance.visitor_token, 64);

      if (!visitorToken) {
        visitorToken = crypto.randomBytes(32).toString('hex');
      }

      await connection.query(
        `
        UPDATE webinar_attendance
        SET
          visitor_token = ?,
          last_seen_at = NOW(),
          left_at = NULL,
          updated_at = NOW()
        WHERE id = ?
        `,
        [visitorToken, attendance.id]
      );

      attendance.visitor_token = visitorToken;
    }

    await admitWaitingRoomEntry(
      lockedRegistration.id,
      freshSession.session_id,
      connection
    );

    await connection.commit();

    const roomContext = await loadAttendanceByVisitorToken(
      attendance.visitor_token
    );

    const state = await buildRoomState(
      roomContext,
      {
        cursor: 0,
        attendanceId: Number(attendance.id),
        includeInitial: true,
      }
    );

    return {
      waiting: false,
      visitor_token: attendance.visitor_token,
      attendance: {
        id: Number(attendance.id),
        joined_at: attendance.joined_at,
      },
      capacity: {
        max_attendees:
          maxAttendees === null ? null : Number(maxAttendees),
        scope: 'writer_account',
      },
      state,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    throw error;
  } finally {
    connection.release();
  }
}

async function getAttendeeRoomState(visitorToken, cursor = 0) {
  const room = await loadAttendanceByVisitorToken(visitorToken);

  if (!room) {
    throw roomError('Webinar room token not found.', 404, 'WEBINAR_ROOM_TOKEN_NOT_FOUND');
  }

  if (
    room.registration_status !== 'confirmed' ||
    !['not_required', 'paid'].includes(room.payment_status)
  ) {
    throw roomError('Webinar room access is no longer active.', 403);
  }

  return buildRoomState(room, {
    cursor,
    attendanceId: Number(room.id),
    includeInitial: Number(cursor || 0) === 0,
  });
}

function heartbeatDelta(lastSeenAt) {
  const last = new Date(lastSeenAt).getTime();
  if (!Number.isFinite(last)) return 0;
  return Math.max(0, Math.min(60, Math.floor((Date.now() - last) / 1000)));
}

async function heartbeatRoom(visitorToken) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const room = await loadAttendanceByVisitorToken(visitorToken, connection);

    if (!room) {
      throw roomError('Webinar room token not found.', 404, 'WEBINAR_ROOM_TOKEN_NOT_FOUND');
    }

    await connection.query(
      `SELECT id FROM webinar_attendance WHERE id = ? FOR UPDATE`,
      [room.id]
    );

    await maybeAutoOpenScheduledSession(room.session_id, connection);
    await maybeAutoEndSession(room.session_id, connection);

    const freshRoom = await loadSessionRoomRow(
      room.webinar_id,
      room.session_id,
      connection
    );

    const requestedDelta = freshRoom.session_status === 'open'
      ? heartbeatDelta(room.last_seen_at)
      : 0;
    const currentWatch = Number(room.watch_seconds || 0);

    let consumedDelta = requestedDelta;
    let usageLimitReached = false;

    if (requestedDelta > 0) {
      const usageResult = await consumeWebinarPlaybackSeconds({
        writerUserId: room.writer_user_id,
        usageKey:
          `attendance:${room.id}:watch:${currentWatch}:${requestedDelta}`,
        playbackSeconds: requestedDelta,
        metadata: {
          webinar_id: Number(room.webinar_id),
          session_id: Number(room.session_id),
          attendance_id: Number(room.id),
        },
        connection,
      });

      consumedDelta = Number(usageResult.consumed_seconds || 0);
      usageLimitReached = Boolean(usageResult.limit_reached);
    }

    const nextWatch = currentWatch + consumedDelta;
    const duration = Number(freshRoom.duration_seconds || 0);
    const completed = duration > 0
      ? Math.min(100, (nextWatch / duration) * 100)
      : Number(room.completed_percent || 0);

    await connection.query(
      `
      UPDATE webinar_attendance
      SET
        last_seen_at = NOW(),
        left_at = ?,
        watch_seconds = ?,
        completed_percent = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        usageLimitReached ? new Date() : null,
        nextWatch,
        completed.toFixed(2),
        room.id,
      ]
    );

    if (usageLimitReached) {
      await appendRoomEvent(
        connection,
        room.webinar_id,
        room.session_id,
        'attendance.limit_reached',
        room.id,
        {
          attendance_id: Number(room.id),
          reason: 'monthly_playback_limit_reached',
        }
      );
    }

    await connection.commit();

    return {
      attendance_id: Number(room.id),
      watch_seconds: nextWatch,
      completed_percent: Number(completed.toFixed(2)),
      usage_limit_reached: usageLimitReached,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function leaveRoom(visitorToken) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const room = await loadAttendanceByVisitorToken(visitorToken, connection);

    if (!room) {
      throw roomError('Webinar room token not found.', 404, 'WEBINAR_ROOM_TOKEN_NOT_FOUND');
    }

    await connection.query(
      `SELECT id FROM webinar_attendance WHERE id = ? FOR UPDATE`,
      [room.id]
    );

    await maybeAutoEndSession(room.session_id, connection);
    const freshRoom = await loadSessionRoomRow(
      room.webinar_id,
      room.session_id,
      connection
    );

    const requestedDelta = freshRoom.session_status === 'open'
      ? heartbeatDelta(room.last_seen_at)
      : 0;
    const currentWatch = Number(room.watch_seconds || 0);

    let consumedDelta = requestedDelta;
    let usageLimitReached = false;

    if (requestedDelta > 0) {
      const usageResult = await consumeWebinarPlaybackSeconds({
        writerUserId: room.writer_user_id,
        usageKey:
          `attendance:${room.id}:leave:${currentWatch}:${requestedDelta}`,
        playbackSeconds: requestedDelta,
        metadata: {
          webinar_id: Number(room.webinar_id),
          session_id: Number(room.session_id),
          attendance_id: Number(room.id),
        },
        connection,
      });

      consumedDelta = Number(usageResult.consumed_seconds || 0);
      usageLimitReached = Boolean(usageResult.limit_reached);
    }

    const nextWatch = currentWatch + consumedDelta;
    const duration = Number(freshRoom.duration_seconds || 0);
    const completed = duration > 0
      ? Math.min(100, (nextWatch / duration) * 100)
      : Number(room.completed_percent || 0);

    await connection.query(
      `
      UPDATE webinar_attendance
      SET
        last_seen_at = NOW(),
        left_at = NOW(),
        watch_seconds = ?,
        completed_percent = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [nextWatch, completed.toFixed(2), room.id]
    );

    await appendRoomEvent(
      connection,
      room.webinar_id,
      room.session_id,
      'attendance.left',
      room.id,
      { attendance_id: Number(room.id) }
    );

    await connection.commit();

    return {
      attendance_id: Number(room.id),
      watch_seconds: nextWatch,
      completed_percent: Number(completed.toFixed(2)),
      left: true,
      usage_limit_reached: usageLimitReached,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function sendAttendeeChatMessage(visitorToken, messageBody) {
  const room = await loadAttendanceByVisitorToken(visitorToken);

  if (!room) {
    throw roomError('Webinar room token not found.', 404, 'WEBINAR_ROOM_TOKEN_NOT_FOUND');
  }

  if (Number(room.allow_chat || 0) !== 1) {
    throw roomError('Chat is disabled for this webinar.', 409, 'WEBINAR_CHAT_DISABLED');
  }

  await maybeAutoOpenScheduledSession(room.session_id);
  await maybeAutoEndSession(room.session_id);

  const freshRoom = await loadSessionRoomRow(room.webinar_id, room.session_id);

  if (freshRoom.session_status !== 'open') {
    throw roomError('Chat is available only while the webinar room is open.', 409, 'WEBINAR_ROOM_NOT_OPEN');
  }

  const message = cleanText(messageBody, 2000);

  if (!message) {
    throw roomError('Chat message is required.', 400, 'WEBINAR_CHAT_MESSAGE_REQUIRED');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      INSERT INTO webinar_chat_messages (
        webinar_id,
        session_id,
        attendance_id,
        registration_id,
        user_id,
        sender_type,
        sender_name,
        message_body,
        status,
        sent_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, 'attendee', ?, ?, 'active', NOW(), NOW(), NOW())
      `,
      [
        room.webinar_id,
        room.session_id,
        room.id,
        room.registration_id,
        room.user_id || null,
        cleanText(room.attendee_name, 255) || 'Attendee',
        message,
      ]
    );

    const messageId = Number(result.insertId);

    const [[chat]] = await connection.query(
      `
      SELECT id, sender_type, sender_name, message_body, status, sent_at
      FROM webinar_chat_messages
      WHERE id = ?
      LIMIT 1
      `,
      [messageId]
    );

    await appendRoomEvent(
      connection,
      room.webinar_id,
      room.session_id,
      'chat.message',
      messageId,
      sanitizeChatMessage(chat)
    );

    await connection.commit();
    return sanitizeChatMessage(chat);
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function voteInPoll(visitorToken, pollId, optionId) {
  const cleanPollId = positiveInt(pollId);
  const cleanOptionId = positiveInt(optionId);

  if (!cleanPollId || !cleanOptionId) {
    throw roomError('Valid poll and option are required.', 400);
  }

  const room = await loadAttendanceByVisitorToken(visitorToken);

  if (!room) {
    throw roomError('Webinar room token not found.', 404, 'WEBINAR_ROOM_TOKEN_NOT_FOUND');
  }

  await maybeAutoOpenScheduledSession(room.session_id);
  await maybeAutoEndSession(room.session_id);

  const freshRoom = await loadSessionRoomRow(room.webinar_id, room.session_id);

  if (freshRoom.session_status !== 'open') {
    throw roomError('Poll voting is available only while the room is open.', 409, 'WEBINAR_ROOM_NOT_OPEN');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[poll]] = await connection.query(
      `
      SELECT *
      FROM webinar_polls
      WHERE id = ?
        AND webinar_id = ?
        AND session_id = ?
      FOR UPDATE
      `,
      [cleanPollId, room.webinar_id, room.session_id]
    );

    if (!poll) {
      throw roomError('Webinar poll not found.', 404, 'WEBINAR_POLL_NOT_FOUND');
    }

    if (poll.status !== 'open') {
      throw roomError('This webinar poll is not open.', 409, 'WEBINAR_POLL_NOT_OPEN');
    }

    const [[option]] = await connection.query(
      `
      SELECT id
      FROM webinar_poll_options
      WHERE id = ?
        AND poll_id = ?
      LIMIT 1
      `,
      [cleanOptionId, cleanPollId]
    );

    if (!option) {
      throw roomError('Webinar poll option not found.', 404, 'WEBINAR_POLL_OPTION_NOT_FOUND');
    }

    const [[existing]] = await connection.query(
      `
      SELECT id, option_id
      FROM webinar_poll_votes
      WHERE poll_id = ?
        AND attendance_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [cleanPollId, room.id]
    );

    if (existing) {
      throw roomError(
        'This attendee has already voted in the poll.',
        409,
        'WEBINAR_POLL_ALREADY_VOTED'
      );
    }

    const [result] = await connection.query(
      `
      INSERT INTO webinar_poll_votes (
        poll_id,
        option_id,
        webinar_id,
        session_id,
        attendance_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [cleanPollId, cleanOptionId, room.webinar_id, room.session_id, room.id]
    );

    await appendRoomEvent(
      connection,
      room.webinar_id,
      room.session_id,
      'poll.vote',
      cleanPollId,
      { poll_id: cleanPollId }
    );

    await connection.commit();

    const polls = await loadPolls(room.session_id, Number(room.id));
    const updatedPoll = polls.find((item) => item.id === cleanPollId) || null;

    return {
      vote_id: Number(result.insertId),
      poll: updatedPoll,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function openWriterRoom(webinarId, writerUserId, sessionId = null) {
  const cleanWebinarId = positiveInt(webinarId);
  const cleanWriterUserId = positiveInt(writerUserId);
  const cleanSessionId = positiveInt(sessionId);

  if (!cleanWebinarId || !cleanWriterUserId) {
    throw roomError('Valid webinar and Writer are required.', 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[webinar]] = await connection.query(
      `
      SELECT *
      FROM webinars
      WHERE id = ?
        AND user_id = ?
      FOR UPDATE
      `,
      [cleanWebinarId, cleanWriterUserId]
    );

    if (!webinar) {
      throw roomError('Writer webinar not found.', 404);
    }

    if (!webinar.published_at) {
      throw roomError('Publish the webinar before opening a room.', 409, 'WEBINAR_NOT_PUBLISHED');
    }

    if (webinar.webinar_type === 'evergreen') {
      throw roomError(
        'Evergreen attendee rooms start automatically when confirmed attendees join.',
        409,
        'WEBINAR_EVERGREEN_AUTO_ROOM'
      );
    }

    if (['draft', 'processing', 'error', 'archived'].includes(webinar.status)) {
      throw roomError('This webinar cannot open a room in its current state.', 409);
    }

    let session = null;

    if (cleanSessionId) {
      [[session]] = await connection.query(
        `
        SELECT *
        FROM webinar_sessions
        WHERE id = ?
          AND webinar_id = ?
        FOR UPDATE
        `,
        [cleanSessionId, cleanWebinarId]
      );
    } else {
      [[session]] = await connection.query(
        `
        SELECT *
        FROM webinar_sessions
        WHERE webinar_id = ?
          AND status IN ('open','scheduled')
        ORDER BY
          CASE WHEN status = 'open' THEN 0 ELSE 1 END,
          id DESC
        LIMIT 1
        FOR UPDATE
        `,
        [cleanWebinarId]
      );
    }

    if (session && session.status === 'open') {
      await connection.commit();
      return buildRoomState(
        await loadSessionRoomRow(cleanWebinarId, session.id),
        { cursor: 0, includeModerated: true, includeInitial: true }
      );
    }

    let targetSessionId = session ? Number(session.id) : null;

    if (!targetSessionId) {
      const sessionKey = crypto.randomBytes(24).toString('hex');
      const [result] = await connection.query(
        `
        INSERT INTO webinar_sessions (
          webinar_id,
          session_key,
          session_type,
          status,
          scheduled_start_at,
          started_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, 'manual', 'open', NULL, NOW(), NOW(), NOW())
        `,
        [cleanWebinarId, sessionKey]
      );

      targetSessionId = Number(result.insertId);
    } else {
      await connection.query(
        `
        UPDATE webinar_sessions
        SET
          status = 'open',
          started_at = COALESCE(
            started_at,
            CASE
              WHEN scheduled_start_at IS NOT NULL
                AND scheduled_start_at <= NOW()
              THEN scheduled_start_at
              ELSE NOW()
            END
          ),
          updated_at = NOW()
        WHERE id = ?
        `,
        [targetSessionId]
      );
    }

    await connection.query(
      `
      UPDATE webinars
      SET
        status = 'live',
        updated_at = NOW()
      WHERE id = ?
      `,
      [cleanWebinarId]
    );

    await appendRoomEvent(
      connection,
      cleanWebinarId,
      targetSessionId,
      'session.opened',
      targetSessionId,
      { automatic: false }
    );

    await connection.commit();

    const room = await loadSessionRoomRow(cleanWebinarId, targetSessionId);
    return buildRoomState(room, {
      cursor: 0,
      includeModerated: true,
      includeInitial: true,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function endWriterRoom(webinarId, writerUserId, sessionId) {
  const cleanWebinarId = positiveInt(webinarId);
  const cleanSessionId = positiveInt(sessionId);

  if (!cleanWebinarId || !cleanSessionId) {
    throw roomError('Valid webinar and session are required.', 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[session]] = await connection.query(
      `
      SELECT ws.*, w.user_id, w.webinar_type
      FROM webinar_sessions ws
      INNER JOIN webinars w
        ON w.id = ws.webinar_id
      WHERE ws.id = ?
        AND ws.webinar_id = ?
        AND w.user_id = ?
      FOR UPDATE
      `,
      [cleanSessionId, cleanWebinarId, writerUserId]
    );

    if (!session) {
      throw roomError('Writer webinar session not found.', 404);
    }

    if (session.status !== 'ended') {
      await connection.query(
        `
        UPDATE webinar_sessions
        SET
          status = 'ended',
          ended_at = COALESCE(ended_at, NOW()),
          updated_at = NOW()
        WHERE id = ?
        `,
        [cleanSessionId]
      );

      await connection.query(
        `
        UPDATE webinar_attendance
        SET
          left_at = COALESCE(left_at, NOW()),
          last_seen_at = NOW(),
          updated_at = NOW()
        WHERE session_id = ?
          AND left_at IS NULL
        `,
        [cleanSessionId]
      );

      if (session.webinar_type !== 'evergreen') {
        await connection.query(
          `
          UPDATE webinars
          SET
            status = 'ended',
            updated_at = NOW()
          WHERE id = ?
          `,
          [cleanWebinarId]
        );
      }

      await appendRoomEvent(
        connection,
        cleanWebinarId,
        cleanSessionId,
        'session.ended',
        cleanSessionId,
        { automatic: false }
      );
    }

    await connection.commit();

    const room = await loadSessionRoomRow(cleanWebinarId, cleanSessionId);
    return buildRoomState(room, {
      cursor: 0,
      includeModerated: true,
      includeInitial: true,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function getWriterRoomState(webinarId, writerUserId, sessionId, cursor = 0) {
  const room = await loadSessionRoomRow(webinarId, sessionId);

  if (!room || Number(room.writer_user_id) !== Number(writerUserId)) {
    throw roomError('Writer webinar room not found.', 404);
  }

  return buildRoomState(room, {
    cursor,
    includeModerated: true,
    includeInitial: Number(cursor || 0) === 0,
  });
}

async function sendWriterChatMessage(webinarId, writerUserId, sessionId, messageBody) {
  const room = await loadSessionRoomRow(webinarId, sessionId);

  if (!room || Number(room.writer_user_id) !== Number(writerUserId)) {
    throw roomError('Writer webinar room not found.', 404);
  }

  if (Number(room.allow_chat || 0) !== 1) {
    throw roomError('Chat is disabled for this webinar.', 409, 'WEBINAR_CHAT_DISABLED');
  }

  await maybeAutoOpenScheduledSession(room.session_id);
  await maybeAutoEndSession(room.session_id);
  const freshRoom = await loadSessionRoomRow(webinarId, sessionId);

  if (freshRoom.session_status !== 'open') {
    throw roomError('Chat is available only while the webinar room is open.', 409, 'WEBINAR_ROOM_NOT_OPEN');
  }

  const message = cleanText(messageBody, 2000);

  if (!message) {
    throw roomError('Chat message is required.', 400, 'WEBINAR_CHAT_MESSAGE_REQUIRED');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      INSERT INTO webinar_chat_messages (
        webinar_id,
        session_id,
        attendance_id,
        registration_id,
        user_id,
        sender_type,
        sender_name,
        message_body,
        status,
        sent_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, NULL, NULL, ?, 'host', ?, ?, 'active', NOW(), NOW(), NOW())
      `,
      [webinarId, sessionId, writerUserId, room.writer_page_name || 'Host', message]
    );

    const messageId = Number(result.insertId);
    const [[chat]] = await connection.query(
      `
      SELECT id, sender_type, sender_name, message_body, status, sent_at
      FROM webinar_chat_messages
      WHERE id = ?
      LIMIT 1
      `,
      [messageId]
    );

    await appendRoomEvent(
      connection,
      webinarId,
      sessionId,
      'chat.message',
      messageId,
      sanitizeChatMessage(chat)
    );

    await connection.commit();
    return sanitizeChatMessage(chat);
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function moderateWriterChatMessage(
  webinarId,
  writerUserId,
  sessionId,
  messageId,
  nextStatus
) {
  const allowed = ['active', 'hidden', 'deleted'];
  const status = cleanText(nextStatus, 20).toLowerCase();

  if (!allowed.includes(status)) {
    throw roomError('Chat status must be active, hidden, or deleted.', 400);
  }

  const room = await loadSessionRoomRow(webinarId, sessionId);

  if (!room || Number(room.writer_user_id) !== Number(writerUserId)) {
    throw roomError('Writer webinar room not found.', 404);
  }

  const cleanMessageId = positiveInt(messageId);

  if (!cleanMessageId) {
    throw roomError('Valid chat message is required.', 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
      UPDATE webinar_chat_messages
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND webinar_id = ?
        AND session_id = ?
      `,
      [status, cleanMessageId, webinarId, sessionId]
    );

    if (!result.affectedRows) {
      throw roomError('Webinar chat message not found.', 404);
    }

    await appendRoomEvent(
      connection,
      webinarId,
      sessionId,
      'chat.status',
      cleanMessageId,
      { message_id: cleanMessageId, status }
    );

    await connection.commit();

    return {
      message_id: cleanMessageId,
      status,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

function normalizePollOptions(options) {
  if (!Array.isArray(options)) return null;

  const clean = options
    .map((value) => cleanText(value, 255))
    .filter(Boolean)
    .slice(0, 10);

  if (clean.length < 2) return null;

  const normalized = new Set(clean.map((value) => value.toLowerCase()));
  if (normalized.size !== clean.length) return null;

  return clean;
}

async function createWriterPoll(
  webinarId,
  writerUserId,
  sessionId,
  question,
  options
) {
  const room = await loadSessionRoomRow(webinarId, sessionId);

  if (!room || Number(room.writer_user_id) !== Number(writerUserId)) {
    throw roomError('Writer webinar room not found.', 404);
  }

  if (['ended', 'cancelled'].includes(room.session_status)) {
    throw roomError('Polls cannot be created for an ended room.', 409);
  }

  const cleanQuestion = cleanText(question, 500);
  const cleanOptions = normalizePollOptions(options);

  if (!cleanQuestion || !cleanOptions) {
    throw roomError('A poll question and 2 to 10 unique options are required.', 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [pollResult] = await connection.query(
      `
      INSERT INTO webinar_polls (
        webinar_id,
        session_id,
        created_by_user_id,
        question,
        status,
        opened_at,
        closed_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'draft', NULL, NULL, NOW(), NOW())
      `,
      [webinarId, sessionId, writerUserId, cleanQuestion]
    );

    const pollId = Number(pollResult.insertId);

    for (let index = 0; index < cleanOptions.length; index += 1) {
      await connection.query(
        `
        INSERT INTO webinar_poll_options (
          poll_id,
          option_text,
          sort_order,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, NOW(), NOW())
        `,
        [pollId, cleanOptions[index], index]
      );
    }

    await appendRoomEvent(
      connection,
      webinarId,
      sessionId,
      'poll.created',
      pollId,
      { poll_id: pollId }
    );

    await connection.commit();

    const polls = await loadPolls(sessionId);
    return polls.find((poll) => poll.id === pollId) || null;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function setWriterPollStatus(
  webinarId,
  writerUserId,
  sessionId,
  pollId,
  nextStatus
) {
  const status = cleanText(nextStatus, 20).toLowerCase();

  if (!['open', 'closed'].includes(status)) {
    throw roomError('Poll status must be open or closed.', 400);
  }

  const room = await loadSessionRoomRow(webinarId, sessionId);

  if (!room || Number(room.writer_user_id) !== Number(writerUserId)) {
    throw roomError('Writer webinar room not found.', 404);
  }

  await maybeAutoOpenScheduledSession(room.session_id);
  await maybeAutoEndSession(room.session_id);
  const freshRoom = await loadSessionRoomRow(webinarId, sessionId);

  if (status === 'open' && freshRoom.session_status !== 'open') {
    throw roomError('A poll can open only while the webinar room is open.', 409);
  }

  const cleanPollId = positiveInt(pollId);

  if (!cleanPollId) {
    throw roomError('Valid webinar poll is required.', 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[poll]] = await connection.query(
      `
      SELECT *
      FROM webinar_polls
      WHERE id = ?
        AND webinar_id = ?
        AND session_id = ?
      FOR UPDATE
      `,
      [cleanPollId, webinarId, sessionId]
    );

    if (!poll) {
      throw roomError('Webinar poll not found.', 404);
    }

    if (status === 'open') {
      const [otherOpen] = await connection.query(
        `
        SELECT id
        FROM webinar_polls
        WHERE session_id = ?
          AND status = 'open'
          AND id <> ?
        FOR UPDATE
        `,
        [sessionId, cleanPollId]
      );

      await connection.query(
        `
        UPDATE webinar_polls
        SET
          status = 'closed',
          closed_at = COALESCE(closed_at, NOW()),
          updated_at = NOW()
        WHERE session_id = ?
          AND status = 'open'
          AND id <> ?
        `,
        [sessionId, cleanPollId]
      );

      for (const other of otherOpen) {
        await appendRoomEvent(
          connection,
          webinarId,
          sessionId,
          'poll.closed',
          Number(other.id),
          { poll_id: Number(other.id) }
        );
      }

      await connection.query(
        `
        UPDATE webinar_polls
        SET
          status = 'open',
          opened_at = COALESCE(opened_at, NOW()),
          closed_at = NULL,
          updated_at = NOW()
        WHERE id = ?
        `,
        [cleanPollId]
      );
    } else {
      await connection.query(
        `
        UPDATE webinar_polls
        SET
          status = 'closed',
          closed_at = COALESCE(closed_at, NOW()),
          updated_at = NOW()
        WHERE id = ?
        `,
        [cleanPollId]
      );
    }

    await appendRoomEvent(
      connection,
      webinarId,
      sessionId,
      status === 'open' ? 'poll.opened' : 'poll.closed',
      cleanPollId,
      { poll_id: cleanPollId }
    );

    await connection.commit();

    const polls = await loadPolls(sessionId);
    return polls.find((item) => item.id === cleanPollId) || null;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  joinRoomByRegistrationToken,
  getAttendeeRoomState,
  heartbeatRoom,
  leaveRoom,
  sendAttendeeChatMessage,
  voteInPoll,
  openWriterRoom,
  endWriterRoom,
  getWriterRoomState,
  sendWriterChatMessage,
  moderateWriterChatMessage,
  createWriterPoll,
  setWriterPollStatus,
};
