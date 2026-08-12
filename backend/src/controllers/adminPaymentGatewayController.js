const {
  getAdminPaymentConfiguration,
  updateGatewaySetting,
  updateReaderCreditPurchaseSettings,
} = require('../services/readerCreditPaymentService');

async function getPaymentGateways(req, res) {
  try {
    const configuration = await getAdminPaymentConfiguration();

    return res.status(200).json({
      ok: true,
      ...configuration,
    });
  } catch (error) {
    console.error('getPaymentGateways error:', error);

    return res.status(500).json({
      ok: false,
      message: error.message || 'Failed to load payment gateway settings.',
    });
  }
}

async function savePaymentGateway(req, res) {
  try {
    const gateway = await updateGatewaySetting(
      req.params?.provider,
      req.body || {},
      req.user?.id || null
    );

    return res.status(200).json({
      ok: true,
      message: `${gateway.display_name} settings saved.`,
      gateway,
    });
  } catch (error) {
    console.error('savePaymentGateway error:', error);

    const message = error.message || 'Failed to save payment gateway settings.';

    return res.status(
      /unsupported|incomplete|configured|required/i.test(message) ? 400 : 500
    ).json({
      ok: false,
      message,
    });
  }
}

async function getReaderCreditPurchaseSettings(req, res) {
  try {
    const configuration = await getAdminPaymentConfiguration();

    return res.status(200).json({
      ok: true,
      settings: configuration.settings,
    });
  } catch (error) {
    console.error('getReaderCreditPurchaseSettings error:', error);

    return res.status(500).json({
      ok: false,
      message:
        error.message || 'Failed to load Reader credit purchase settings.',
    });
  }
}

async function saveReaderCreditPurchaseSettings(req, res) {
  try {
    const settings = await updateReaderCreditPurchaseSettings(
      req.body || {},
      req.user?.id || null
    );

    return res.status(200).json({
      ok: true,
      message: 'Reader credit purchase settings saved.',
      settings,
    });
  } catch (error) {
    console.error('saveReaderCreditPurchaseSettings error:', error);

    const message =
      error.message || 'Failed to save Reader credit purchase settings.';

    return res.status(
      /positive|minimum|maximum|quick|required/i.test(message) ? 400 : 500
    ).json({
      ok: false,
      message,
    });
  }
}

module.exports = {
  getPaymentGateways,
  savePaymentGateway,
  getReaderCreditPurchaseSettings,
  saveReaderCreditPurchaseSettings,
};
