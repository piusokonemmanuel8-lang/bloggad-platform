"use strict";

const {
  requestSupgadFeaturedAd,
  qualifySupgadFeaturedAd,
  clickSupgadFeaturedAd,
} = require("../../services/supgadFeaturedAdsService");

function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);
  const safe =
    Number.isInteger(status) && status >= 400 && status <= 599
      ? status
      : 500;

  return res.status(safe).json({
    ok: false,
    message: error?.message || fallback,
  });
}

async function requestFeaturedAd(req, res) {
  try {
    return res.status(200).json(await requestSupgadFeaturedAd(req));
  } catch (error) {
    console.error("requestFeaturedAd error:", error.message);
    return sendError(
      res,
      error,
      "Failed to request Supgad Featured Ad."
    );
  }
}

async function qualifyFeaturedAdImpression(req, res) {
  try {
    return res
      .status(200)
      .json(await qualifySupgadFeaturedAd(req));
  } catch (error) {
    console.error(
      "qualifyFeaturedAdImpression error:",
      error.message
    );
    return sendError(
      res,
      error,
      "Failed to qualify Supgad Featured Ad impression."
    );
  }
}

async function clickFeaturedAd(req, res) {
  try {
    return res.status(200).json(await clickSupgadFeaturedAd(req));
  } catch (error) {
    console.error("clickFeaturedAd error:", error.message);
    return sendError(
      res,
      error,
      "Failed to report Supgad Featured Ad click."
    );
  }
}

module.exports = {
  requestFeaturedAd,
  qualifyFeaturedAdImpression,
  clickFeaturedAd,
};
