const express = require('express');
const {
  getPublicWebinar,
  registerForWebinar,
  getRegistrationStatus,
  getCheckoutOptions,
  initializeCheckout,
  paystackCallback,
  flutterwaveCallback,
  paypalCallback,
  paypalCancel,
} = require('../../controllers/publicWebinarController');

const router = express.Router();

router.get('/health', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Public webinar routes working',
  });
});

router.get('/checkout/options', getCheckoutOptions);
router.get('/checkout/callback/paystack', paystackCallback);
router.get('/checkout/callback/flutterwave', flutterwaveCallback);
router.get('/checkout/callback/paypal', paypalCallback);
router.get('/checkout/cancel/paypal', paypalCancel);

router.get('/registrations/:token', getRegistrationStatus);
router.post(
  '/registrations/:token/checkout/initialize',
  initializeCheckout
);

router.get('/:writerPageSlug/:webinarSlug', getPublicWebinar);
router.post(
  '/:writerPageSlug/:webinarSlug/register',
  registerForWebinar
);

module.exports = router;
