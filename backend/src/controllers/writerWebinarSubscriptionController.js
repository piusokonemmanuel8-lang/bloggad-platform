const {
  listActiveWebinarPlans,
} = require('../services/webinarSubscriptionService');
const {
  getWebinarSubscriptionOverview,
} = require('../services/webinarUsageService');
const {
  getWebinarSubscriptionCheckoutOptions,
  initializeWebinarSubscriptionPurchase,
  reconcileWebinarSubscriptionPurchase,
  getWebinarSubscriptionPurchaseStatus,
  markWebinarSubscriptionPurchaseCancelled,
} = require('../services/webinarSubscriptionPaymentService');

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

function redirectToWebinars(
  res,
  purchase,
  fallbackStatus = 'pending'
) {
  const status = String(
    purchase?.status || fallbackStatus || 'pending'
  ).toLowerCase();
  const reference = String(
    purchase?.merchant_reference || ''
  ).trim();
  const params = new URLSearchParams();

  params.set('webinar_subscription_payment', status);

  if (reference) {
    params.set('purchase_ref', reference);
  }

  return res.redirect(
    302,
    `${frontendOrigin()}/writer/webinars?${params.toString()}`
  );
}

async function getPlans(req, res) {
  try {
    const plans = await listActiveWebinarPlans();

    return res.status(200).json({
      ok: true,
      plans,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load webinar plans.');
  }
}

async function getMyOverview(req, res) {
  try {
    const overview = await getWebinarSubscriptionOverview(req.user.id);

    return res.status(200).json({
      ok: true,
      ...overview,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to load webinar subscription overview.'
    );
  }
}

async function getCheckoutOptions(req, res) {
  try {
    const result = await getWebinarSubscriptionCheckoutOptions();

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to load webinar subscription checkout options.'
    );
  }
}

async function initializeCheckout(req, res) {
  try {
    const result = await initializeWebinarSubscriptionPurchase({
      writerUserId: req.user.id,
      planId: req.body?.plan_id,
      provider: req.body?.provider,
    });

    return res.status(201).json({
      ok: true,
      message: 'Webinar subscription checkout initialized.',
      ...result,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to initialize webinar subscription checkout.'
    );
  }
}

async function getCheckoutStatus(req, res) {
  try {
    const purchase = await getWebinarSubscriptionPurchaseStatus({
      writerUserId: req.user.id,
      merchantReference: req.params.reference,
    });

    return res.status(200).json({
      ok: true,
      purchase,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to load webinar subscription purchase status.'
    );
  }
}

async function paystackCallback(req, res) {
  const reference = String(
    req.query?.reference || req.query?.trxref || ''
  ).trim();

  try {
    const purchase = await reconcileWebinarSubscriptionPurchase(
      reference,
      { providerHint: 'paystack' }
    );

    return redirectToWebinars(res, purchase);
  } catch (error) {
    console.error('webinar subscription paystackCallback error:', error);

    if (reference) {
      return redirectToWebinars(
        res,
        { merchant_reference: reference, status: 'failed' },
        'failed'
      );
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
        await markWebinarSubscriptionPurchaseCancelled(reference);
      return redirectToWebinars(res, purchase, 'cancelled');
    }

    const purchase = await reconcileWebinarSubscriptionPurchase(
      reference,
      {
        providerHint: 'flutterwave',
        flutterwaveTransactionId: transactionId || null,
      }
    );

    return redirectToWebinars(res, purchase, 'failed');
  } catch (error) {
    console.error(
      'webinar subscription flutterwaveCallback error:',
      error
    );

    if (reference) {
      return redirectToWebinars(
        res,
        { merchant_reference: reference, status: 'failed' },
        'failed'
      );
    }

    return sendError(res, error, 'Flutterwave callback failed.');
  }
}

async function paypalCallback(req, res) {
  const reference = String(
    req.query?.purchase_ref || ''
  ).trim();
  const orderToken = String(req.query?.token || '').trim();

  try {
    const purchase = await reconcileWebinarSubscriptionPurchase(
      reference,
      {
        providerHint: 'paypal',
        paypalOrderToken: orderToken || null,
      }
    );

    return redirectToWebinars(res, purchase, 'failed');
  } catch (error) {
    console.error('webinar subscription paypalCallback error:', error);

    if (reference) {
      return redirectToWebinars(
        res,
        { merchant_reference: reference, status: 'failed' },
        'failed'
      );
    }

    return sendError(res, error, 'PayPal callback failed.');
  }
}

async function paypalCancel(req, res) {
  const reference = String(
    req.query?.purchase_ref || ''
  ).trim();

  try {
    const purchase =
      await markWebinarSubscriptionPurchaseCancelled(reference);

    return redirectToWebinars(res, purchase, 'cancelled');
  } catch (error) {
    console.error('webinar subscription paypalCancel error:', error);

    if (reference) {
      return redirectToWebinars(
        res,
        { merchant_reference: reference, status: 'cancelled' },
        'cancelled'
      );
    }

    return sendError(res, error, 'PayPal cancellation failed.');
  }
}

module.exports = {
  getPlans,
  getMyOverview,
  getCheckoutOptions,
  initializeCheckout,
  getCheckoutStatus,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
};
