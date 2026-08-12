const {
  getReaderCreditTopUpOptions,
  initializeReaderCreditPurchase,
  reconcileReaderCreditPurchase,
  getReaderCreditPurchaseStatus,
  markReaderCreditPurchaseCancelled,
} = require('../services/readerCreditPaymentService');

function redirectToReaderCredits(res, purchase, fallbackStatus = 'pending') {
  const raw = String(process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '');

  let base = 'http://localhost:5173';
  try {
    base = new URL(raw).origin;
  } catch {}

  const url = new URL('/reader/credits', base);
  const status = String(purchase?.status || fallbackStatus || 'pending');

  url.searchParams.set('topup', status);

  if (purchase?.merchant_reference) {
    url.searchParams.set(
      'purchase_ref',
      String(purchase.merchant_reference)
    );
  }

  return res.redirect(302, url.toString());
}

async function getTopUpOptions(req, res) {
  try {
    const options = await getReaderCreditTopUpOptions();

    return res.status(200).json({
      ok: true,
      ...options,
    });
  } catch (error) {
    console.error('getTopUpOptions error:', error);

    return res.status(500).json({
      ok: false,
      message: error.message || 'Failed to load Reader credit purchase options.',
    });
  }
}

async function initializeTopUp(req, res) {
  try {
    const result = await initializeReaderCreditPurchase({
      readerUserId: req.user.id,
      credits: req.body?.credits,
      provider: req.body?.provider,
    });

    return res.status(201).json({
      ok: true,
      message: 'Reader credit checkout initialized.',
      ...result,
    });
  } catch (error) {
    console.error('initializeTopUp error:', error);

    const message =
      error.message || 'Failed to initialize Reader credit checkout.';

    const status = /required|select|unsupported|between|disabled|incomplete|configured/i.test(
      message
    )
      ? 400
      : 500;

    return res.status(status).json({
      ok: false,
      message,
    });
  }
}

async function getTopUpStatus(req, res) {
  try {
    const purchase = await getReaderCreditPurchaseStatus({
      readerUserId: req.user.id,
      merchantReference: req.params?.reference,
      reconcile: true,
    });

    return res.status(200).json({
      ok: true,
      purchase,
    });
  } catch (error) {
    console.error('getTopUpStatus error:', error);

    const message =
      error.message || 'Failed to load Reader credit purchase status.';

    return res.status(/not found/i.test(message) ? 404 : 500).json({
      ok: false,
      message,
    });
  }
}

async function paystackCallback(req, res) {
  const reference = String(
    req.query?.reference || req.query?.trxref || ''
  ).trim();

  try {
    const purchase = await reconcileReaderCreditPurchase(reference, {
      providerHint: 'paystack',
    });

    return redirectToReaderCredits(res, purchase);
  } catch (error) {
    console.error('paystackCallback error:', error);

    return redirectToReaderCredits(
      res,
      {
        merchant_reference: reference,
        status: 'pending',
      },
      'pending'
    );
  }
}

async function flutterwaveCallback(req, res) {
  const reference = String(req.query?.tx_ref || '').trim();
  const status = String(req.query?.status || '').toLowerCase();
  const transactionId = String(req.query?.transaction_id || '').trim();

  try {
    if (['cancelled', 'failed'].includes(status)) {
      const purchase = await reconcileReaderCreditPurchase(reference, {
        providerHint: 'flutterwave',
        flutterwaveTransactionId: transactionId || null,
      });

      return redirectToReaderCredits(res, purchase, 'failed');
    }

    const purchase = await reconcileReaderCreditPurchase(reference, {
      providerHint: 'flutterwave',
      flutterwaveTransactionId: transactionId || null,
    });

    return redirectToReaderCredits(res, purchase);
  } catch (error) {
    console.error('flutterwaveCallback error:', error);

    return redirectToReaderCredits(
      res,
      {
        merchant_reference: reference,
        status: status === 'cancelled' ? 'cancelled' : 'pending',
      },
      'pending'
    );
  }
}

async function paypalCallback(req, res) {
  const reference = String(req.query?.purchase_ref || '').trim();
  const orderToken = String(req.query?.token || '').trim();

  try {
    const purchase = await reconcileReaderCreditPurchase(reference, {
      providerHint: 'paypal',
      paypalOrderToken: orderToken || null,
    });

    return redirectToReaderCredits(res, purchase);
  } catch (error) {
    console.error('paypalCallback error:', error);

    return redirectToReaderCredits(
      res,
      {
        merchant_reference: reference,
        status: 'pending',
      },
      'pending'
    );
  }
}

async function paypalCancel(req, res) {
  const reference = String(req.query?.purchase_ref || '').trim();

  try {
    const purchase = await markReaderCreditPurchaseCancelled(reference);
    return redirectToReaderCredits(res, purchase, 'cancelled');
  } catch (error) {
    console.error('paypalCancel error:', error);

    return redirectToReaderCredits(
      res,
      {
        merchant_reference: reference,
        status: 'cancelled',
      },
      'cancelled'
    );
  }
}

module.exports = {
  getTopUpOptions,
  initializeTopUp,
  getTopUpStatus,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
};
