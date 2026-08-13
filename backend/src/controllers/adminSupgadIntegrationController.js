const {
  getAdminSupgadIntegrationSettings,
  saveAdminSupgadIntegrationSettings,
} = require('../services/supgadIntegrationSettingsService');

async function getSupgadIntegrationSettings(req, res) {
  try {
    const settings = await getAdminSupgadIntegrationSettings();

    return res.status(200).json({
      ok: true,
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message:
        error.message || 'Failed to load Supgad integration settings.',
    });
  }
}

async function saveSupgadIntegrationSettings(req, res) {
  try {
    const settings = await saveAdminSupgadIntegrationSettings(req.body || {});

    return res.status(200).json({
      ok: true,
      message: 'Supgad integration settings saved.',
      settings,
    });
  } catch (error) {
    const message =
      error.message || 'Failed to save Supgad integration settings.';

    return res.status(
      /valid|http|https|required|configured|key/i.test(message) ? 400 : 500
    ).json({
      ok: false,
      message,
    });
  }
}

module.exports = {
  getSupgadIntegrationSettings,
  saveSupgadIntegrationSettings,
};