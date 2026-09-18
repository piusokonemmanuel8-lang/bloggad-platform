const pool = require('../config/db');

function positiveInt(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function fixedPercent(value) {
  return Number(numberValue(value).toFixed(2));
}

function ratioPercent(numerator, denominator) {
  const top = numberValue(numerator);
  const bottom = numberValue(denominator);

  if (bottom <= 0) return 0;
  return Number(((top / bottom) * 100).toFixed(2));
}

function formatMoney(value) {
  return numberValue(value).toFixed(2);
}

async function getWriterWebinarAnalyticsOverview(writerUserId) {
  const cleanWriterUserId = positiveInt(writerUserId);

  if (!cleanWriterUserId) {
    const error = new Error('Valid Writer user id is required.');
    error.status = 400;
    throw error;
  }

  const [[webinars]] = await pool.query(
    `
    SELECT
      COUNT(*) AS total_webinars,
      SUM(CASE WHEN published_at IS NOT NULL THEN 1 ELSE 0 END) AS published_webinars,
      SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) AS live_webinars,
      SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) AS ended_webinars,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_webinars
    FROM webinars
    WHERE user_id = ?
    `,
    [cleanWriterUserId]
  );

  const [[registrations]] = await pool.query(
    `
    SELECT
      COUNT(*) AS total_registrations,
      SUM(CASE WHEN wr.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_registrations,
      SUM(CASE WHEN wr.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_registrations,
      SUM(CASE WHEN wr.payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_registrations,
      SUM(CASE WHEN wr.payment_status = 'pending' THEN 1 ELSE 0 END) AS pending_payments
    FROM webinar_registrations wr
    INNER JOIN webinars w
      ON w.id = wr.webinar_id
    WHERE w.user_id = ?
    `,
    [cleanWriterUserId]
  );

  const [[revenue]] = await pool.query(
    `
    SELECT
      COUNT(*) AS paid_purchases,
      COALESCE(SUM(p.expected_amount_usd), 0) AS gross_paid_usd
    FROM webinar_registration_purchases p
    INNER JOIN webinars w
      ON w.id = p.webinar_id
    WHERE w.user_id = ?
      AND p.status = 'paid'
    `,
    [cleanWriterUserId]
  );

  const [[attendance]] = await pool.query(
    `
    SELECT
      COUNT(*) AS attendance_records,
      COUNT(DISTINCT wa.registration_id) AS registered_attendees,
      COALESCE(SUM(wa.watch_seconds), 0) AS total_watch_seconds,
      COALESCE(AVG(wa.watch_seconds), 0) AS average_watch_seconds,
      COALESCE(AVG(wa.completed_percent), 0) AS average_completed_percent,
      SUM(
        CASE
          WHEN wa.left_at IS NULL
            AND wa.last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND)
          THEN 1
          ELSE 0
        END
      ) AS current_viewers
    FROM webinar_attendance wa
    INNER JOIN webinars w
      ON w.id = wa.webinar_id
    WHERE w.user_id = ?
    `,
    [cleanWriterUserId]
  );

  const [[engagement]] = await pool.query(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM webinar_chat_messages cm
        INNER JOIN webinars w1
          ON w1.id = cm.webinar_id
        WHERE w1.user_id = ?
          AND cm.status = 'active'
      ) AS active_chat_messages,
      (
        SELECT COUNT(DISTINCT cm.attendance_id)
        FROM webinar_chat_messages cm
        INNER JOIN webinars w2
          ON w2.id = cm.webinar_id
        WHERE w2.user_id = ?
          AND cm.status = 'active'
          AND cm.sender_type = 'attendee'
          AND cm.attendance_id IS NOT NULL
      ) AS attendee_chatters,
      (
        SELECT COUNT(*)
        FROM webinar_polls wp
        INNER JOIN webinars w3
          ON w3.id = wp.webinar_id
        WHERE w3.user_id = ?
      ) AS polls_created,
      (
        SELECT COUNT(*)
        FROM webinar_poll_votes pv
        INNER JOIN webinars w4
          ON w4.id = pv.webinar_id
        WHERE w4.user_id = ?
      ) AS poll_votes
    `,
    [
      cleanWriterUserId,
      cleanWriterUserId,
      cleanWriterUserId,
      cleanWriterUserId,
    ]
  );

  const confirmed = numberValue(registrations?.confirmed_registrations);
  const attended = numberValue(attendance?.registered_attendees);

  return {
    webinars: {
      total: numberValue(webinars?.total_webinars),
      published: numberValue(webinars?.published_webinars),
      live: numberValue(webinars?.live_webinars),
      ended: numberValue(webinars?.ended_webinars),
      scheduled: numberValue(webinars?.scheduled_webinars),
    },
    registrations: {
      total: numberValue(registrations?.total_registrations),
      confirmed,
      cancelled: numberValue(registrations?.cancelled_registrations),
      paid: numberValue(registrations?.paid_registrations),
      pending_payments: numberValue(registrations?.pending_payments),
      attended_registered: attended,
      show_up_rate_percent: ratioPercent(attended, confirmed),
    },
    revenue: {
      currency: 'USD',
      paid_purchases: numberValue(revenue?.paid_purchases),
      gross_paid_usd: formatMoney(revenue?.gross_paid_usd),
    },
    attendance: {
      attendance_records: numberValue(attendance?.attendance_records),
      registered_attendees: attended,
      current_viewers: numberValue(attendance?.current_viewers),
      total_watch_seconds: numberValue(attendance?.total_watch_seconds),
      average_watch_seconds: fixedPercent(attendance?.average_watch_seconds),
      average_completed_percent: fixedPercent(
        attendance?.average_completed_percent
      ),
    },
    engagement: {
      active_chat_messages: numberValue(engagement?.active_chat_messages),
      attendee_chatters: numberValue(engagement?.attendee_chatters),
      polls_created: numberValue(engagement?.polls_created),
      poll_votes: numberValue(engagement?.poll_votes),
    },
  };
}

async function getWebinarAnalytics(webinarId) {
  const cleanWebinarId = positiveInt(webinarId);

  if (!cleanWebinarId) {
    const error = new Error('Valid webinar id is required.');
    error.status = 400;
    throw error;
  }

  const [[webinar]] = await pool.query(
    `
    SELECT
      id,
      title,
      slug,
      webinar_type,
      visibility,
      status,
      timezone,
      scheduled_start_at,
      duration_seconds,
      registration_mode,
      ticket_price_usd,
      ticket_currency_code,
      published_at,
      created_at,
      updated_at
    FROM webinars
    WHERE id = ?
    LIMIT 1
    `,
    [cleanWebinarId]
  );

  if (!webinar) {
    const error = new Error('Writer webinar not found.');
    error.status = 404;
    throw error;
  }

  const [[registrations]] = await pool.query(
    `
    SELECT
      COUNT(*) AS total_registrations,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_registrations,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_registrations,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_registrations,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_registrations,
      SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pending_payments
    FROM webinar_registrations
    WHERE webinar_id = ?
    `,
    [cleanWebinarId]
  );

  const [[revenue]] = await pool.query(
    `
    SELECT
      COUNT(*) AS paid_purchases,
      COALESCE(SUM(expected_amount_usd), 0) AS gross_paid_usd
    FROM webinar_registration_purchases
    WHERE webinar_id = ?
      AND status = 'paid'
    `,
    [cleanWebinarId]
  );

  const [[attendance]] = await pool.query(
    `
    SELECT
      COUNT(*) AS attendance_records,
      COUNT(DISTINCT registration_id) AS registered_attendees,
      COALESCE(SUM(watch_seconds), 0) AS total_watch_seconds,
      COALESCE(AVG(watch_seconds), 0) AS average_watch_seconds,
      COALESCE(AVG(completed_percent), 0) AS average_completed_percent,
      SUM(CASE WHEN completed_percent >= 90 THEN 1 ELSE 0 END) AS completed_90_percent,
      SUM(
        CASE
          WHEN left_at IS NULL
            AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND)
          THEN 1
          ELSE 0
        END
      ) AS current_viewers
    FROM webinar_attendance
    WHERE webinar_id = ?
    `,
    [cleanWebinarId]
  );

  const [[engagement]] = await pool.query(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM webinar_chat_messages
        WHERE webinar_id = ?
          AND status = 'active'
      ) AS active_chat_messages,
      (
        SELECT COUNT(*)
        FROM webinar_chat_messages
        WHERE webinar_id = ?
          AND status = 'active'
          AND sender_type = 'attendee'
      ) AS attendee_chat_messages,
      (
        SELECT COUNT(DISTINCT attendance_id)
        FROM webinar_chat_messages
        WHERE webinar_id = ?
          AND status = 'active'
          AND sender_type = 'attendee'
          AND attendance_id IS NOT NULL
      ) AS attendee_chatters,
      (
        SELECT COUNT(*)
        FROM webinar_polls
        WHERE webinar_id = ?
      ) AS polls_created,
      (
        SELECT COUNT(*)
        FROM webinar_polls
        WHERE webinar_id = ?
          AND status = 'open'
      ) AS open_polls,
      (
        SELECT COUNT(*)
        FROM webinar_poll_votes
        WHERE webinar_id = ?
      ) AS poll_votes,
      (
        SELECT COUNT(DISTINCT attendance_id)
        FROM webinar_poll_votes
        WHERE webinar_id = ?
      ) AS poll_voters
    `,
    [
      cleanWebinarId,
      cleanWebinarId,
      cleanWebinarId,
      cleanWebinarId,
      cleanWebinarId,
      cleanWebinarId,
      cleanWebinarId,
    ]
  );

  const [sessions] = await pool.query(
    `
    SELECT
      ws.id,
      ws.session_key,
      ws.session_type,
      ws.status,
      ws.scheduled_start_at,
      ws.started_at,
      ws.ended_at,
      ws.created_at,
      (
        SELECT COUNT(*)
        FROM webinar_registrations wr
        WHERE wr.session_id = ws.id
      ) AS registrations,
      (
        SELECT COUNT(*)
        FROM webinar_attendance wa
        WHERE wa.session_id = ws.id
      ) AS attendance_records,
      (
        SELECT COALESCE(SUM(wa.watch_seconds), 0)
        FROM webinar_attendance wa
        WHERE wa.session_id = ws.id
      ) AS total_watch_seconds,
      (
        SELECT COALESCE(AVG(wa.completed_percent), 0)
        FROM webinar_attendance wa
        WHERE wa.session_id = ws.id
      ) AS average_completed_percent,
      (
        SELECT COUNT(*)
        FROM webinar_chat_messages cm
        WHERE cm.session_id = ws.id
          AND cm.status = 'active'
      ) AS active_chat_messages,
      (
        SELECT COUNT(*)
        FROM webinar_polls wp
        WHERE wp.session_id = ws.id
      ) AS polls,
      (
        SELECT COUNT(*)
        FROM webinar_poll_votes pv
        WHERE pv.session_id = ws.id
      ) AS poll_votes
    FROM webinar_sessions ws
    WHERE ws.webinar_id = ?
    ORDER BY ws.id DESC
    `,
    [cleanWebinarId]
  );

  const [sources] = await pool.query(
    `
    SELECT
      COALESCE(NULLIF(TRIM(source), ''), 'direct') AS source,
      COUNT(*) AS registrations
    FROM webinar_registrations
    WHERE webinar_id = ?
    GROUP BY COALESCE(NULLIF(TRIM(source), ''), 'direct')
    ORDER BY registrations DESC, source ASC
    `,
    [cleanWebinarId]
  );

  const [providers] = await pool.query(
    `
    SELECT
      provider,
      COUNT(*) AS paid_purchases,
      COALESCE(SUM(expected_amount_usd), 0) AS gross_paid_usd
    FROM webinar_registration_purchases
    WHERE webinar_id = ?
      AND status = 'paid'
    GROUP BY provider
    ORDER BY gross_paid_usd DESC, provider ASC
    `,
    [cleanWebinarId]
  );

  const [[retention]] = await pool.query(
    `
    SELECT
      SUM(CASE WHEN completed_percent < 25 THEN 1 ELSE 0 END) AS under_25,
      SUM(CASE WHEN completed_percent >= 25 AND completed_percent < 50 THEN 1 ELSE 0 END) AS from_25_to_49,
      SUM(CASE WHEN completed_percent >= 50 AND completed_percent < 75 THEN 1 ELSE 0 END) AS from_50_to_74,
      SUM(CASE WHEN completed_percent >= 75 AND completed_percent < 90 THEN 1 ELSE 0 END) AS from_75_to_89,
      SUM(CASE WHEN completed_percent >= 90 THEN 1 ELSE 0 END) AS from_90_to_100
    FROM webinar_attendance
    WHERE webinar_id = ?
    `,
    [cleanWebinarId]
  );

  const confirmed = numberValue(registrations?.confirmed_registrations);
  const attended = numberValue(attendance?.registered_attendees);
  const attendanceRecords = numberValue(attendance?.attendance_records);
  const attendeeChatters = numberValue(engagement?.attendee_chatters);
  const pollVoters = numberValue(engagement?.poll_voters);

  return {
    webinar: {
      ...webinar,
      id: Number(webinar.id),
      duration_seconds:
        webinar.duration_seconds === null
          ? null
          : numberValue(webinar.duration_seconds),
      ticket_price_usd: formatMoney(webinar.ticket_price_usd),
    },
    registrations: {
      total: numberValue(registrations?.total_registrations),
      confirmed,
      pending: numberValue(registrations?.pending_registrations),
      cancelled: numberValue(registrations?.cancelled_registrations),
      paid: numberValue(registrations?.paid_registrations),
      pending_payments: numberValue(registrations?.pending_payments),
      attended_registered: attended,
      show_up_rate_percent: ratioPercent(attended, confirmed),
    },
    revenue: {
      currency: 'USD',
      paid_purchases: numberValue(revenue?.paid_purchases),
      gross_paid_usd: formatMoney(revenue?.gross_paid_usd),
    },
    attendance: {
      attendance_records: attendanceRecords,
      registered_attendees: attended,
      current_viewers: numberValue(attendance?.current_viewers),
      total_watch_seconds: numberValue(attendance?.total_watch_seconds),
      average_watch_seconds: fixedPercent(attendance?.average_watch_seconds),
      average_completed_percent: fixedPercent(
        attendance?.average_completed_percent
      ),
      completed_90_percent: numberValue(attendance?.completed_90_percent),
    },
    engagement: {
      active_chat_messages: numberValue(engagement?.active_chat_messages),
      attendee_chat_messages: numberValue(
        engagement?.attendee_chat_messages
      ),
      attendee_chatters: attendeeChatters,
      chat_participation_rate_percent: ratioPercent(
        attendeeChatters,
        attendanceRecords
      ),
      polls_created: numberValue(engagement?.polls_created),
      open_polls: numberValue(engagement?.open_polls),
      poll_votes: numberValue(engagement?.poll_votes),
      poll_voters: pollVoters,
      poll_participation_rate_percent: ratioPercent(
        pollVoters,
        attendanceRecords
      ),
    },
    retention: {
      under_25_percent: numberValue(retention?.under_25),
      from_25_to_49_percent: numberValue(retention?.from_25_to_49),
      from_50_to_74_percent: numberValue(retention?.from_50_to_74),
      from_75_to_89_percent: numberValue(retention?.from_75_to_89),
      from_90_to_100_percent: numberValue(retention?.from_90_to_100),
    },
    registration_sources: sources.map((row) => ({
      source: row.source,
      registrations: numberValue(row.registrations),
    })),
    payment_providers: providers.map((row) => ({
      provider: row.provider,
      paid_purchases: numberValue(row.paid_purchases),
      gross_paid_usd: formatMoney(row.gross_paid_usd),
    })),
    sessions: sessions.map((row) => ({
      ...row,
      id: Number(row.id),
      registrations: numberValue(row.registrations),
      attendance_records: numberValue(row.attendance_records),
      total_watch_seconds: numberValue(row.total_watch_seconds),
      average_completed_percent: fixedPercent(
        row.average_completed_percent
      ),
      active_chat_messages: numberValue(row.active_chat_messages),
      polls: numberValue(row.polls),
      poll_votes: numberValue(row.poll_votes),
    })),
  };
}

async function getWebinarSessionAnalytics(webinarId, sessionId) {
  const cleanWebinarId = positiveInt(webinarId);
  const cleanSessionId = positiveInt(sessionId);

  if (!cleanWebinarId || !cleanSessionId) {
    const error = new Error('Valid webinar and session ids are required.');
    error.status = 400;
    throw error;
  }

  const [[session]] = await pool.query(
    `
    SELECT
      id,
      webinar_id,
      session_key,
      session_type,
      status,
      scheduled_start_at,
      started_at,
      ended_at,
      created_at,
      updated_at
    FROM webinar_sessions
    WHERE id = ?
      AND webinar_id = ?
    LIMIT 1
    `,
    [cleanSessionId, cleanWebinarId]
  );

  if (!session) {
    const error = new Error('Webinar session not found.');
    error.status = 404;
    throw error;
  }

  const [[attendance]] = await pool.query(
    `
    SELECT
      COUNT(*) AS attendance_records,
      COUNT(DISTINCT registration_id) AS registered_attendees,
      COALESCE(SUM(watch_seconds), 0) AS total_watch_seconds,
      COALESCE(AVG(watch_seconds), 0) AS average_watch_seconds,
      COALESCE(AVG(completed_percent), 0) AS average_completed_percent,
      SUM(CASE WHEN completed_percent >= 90 THEN 1 ELSE 0 END) AS completed_90_percent,
      SUM(
        CASE
          WHEN left_at IS NULL
            AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND)
          THEN 1
          ELSE 0
        END
      ) AS current_viewers
    FROM webinar_attendance
    WHERE webinar_id = ?
      AND session_id = ?
    `,
    [cleanWebinarId, cleanSessionId]
  );

  const [[registration]] = await pool.query(
    `
    SELECT
      COUNT(*) AS registrations,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_registrations
    FROM webinar_registrations
    WHERE webinar_id = ?
      AND session_id = ?
    `,
    [cleanWebinarId, cleanSessionId]
  );

  const [[chat]] = await pool.query(
    `
    SELECT
      COUNT(*) AS active_messages,
      SUM(CASE WHEN sender_type = 'attendee' THEN 1 ELSE 0 END) AS attendee_messages,
      SUM(CASE WHEN sender_type = 'host' THEN 1 ELSE 0 END) AS host_messages,
      COUNT(
        DISTINCT CASE
          WHEN sender_type = 'attendee' THEN attendance_id
          ELSE NULL
        END
      ) AS attendee_chatters
    FROM webinar_chat_messages
    WHERE webinar_id = ?
      AND session_id = ?
      AND status = 'active'
    `,
    [cleanWebinarId, cleanSessionId]
  );

  const [pollRows] = await pool.query(
    `
    SELECT
      wp.id,
      wp.question,
      wp.status,
      wp.opened_at,
      wp.closed_at,
      wp.created_at,
      wpo.id AS option_id,
      wpo.option_text,
      wpo.sort_order,
      COUNT(wpv.id) AS vote_count
    FROM webinar_polls wp
    LEFT JOIN webinar_poll_options wpo
      ON wpo.poll_id = wp.id
    LEFT JOIN webinar_poll_votes wpv
      ON wpv.poll_id = wp.id
      AND wpv.option_id = wpo.id
    WHERE wp.webinar_id = ?
      AND wp.session_id = ?
    GROUP BY
      wp.id,
      wp.question,
      wp.status,
      wp.opened_at,
      wp.closed_at,
      wp.created_at,
      wpo.id,
      wpo.option_text,
      wpo.sort_order
    ORDER BY wp.id DESC, wpo.sort_order ASC, wpo.id ASC
    `,
    [cleanWebinarId, cleanSessionId]
  );

  const polls = [];
  const pollMap = new Map();

  for (const row of pollRows) {
    const pollId = Number(row.id);
    let poll = pollMap.get(pollId);

    if (!poll) {
      poll = {
        id: pollId,
        question: row.question,
        status: row.status,
        opened_at: row.opened_at,
        closed_at: row.closed_at,
        created_at: row.created_at,
        total_votes: 0,
        options: [],
      };
      pollMap.set(pollId, poll);
      polls.push(poll);
    }

    if (row.option_id !== null) {
      const voteCount = numberValue(row.vote_count);
      poll.total_votes += voteCount;
      poll.options.push({
        id: Number(row.option_id),
        option_text: row.option_text,
        sort_order: numberValue(row.sort_order),
        vote_count: voteCount,
      });
    }
  }

  const confirmed = numberValue(registration?.confirmed_registrations);
  const attended = numberValue(attendance?.registered_attendees);
  const attendanceRecords = numberValue(attendance?.attendance_records);
  const attendeeChatters = numberValue(chat?.attendee_chatters);

  return {
    session: {
      ...session,
      id: Number(session.id),
      webinar_id: Number(session.webinar_id),
    },
    registrations: {
      total: numberValue(registration?.registrations),
      confirmed,
      attended_registered: attended,
      show_up_rate_percent: ratioPercent(attended, confirmed),
    },
    attendance: {
      attendance_records: attendanceRecords,
      registered_attendees: attended,
      current_viewers: numberValue(attendance?.current_viewers),
      total_watch_seconds: numberValue(attendance?.total_watch_seconds),
      average_watch_seconds: fixedPercent(attendance?.average_watch_seconds),
      average_completed_percent: fixedPercent(
        attendance?.average_completed_percent
      ),
      completed_90_percent: numberValue(attendance?.completed_90_percent),
    },
    chat: {
      active_messages: numberValue(chat?.active_messages),
      attendee_messages: numberValue(chat?.attendee_messages),
      host_messages: numberValue(chat?.host_messages),
      attendee_chatters: attendeeChatters,
      participation_rate_percent: ratioPercent(
        attendeeChatters,
        attendanceRecords
      ),
    },
    polls,
  };
}

module.exports = {
  getWriterWebinarAnalyticsOverview,
  getWebinarAnalytics,
  getWebinarSessionAnalytics,
};
