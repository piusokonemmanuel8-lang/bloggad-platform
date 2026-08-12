const {
  getListenManifest,
  generateAndCacheAudio,
  getAudioAssetForReader,
} = require('../services/readingListenService');
const { getReaderSubscriptionState } = require('../services/writerReaderAccessService');

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);
  return res.status(status >= 400 && status <= 599 ? status : 500).json({
    ok: false,
    message: error?.message || fallback,
  });
}

async function requirePremiumReaderTier(readerUserId) {
  const state = await getReaderSubscriptionState(readerUserId);
  const tier = String(state?.active_subscription?.plan_tier || '').trim().toLowerCase();

  if (tier !== 'premium') {
    const error = new Error('Premium Reader subscription is required for Neural Listen.');
    error.status = 403;
    throw error;
  }

  return state.active_subscription;
}

async function getPublicListenManifest(req, res) {
  try {
    const postId = positiveInt(req.params.postId);
    const manifest = await getListenManifest(postId);

    return res.status(200).json({
      ok: true,
      ...manifest,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Listen options.');
  }
}

async function generateReaderPostAudio(req, res) {
  try {
    const postId = positiveInt(req.params.postId);
    const provider = String(req.body?.provider || '').trim().toLowerCase();
    const voice = String(req.body?.voice || 'default').trim();

    await requirePremiumReaderTier(req.user.id);

    const audio = await generateAndCacheAudio({
      readerUserId: req.user.id,
      postId,
      provider,
      voice,
    });

    return res.status(201).json({
      ok: true,
      message: audio.reused ? 'Cached audio is ready.' : 'Audio generated and cached.',
      audio: {
        ...audio,
        audio_path: undefined,
        stream_url: `/api/reader/reading/audio/${audio.id}`,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Failed to generate post audio.');
  }
}


async function streamReaderPostAudio(req, res) {
  try {
    const assetId = positiveInt(req.params.assetId);
    await requirePremiumReaderTier(req.user.id);
    const asset = await getAudioAssetForReader(req.user.id, assetId);

    res.type(asset.mime_type || 'audio/mpeg');
    return res.sendFile(asset.absolute_path);
  } catch (error) {
    return sendError(res, error, 'Failed to stream post audio.');
  }
}

module.exports = {
  getPublicListenManifest,
  generateReaderPostAudio,
  streamReaderPostAudio,
};