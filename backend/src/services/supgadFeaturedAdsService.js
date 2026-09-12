"use strict";

const http = require("http");
const https = require("https");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");
const {
  getSupgadSyncKey,
  getSupgadApiBaseUrl,
} = require("./supgadIntegrationSettingsService");
const {
  getReaderSubscriptionState,
  getCurrentPaidWriterSubscription,
} = require("./writerReaderAccessService");

const REQUEST_PATH = "/api/integrations/bloggad/featured-ads/request";
const QUALIFY_PATH_PREFIX = "/api/integrations/bloggad/featured-ads/impressions/";
const CLICK_PATH = "/api/integrations/bloggad/featured-ads/clicks";
const ALLOWED_PLACEMENTS = new Set(["bloggad_feed", "bloggad_post_detail"]);

function cleanText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function positiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function safeHttpUrl(value) {
  const raw = cleanText(value, 4000);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
}

function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && String(authHeader).startsWith("Bearer ")) {
    return String(authHeader).slice(7).trim();
  }
  return req.cookies?.bloggad_token || req.cookies?.token || null;
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "change_this_jwt_secret";
}

async function resolveOptionalReader(req) {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const userId = positiveInt(decoded?.id);
    if (!userId) return null;

    const [rows] = await pool.query(
      `SELECT id, role, status FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const user = rows[0] || null;
    if (!user || user.status !== "active") return null;
    return user;
  } catch {
    return null;
  }
}

async function resolveSupgadUserId(bloggadUserId) {
  const userId = positiveInt(bloggadUserId);
  if (!userId) return null;

  const [rows] = await pool.query(
    `
      SELECT external_user_id
      FROM user_external_identities
      WHERE provider = 'supgad'
        AND user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return cleanText(rows[0]?.external_user_id, 191) || null;
}

async function resolveReaderContext(req) {
  const reader = await resolveOptionalReader(req);
  let planTier = "free";
  let readerAdsAllowed = true;

  if (reader?.id) {
    try {
      const state = await getReaderSubscriptionState(reader.id);
      const rawTier = cleanText(
        state?.active_subscription?.plan_tier || "",
        50
      ).toLowerCase();

      planTier =
        rawTier === "premium"
          ? "premium"
          : rawTier === "basic"
            ? "basic"
            : "free";

            // Bloggad currently has no explicit ad-free/no-ads entitlement flag.
      // Do not infer ad-free status from Premium tier alone.
      readerAdsAllowed = true;
    } catch {
      planTier = "free";
      readerAdsAllowed = true;
    }
  }

  const supgadUserId = reader?.id
    ? await resolveSupgadUserId(reader.id)
    : null;

  return {
    reader_user_id: reader?.id ? Number(reader.id) : null,
    supgad_user_id: supgadUserId,
    reader_ads_allowed: readerAdsAllowed,
    reader_plan_tier: planTier,
    reader_ip: cleanText(req.ip, 64) || null,
    reader_user_agent: cleanText(req.get("user-agent"), 1000) || null,
    reader_session_id: cleanText(req.body?.session_id, 191) || null,
    guest_id: cleanText(req.body?.guest_id, 191) || null,
    device_id: cleanText(req.body?.device_id, 191) || null,
    country_code:
      cleanText(req.headers["cf-ipcountry"], 8) ||
      cleanText(req.headers["x-country-code"], 8) ||
      cleanText(req.body?.country_code, 8) ||
      null,
  };
}

async function resolvePostContext(postIdValue) {
  const postId = positiveInt(postIdValue);
  if (!postId) return null;

  const [rows] = await pool.query(
    `
      SELECT id, user_id, website_id, slug, title
      FROM product_posts
      WHERE id = ?
        AND status = 'published'
      LIMIT 1
    `,
    [postId]
  );

  const row = rows[0] || null;
  if (!row) return null;

  return {
    bg_post_id: String(row.id),
    bg_writer_id: String(row.user_id),
    bg_post_slug: cleanText(row.slug, 255) || null,
    bg_post_title: cleanText(row.title, 255) || null,
    writer_user_id: Number(row.user_id),
    website_id: positiveInt(row.website_id),
  };
}

async function resolveWriterMonetization(writerUserId, websiteIdValue) {
  const writerId = positiveInt(writerUserId);
  const websiteId = positiveInt(websiteIdValue);

  if (!writerId) {
    return {
      writer_monetized: false,
      writer_monetization_tier: null,
    };
  }

  let settings = null;

  if (websiteId) {
    const [rows] = await pool.query(
      `
        SELECT review_status, content_quality_status, monetization_mode,
               post_top_enabled
        FROM affiliate_monetization_settings
        WHERE user_id = ?
          AND website_id = ?
        LIMIT 1
      `,
      [writerId, websiteId]
    );

    settings = rows[0] || null;
  }

  const writerMonetized =
    settings?.review_status === "approved" &&
    settings?.monetization_mode === "platform" &&
    Number(settings?.post_top_enabled || 0) === 1;

  let tier = null;
  try {
    const subscription = await getCurrentPaidWriterSubscription(writerId);
    tier =
      cleanText(
        subscription?.plan_tier ||
          subscription?.tier ||
          subscription?.plan_name ||
          subscription?.name ||
          "",
        100
      ) || null;
  } catch {}

  return {
    writer_monetized: writerMonetized,
    writer_monetization_tier: tier,
  };
}

function privateSourceKey(key) {
  return /aliexpress|alibaba|1688|import[_-]?source|supplier[_-]?source|supplier[_-]?url|supplier[_-]?id|source[_-]?vendor|sourcing/i.test(
    String(key || "")
  );
}

function privateSourceUrl(value) {
  const parsed = safeHttpUrl(value);
  if (!parsed) return false;

  const hostname = String(parsed.hostname || "").trim().toLowerCase();

  return (
    /(^|\.)aliexpress\./i.test(hostname) ||
    /(^|\.)alibaba\./i.test(hostname) ||
    /(^|\.)1688\.com$/i.test(hostname)
  );
}

function sanitizeForBrowser(value, depth = 0) {
  if (depth > 8) return null;

  if (typeof value === "string") {
    return privateSourceUrl(value) ? null : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForBrowser(item, depth + 1));
  }
  if (!value || typeof value !== "object") return value;

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (privateSourceKey(key)) continue;
    output[key] = sanitizeForBrowser(item, depth + 1);
  }
  return output;
}

function serviceError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function postJson(urlValue, body, syncKey, timeoutMs = 4500) {
  return new Promise((resolve, reject) => {
    const target = safeHttpUrl(urlValue);
    if (!target) {
      reject(serviceError("Supgad Featured Ads URL is invalid.", 503));
      return;
    }

    const payload = Buffer.from(JSON.stringify(body), "utf8");
    const transport = target.protocol === "https:" ? https : http;

    const request = transport.request(
      target,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Length": payload.length,
          "x-bloggad-sync-key": syncKey,
        },
        timeout: timeoutMs,
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
          if (raw.length > 1024 * 1024) {
            request.destroy(
              new Error("Supgad Featured Ads response exceeded 1 MB.")
            );
          }
        });
        response.on("end", () => {
          let parsed = null;
          if (raw.trim()) {
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = null;
            }
          }

          if (
            Number(response.statusCode || 0) >= 200 &&
            Number(response.statusCode || 0) < 300
          ) {
            resolve({
              status: Number(response.statusCode),
              body: parsed || {},
            });
            return;
          }

          const upstreamStatus = Number(response.statusCode || 0);
          const mappedStatus =
            upstreamStatus >= 400 && upstreamStatus < 500
              ? upstreamStatus
              : 502;

          const error = serviceError(
            cleanText(parsed?.message, 500) ||
              `Supgad Featured Ads returned HTTP ${upstreamStatus}.`,
            mappedStatus
          );
          error.upstream_status = upstreamStatus;
          reject(error);
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(
        serviceError("Supgad Featured Ads request timed out.", 504)
      );
    });
    request.on("error", (error) => {
      if (!error.status) error.status = 502;
      reject(error);
    });
    request.write(payload);
    request.end();
  });
}

async function getSupgadConfig() {
  const [baseUrl, syncKey] = await Promise.all([
    getSupgadApiBaseUrl(),
    getSupgadSyncKey(),
  ]);

  const base = cleanText(baseUrl, 500);
  const secret = cleanText(syncKey, 8192);

  if (!base || secret.length < 24) return null;
  return { base, secret };
}

async function requestSupgadFeaturedAd(req) {
  const placementKey = cleanText(req.body?.placement_key, 100);
  if (!ALLOWED_PLACEMENTS.has(placementKey)) {
    const error = new Error("Unsupported Supgad Featured Ads placement.");
    error.status = 400;
    throw error;
  }

  const reader = await resolveReaderContext(req);

  if (!reader.reader_ads_allowed) {
    return {
      ok: true,
      ad: null,
      reader_ads_allowed: false,
      blocked_reason: "premium_reader_ad_free",
    };
  }

  const config = await getSupgadConfig();
  if (!config) {
    return {
      ok: true,
      ad: null,
      reader_ads_allowed: true,
      unavailable_reason: "supgad_integration_not_configured",
    };
  }

  let postContext = null;
  let writerContext = {
    writer_monetized: false,
    writer_monetization_tier: null,
  };

  if (placementKey === "bloggad_post_detail") {
    postContext = await resolvePostContext(req.body?.post_id);
    if (!postContext) {
      const error = new Error("Valid published Bloggad post is required.");
      error.status = 400;
      throw error;
    }

    writerContext = await resolveWriterMonetization(
      postContext.writer_user_id,
      postContext.website_id
    );
  }

  const partnerRequestId =
    cleanText(crypto.randomUUID?.(), 100) ||
    `bloggad-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;

  /* BLOGGAD_SUPGAD_AD_DIVERSITY_V1 */
  const excludeCampaignTargetIds = Array.from(
    new Set(
      (
        Array.isArray(req.body?.exclude_campaign_target_ids)
          ? req.body.exclude_campaign_target_ids
          : String(req.body?.exclude_campaign_target_ids || "").split(",")
      )
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  ).slice(-50);

  const body = {
    placement_key: placementKey,
    partner_request_id: partnerRequestId,
    exclude_campaign_target_ids: excludeCampaignTargetIds,
    preferred_target_type:
      req.body?.preferred_target_type === "product" ||
      req.body?.preferred_target_type === "storefront"
        ? req.body.preferred_target_type
        : null,
    reader_ads_allowed: reader.reader_ads_allowed,
    reader_ip: reader.reader_ip,
    reader_user_agent: reader.reader_user_agent,
    reader_session_id: reader.reader_session_id,
    guest_id: reader.guest_id,
    device_id: reader.device_id,
    country_code: reader.country_code,
    supgad_user_id: reader.supgad_user_id,
    keyword_context: cleanText(req.body?.keyword_context, 500) || null,
  };

  if (postContext) {
    Object.assign(body, {
      bg_post_id: postContext.bg_post_id,
      bg_writer_id: postContext.bg_writer_id,
      bg_post_slug: postContext.bg_post_slug,
      bg_post_title: postContext.bg_post_title,
      writer_monetized: writerContext.writer_monetized,
      writer_monetization_tier:
        writerContext.writer_monetization_tier,
    });
  }

  const target = new URL(REQUEST_PATH, config.base).toString();
  const response = await postJson(target, body, config.secret);

  return {
    ok: true,
    partner_request_id: partnerRequestId,
    reader_ads_allowed: true,
    delivery_token:
      cleanText(response.body?.delivery_token, 2048) || null,
    impression_token:
      cleanText(response.body?.impression_token, 2048) || null,
    ad: response.body?.ad
      ? sanitizeForBrowser(response.body.ad)
      : null,
  };
}

async function qualifySupgadFeaturedAd(req) {
  const impressionToken =
    cleanText(req.params?.impressionToken, 2048) ||
    cleanText(req.body?.impression_token, 2048);
  const deliveryToken = cleanText(req.body?.delivery_token, 2048);

  if (!impressionToken || !deliveryToken) {
    const error = new Error(
      "delivery_token and impression_token are required."
    );
    error.status = 400;
    throw error;
  }

  const visiblePercent = Math.max(
    0,
    Math.min(100, Number(req.body?.visible_percent || 0))
  );
  const visibleMilliseconds = Math.max(
    0,
    Math.min(
      600000,
      Math.trunc(Number(req.body?.visible_milliseconds || 0))
    )
  );

  const reader = await resolveReaderContext(req);
  if (!reader.reader_ads_allowed) {
    return {
      ok: true,
      qualified: false,
      blocked_reason: "premium_reader_ad_free",
    };
  }

  const config = await getSupgadConfig();
  if (!config) {
    const error = new Error("Supgad integration is not configured.");
    error.status = 503;
    throw error;
  }

  const target = new URL(
    `${QUALIFY_PATH_PREFIX}${encodeURIComponent(
      impressionToken
    )}/qualify`,
    config.base
  ).toString();

  const response = await postJson(
    target,
    {
      delivery_token: deliveryToken,
      impression_token: impressionToken,
      visible_percent: visiblePercent,
      visible_milliseconds: visibleMilliseconds,
      reader_ip: reader.reader_ip,
      reader_user_agent: reader.reader_user_agent,
      reader_session_id: reader.reader_session_id,
      guest_id: reader.guest_id,
      device_id: reader.device_id,
      country_code: reader.country_code,
      supgad_user_id: reader.supgad_user_id,
    },
    config.secret
  );

  return sanitizeForBrowser(response.body || { ok: true });
}

async function clickSupgadFeaturedAd(req) {
  const deliveryToken = cleanText(req.body?.delivery_token, 2048);
  const impressionToken = cleanText(req.body?.impression_token, 2048);

  if (!deliveryToken || !impressionToken) {
    const error = new Error(
      "delivery_token and impression_token are required."
    );
    error.status = 400;
    throw error;
  }

  const reader = await resolveReaderContext(req);
  if (!reader.reader_ads_allowed) {
    return {
      ok: true,
      redirect_url: null,
      blocked_reason: "premium_reader_ad_free",
    };
  }

  const config = await getSupgadConfig();
  if (!config) {
    const error = new Error("Supgad integration is not configured.");
    error.status = 503;
    throw error;
  }

  const target = new URL(CLICK_PATH, config.base).toString();
  const response = await postJson(
    target,
    {
      delivery_token: deliveryToken,
      impression_token: impressionToken,
      reader_ip: reader.reader_ip,
      reader_user_agent: reader.reader_user_agent,
      reader_session_id: reader.reader_session_id,
      guest_id: reader.guest_id,
      device_id: reader.device_id,
      country_code: reader.country_code,
      supgad_user_id: reader.supgad_user_id,
    },
    config.secret
  );

  const browserSafeBody = sanitizeForBrowser(response.body || {});
  const redirect = safeHttpUrl(browserSafeBody?.redirect_url);

  return {
    ...browserSafeBody,
    redirect_url: redirect ? redirect.toString() : null,
  };
}

module.exports = {
  requestSupgadFeaturedAd,
  qualifySupgadFeaturedAd,
  clickSupgadFeaturedAd,
};
