const crypto = require('crypto');
const pool = require('../config/db');
const {
  cleanText,
  normalizeEmail,
  loadPublicWebinar,
  loadRegistrationByToken,
  sanitizeRegistration,
} = require('../services/webinarRegistrationService');
const {
  getWebinarRegistrationCheckoutOptions,
  initializeWebinarRegistrationPurchase,
  reconcileWebinarRegistrationPurchase,
  markWebinarRegistrationPurchaseCancelled,
  loadPurchaseByReference,
} = require('../services/webinarRegistrationPaymentService');
const {
  joinRoomByRegistrationToken,
  getAttendeeRoomState,
  heartbeatRoom,
  leaveRoom,
  sendAttendeeChatMessage,
  voteInPoll,
} = require('../services/webinarRoomService');
const {
  applyWebinarPlaybackCookies,
} = require('../services/webinarCloudFrontSigningService');

function frontendOrigin() {
  const raw = String(process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '');

  try {
    return new URL(raw).origin;
  } catch {
    return 'http://localhost:5173';
  }
}

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

function redirectToWebinar(res, purchase, fallbackStatus = 'pending') {
  const status = String(
    purchase?.status || fallbackStatus || 'pending'
  ).toLowerCase();
  const pageSlug = String(purchase?.writer_page_slug || '').trim();
  const webinarSlug = String(purchase?.webinar_slug || '').trim();
  const token = String(purchase?.registration_token || '').trim();
  const params = new URLSearchParams();

  params.set('registration_payment', status);

  if (token) {
    params.set('registration_token', token);
  }

  if (!pageSlug || !webinarSlug) {
    return res.redirect(302, `${frontendOrigin()}/?${params.toString()}`);
  }

  return res.redirect(
    302,
    `${frontendOrigin()}/webinars/${encodeURIComponent(pageSlug)}/${encodeURIComponent(webinarSlug)}?${params.toString()}`
  );
}

async function getPublicWebinar(req, res) {
  try {
    const webinar = await loadPublicWebinar(
      req.params.writerPageSlug,
      req.params.webinarSlug
    );

    if (!webinar) {
      return res.status(404).json({
        ok: false,
        message: 'Webinar not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      webinar: {
        id: Number(webinar.id),
        writer_page: {
          id: Number(webinar.writer_page_id),
          name: webinar.writer_page_name,
          slug: webinar.writer_page_slug,
        },
        title: webinar.title,
        slug: webinar.slug,
        description: webinar.description,
        webinar_type: webinar.webinar_type,
        visibility: webinar.visibility,
        status: webinar.status,
        timezone: webinar.timezone,
        scheduled_start_at: webinar.scheduled_start_at,
        allow_registration: Number(webinar.allow_registration || 0) === 1,
        allow_chat: Number(webinar.allow_chat || 0) === 1,
        registration_mode: webinar.registration_mode,
        ticket_price_usd: webinar.ticket_price_usd,
        ticket_currency_code: webinar.ticket_currency_code,
        published_at: webinar.published_at,
        registration_open: webinar.registration_open,
        session: webinar.session_id
          ? {
              id: Number(webinar.session_id),
              session_type: webinar.session_type,
              status: webinar.session_status,
              scheduled_start_at: webinar.session_scheduled_start_at,
            }
          : null,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load webinar.');
  }
}

async function registerForWebinar(req, res) {
  try {
    const webinar = await loadPublicWebinar(
      req.params.writerPageSlug,
      req.params.webinarSlug
    );

    if (!webinar) {
      return res.status(404).json({
        ok: false,
        message: 'Webinar not found.',
      });
    }

    if (!webinar.registration_open) {
      return res.status(409).json({
        ok: false,
        code: 'WEBINAR_REGISTRATION_CLOSED',
        message: 'Registration is not currently open for this webinar.',
      });
    }

    const attendeeName = cleanText(req.body?.attendee_name, 255);
    const attendeeEmail = normalizeEmail(req.body?.attendee_email);

    if (!attendeeName || !attendeeEmail) {
      return res.status(400).json({
        ok: false,
        message: 'Valid attendee name and email are required.',
      });
    }

    let created = false;
    let [[registration]] = await pool.query(
      `
      SELECT *
      FROM webinar_registrations
      WHERE webinar_id = ?
        AND attendee_email = ?
      LIMIT 1
      `,
      [webinar.id, attendeeEmail]
    );

    if (!registration) {
      const token = crypto.randomBytes(32).toString('hex');
      const paid = webinar.registration_mode === 'paid';

      try {
        const [result] = await pool.query(
          `
          INSERT INTO webinar_registrations (
            webinar_id,
            session_id,
            user_id,
            attendee_name,
            attendee_email,
            source,
            registration_token,
            status,
            payment_status,
            confirmed_at,
            registered_at,
            created_at,
            updated_at
          )
          VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
          `,
          [
            webinar.id,
            webinar.session_id || null,
            attendeeName,
            attendeeEmail,
            cleanText(req.body?.source, 100) || 'public_webinar',
            token,
            paid ? 'pending' : 'confirmed',
            paid ? 'pending' : 'not_required',
            paid ? null : new Date(),
          ]
        );

        created = true;

        [[registration]] = await pool.query(
          `
          SELECT *
          FROM webinar_registrations
          WHERE id = ?
          LIMIT 1
          `,
          [result.insertId]
        );
      } catch (error) {
        if (error?.code !== 'ER_DUP_ENTRY') throw error;

        [[registration]] = await pool.query(
          `
          SELECT *
          FROM webinar_registrations
          WHERE webinar_id = ?
            AND attendee_email = ?
          LIMIT 1
          `,
          [webinar.id, attendeeEmail]
        );
      }
    }

    const requiresPayment =
      webinar.registration_mode === 'paid' &&
      registration.payment_status !== 'paid';

    return res.status(created ? 201 : 200).json({
      ok: true,
      registration: sanitizeRegistration(registration),
      requires_payment: requiresPayment,
      ticket: {
        mode: webinar.registration_mode,
        price_usd: webinar.ticket_price_usd,
        currency_code: webinar.ticket_currency_code,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Failed to register for webinar.');
  }
}

async function getRegistrationStatus(req, res) {
  try {
    const registration = await loadRegistrationByToken(req.params.token);

    if (!registration) {
      return res.status(404).json({
        ok: false,
        message: 'Webinar registration not found.',
      });
    }

    const [[latestPurchase]] = await pool.query(
      `
      SELECT
        provider,
        merchant_reference,
        expected_amount_usd,
        currency_code,
        status,
        paid_at
      FROM webinar_registration_purchases
      WHERE registration_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [registration.id]
    );

    return res.status(200).json({
      ok: true,
      registration: sanitizeRegistration(registration),
      webinar: {
        title: registration.webinar_title,
        slug: registration.webinar_slug,
        writer_page_slug: registration.writer_page_slug,
        registration_mode: registration.registration_mode,
        ticket_price_usd: Number(
          registration.ticket_price_usd || 0
        ).toFixed(2),
        ticket_currency_code:
          registration.ticket_currency_code || 'USD',
      },
      latest_purchase: latestPurchase || null,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to load webinar registration status.'
    );
  }
}

async function getCheckoutOptions(req, res) {
  try {
    const result = await getWebinarRegistrationCheckoutOptions();

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load payment gateways.');
  }
}

async function initializeCheckout(req, res) {
  try {
    const result = await initializeWebinarRegistrationPurchase({
      registrationToken: req.params.token,
      provider: req.body?.provider,
    });

    return res.status(201).json({
      ok: true,
      message: 'Webinar registration checkout initialized.',
      ...result,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to initialize webinar registration checkout.'
    );
  }
}

async function paystackCallback(req, res) {
  const reference = String(
    req.query?.reference || req.query?.trxref || ''
  ).trim();

  try {
    const purchase = await reconcileWebinarRegistrationPurchase(
      reference,
      { providerHint: 'paystack' }
    );

    return redirectToWebinar(res, purchase);
  } catch (error) {
    if (reference) {
      const purchase = await loadPurchaseByReference(reference);
      if (purchase) return redirectToWebinar(res, purchase, 'failed');
    }

    return sendError(res, error, 'Paystack callback failed.');
  }
}

async function flutterwaveCallback(req, res) {
  const reference = String(req.query?.tx_ref || '').trim();
  const transactionId = String(
    req.query?.transaction_id || ''
  ).trim();
  const status = String(req.query?.status || '')
    .trim()
    .toLowerCase();

  try {
    if (status && status !== 'successful' && status !== 'success') {
      const purchase =
        await markWebinarRegistrationPurchaseCancelled(reference);
      return redirectToWebinar(res, purchase, 'cancelled');
    }

    const purchase = await reconcileWebinarRegistrationPurchase(
      reference,
      {
        providerHint: 'flutterwave',
        flutterwaveTransactionId: transactionId || null,
      }
    );

    return redirectToWebinar(res, purchase, 'failed');
  } catch (error) {
    if (reference) {
      const purchase = await loadPurchaseByReference(reference);
      if (purchase) return redirectToWebinar(res, purchase, 'failed');
    }

    return sendError(res, error, 'Flutterwave callback failed.');
  }
}

async function paypalCallback(req, res) {
  const reference = String(req.query?.purchase_ref || '').trim();
  const orderToken = String(req.query?.token || '').trim();

  try {
    const purchase = await reconcileWebinarRegistrationPurchase(
      reference,
      {
        providerHint: 'paypal',
        paypalOrderToken: orderToken || null,
      }
    );

    return redirectToWebinar(res, purchase, 'failed');
  } catch (error) {
    if (reference) {
      const purchase = await loadPurchaseByReference(reference);
      if (purchase) return redirectToWebinar(res, purchase, 'failed');
    }

    return sendError(res, error, 'PayPal callback failed.');
  }
}

async function paypalCancel(req, res) {
  const reference = String(req.query?.purchase_ref || '').trim();

  try {
    const purchase =
      await markWebinarRegistrationPurchaseCancelled(reference);

    return redirectToWebinar(res, purchase, 'cancelled');
  } catch (error) {
    return sendError(res, error, 'PayPal cancellation failed.');
  }
}


async function joinWebinarRoom(req, res) {
  try {
    const result = await joinRoomByRegistrationToken(req.params.token);

    applyWebinarPlaybackCookies(res, result);

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to enter webinar room.');
  }
}

async function getWebinarRoomState(req, res) {
  try {
    const result = await getAttendeeRoomState(
      req.params.visitorToken,
      req.query?.cursor || 0
    );

    applyWebinarPlaybackCookies(res, result);

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load webinar room.');
  }
}

async function heartbeatWebinarRoom(req, res) {
  try {
    const attendance = await heartbeatRoom(req.params.visitorToken);

    return res.status(200).json({
      ok: true,
      attendance,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update webinar presence.');
  }
}

async function leaveWebinarRoom(req, res) {
  try {
    const attendance = await leaveRoom(req.params.visitorToken);

    return res.status(200).json({
      ok: true,
      attendance,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to leave webinar room.');
  }
}

async function sendWebinarRoomChat(req, res) {
  try {
    const message = await sendAttendeeChatMessage(
      req.params.visitorToken,
      req.body?.message
    );

    return res.status(201).json({
      ok: true,
      message,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to send webinar chat message.');
  }
}

async function voteWebinarRoomPoll(req, res) {
  try {
    const result = await voteInPoll(
      req.params.visitorToken,
      req.params.pollId,
      req.body?.option_id
    );

    return res.status(201).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to record webinar poll vote.');
  }
}

module.exports = {
  getPublicWebinar,
  registerForWebinar,
  getRegistrationStatus,
  getCheckoutOptions,
  initializeCheckout,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
  joinWebinarRoom,
  getWebinarRoomState,
  heartbeatWebinarRoom,
  leaveWebinarRoom,
  sendWebinarRoomChat,
  voteWebinarRoomPoll,
};
