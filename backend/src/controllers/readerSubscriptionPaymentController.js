const {
  getReaderSubscriptionCheckoutOptions,
  initializeReaderSubscriptionPurchase,
  reconcileReaderSubscriptionPurchase,
  getReaderSubscriptionPurchaseStatus,
  markReaderSubscriptionPurchaseCancelled,
} = require('../services/readerSubscriptionPaymentService');

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

function redirectToReaderPremium(
  res,
  purchase,
  fallbackStatus = 'pending'
) {
  const status = String(
    purchase?.status || fallbackStatus || 'pending'
  ).toLowerCase();
  const reference = String(purchase?.merchant_reference || '').trim();
  const params = new URLSearchParams();

  params.set('subscription_payment', status);

  if (reference) {
    params.set('purchase_ref', reference);
  }

  return res.redirect(
    302,
    `${frontendOrigin()}/reader/premium?${params.toString()}`
  );
}

function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);
  const safeStatus =
    Number.isInteger(status) && status >= 400 && status <= 599
      ? status
      : 500;

  return res.status(safeStatus).json({
    ok: false,
    message: error?.message || fallback,
  });
}

async function getCheckoutOptions(req, res) {
  try {
    const result = await getReaderSubscriptionCheckoutOptions();

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to load Reader subscription checkout options.'
    );
  }
}

async function initializeCheckout(req, res) {
  try {
    const result = await initializeReaderSubscriptionPurchase({
      readerUserId: req.user.id,
      planId: req.body?.plan_id,
      provider: req.body?.provider,
    });

    return res.status(201).json({
      ok: true,
      message: 'Reader subscription checkout initialized.',
      ...result,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      'Failed to initialize Reader subscription checkout.'
    );
  }
}

async function getCheckoutStatus(req, res) {
  try {
    const purchase = await getReaderSubscriptionPurchaseStatus({
      readerUserId: req.user.id,
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
      'Failed to load Reader subscription purchase status.'
    );
  }
}

async function paystackCallback(req, res) {
  const reference = String(
    req.query?.reference || req.query?.trxref || ''
  ).trim();

  try {
    const purchase = await reconcileReaderSubscriptionPurchase(reference, {
      providerHint: 'paystack',
    });

    return redirectToReaderPremium(res, purchase);
  } catch (error) {
    console.error('reader subscription paystackCallback error:', error);

    if (reference) {
      return redirectToReaderPremium(
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
  const transactionId = String(req.query?.transaction_id || '').trim();
  const status = String(req.query?.status || '').trim().toLowerCase();

  try {
    if (status && status !== 'successful' && status !== 'success') {
      const purchase = await markReaderSubscriptionPurchaseCancelled(reference);
      return redirectToReaderPremium(res, purchase, 'cancelled');
    }

    const purchase = await reconcileReaderSubscriptionPurchase(reference, {
      providerHint: 'flutterwave',
      flutterwaveTransactionId: transactionId || null,
    });

    return redirectToReaderPremium(res, purchase, 'failed');
  } catch (error) {
    console.error('reader subscription flutterwaveCallback error:', error);

    if (reference) {
      return redirectToReaderPremium(
        res,
        { merchant_reference: reference, status: 'failed' },
        'failed'
      );
    }

    return sendError(res, error, 'Flutterwave callback failed.');
  }
}

async function paypalCallback(req, res) {
  const reference = String(req.query?.purchase_ref || '').trim();
  const orderToken = String(req.query?.token || '').trim();

  try {
    const purchase = await reconcileReaderSubscriptionPurchase(reference, {
      providerHint: 'paypal',
      paypalOrderToken: orderToken || null,
    });

    return redirectToReaderPremium(res, purchase, 'failed');
  } catch (error) {
    console.error('reader subscription paypalCallback error:', error);

    if (reference) {
      return redirectToReaderPremium(
        res,
        { merchant_reference: reference, status: 'failed' },
        'failed'
      );
    }

    return sendError(res, error, 'PayPal callback failed.');
  }
}

async function paypalCancel(req, res) {
  const reference = String(req.query?.purchase_ref || '').trim();

  try {
    const purchase = await markReaderSubscriptionPurchaseCancelled(reference);
    return redirectToReaderPremium(res, purchase, 'cancelled');
  } catch (error) {
    console.error('reader subscription paypalCancel error:', error);

    if (reference) {
      return redirectToReaderPremium(
        res,
        { merchant_reference: reference, status: 'cancelled' },
        'cancelled'
      );
    }

    return sendError(res, error, 'PayPal cancellation failed.');
  }
}

module.exports = {
  getCheckoutOptions,
  initializeCheckout,
  getCheckoutStatus,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
};
