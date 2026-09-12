const {
  getAdminInfrastructureSettings,
  saveAdminInfrastructureSettings,
  getInfrastructureStatus,
} = require('../../services/webinarInfrastructureService');

async function settings(req, res) {
  try {
    const result =
      await getAdminInfrastructureSettings();

    return res.status(200).json({
      ok: true,
      settings: result,
    });
  } catch (error) {
    console.error(
      'Admin webinar infrastructure settings error:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      message:
        'Failed to load webinar infrastructure settings.',
    });
  }
}

async function saveSettings(req, res) {
  try {
    const result =
      await saveAdminInfrastructureSettings(
        req.body || {}
      );

    return res.status(200).json({
      ok: true,
      message:
        'Webinar infrastructure credentials saved securely.',
      settings: result,
    });
  } catch (error) {
    const message =
      error.message ||
      'Failed to save webinar infrastructure settings.';

    return res.status(
      /access key|secret|credential|encrypted|required|incomplete|enter both/i
        .test(message)
        ? 400
        : 500
    ).json({
      ok: false,
      message,
    });
  }
}

async function status(req, res) {
  try {
    const result =
      await getInfrastructureStatus();

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error(
      'Admin webinar infrastructure status error:',
      error.message
    );

    return res.status(500).json({
      ok: false,
      message:
        'Failed to load webinar infrastructure status.',
    });
  }
}

module.exports = {
  settings,
  saveSettings,
  status,
};