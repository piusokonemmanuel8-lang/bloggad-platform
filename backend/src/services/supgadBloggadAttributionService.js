"use strict";

/* BLOGGAD_BG_ATTRIBUTION_AND_TRAFFIC_SYNC_V1 */
const http = require("http");
const https = require("https");
const pool = require("../config/db");
const {
  getSupgadSyncKey,
  getSupgadApiBaseUrl,
} = require("./supgadIntegrationSettingsService");

const TRAFFIC_WINDOW_DAYS = 30;
const SYNC_THROTTLE_MS = 60000;
const syncStartedAt = new Map();

function cleanText(value, maxLength = 500) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}

function numericId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function safeHttpUrl(value) {
  const raw = cleanText(value, 4000);

  if (!raw) return null;

  try {
    const parsed = new URL(raw);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isKnownSupgadHost(hostname) {
  const host = cleanText(hostname, 255).toLowerCase();

  return (
    host === "supgad.com" ||
    host.endsWith(".supgad.com") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function looksLikeSupgadAffiliateUrl(value, allowSupgadOrigin = false) {
  const parsed = safeHttpUrl(value);

  if (!parsed || !isKnownSupgadHost(parsed.hostname)) {
    return false;
  }

  const trackerPath = /^\/api\/a\/[^/]+/i.test(parsed.pathname);
  const trackingQuery =
    parsed.searchParams.has("tracking_code") ||
    parsed.searchParams.has("affiliate_ref") ||
    parsed.searchParams.has("affiliate_link_id");

  return trackerPath || trackingQuery || allowSupgadOrigin;
}

function appendBgMetadata(value, post, allowSupgadOrigin = false) {
  if (!looksLikeSupgadAffiliateUrl(value, allowSupgadOrigin)) {
    return value;
  }

  const parsed = safeHttpUrl(value);

  if (!parsed) return value;

  const postId = numericId(post?.id);
  const writerId = numericId(post?.user_id);
  const postSlug = cleanText(post?.slug, 180);
  const postTitle = cleanText(post?.title, 180);

  if (!postId) return value;

  parsed.searchParams.set("bg_post_id", String(postId));

  if (writerId) {
    parsed.searchParams.set("bg_writer_id", String(writerId));
  } else {
    parsed.searchParams.delete("bg_writer_id");
  }

  if (postSlug) {
    parsed.searchParams.set("bg_post_slug", postSlug);
  } else {
    parsed.searchParams.delete("bg_post_slug");
  }

  if (postTitle) {
    parsed.searchParams.set("bg_post_title", postTitle);
  } else {
    parsed.searchParams.delete("bg_post_title");
  }

  return parsed.toString();
}

function decorateStoredField(field, post) {
  if (!field || typeof field !== "object") {
    return field;
  }

  const raw = String(field.field_value ?? "").trim();

  if (!raw) {
    return field;
  }

  if (/^https?:\/\//i.test(raw)) {
    const next = appendBgMetadata(raw, post, false);

    return next === raw
      ? field
      : {
          ...field,
          field_value: next,
        };
  }

  if (!raw.startsWith("{")) {
    return field;
  }

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return field;
  }

  let changed = false;

  if (
    parsed &&
    typeof parsed === "object" &&
    typeof parsed.url === "string"
  ) {
    const next = appendBgMetadata(parsed.url, post, false);

    if (next !== parsed.url) {
      parsed.url = next;
      changed = true;
    }
  }

  if (
    parsed?.type === "bloggad_rich_text_v1" &&
    Array.isArray(parsed.links)
  ) {
    parsed.links = parsed.links.map((link) => {
      if (!link || typeof link !== "object") {
        return link;
      }

      const next = appendBgMetadata(link.url, post, false);

      if (next === link.url) {
        return link;
      }

      changed = true;

      return {
        ...link,
        url: next,
      };
    });
  }

  return changed
    ? {
        ...field,
        field_value: JSON.stringify(parsed),
      }
    : field;
}

function decoratePublicPostPayload(payload, sourcePost) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const output = {
    ...payload,
  };

  const post =
    output.post && typeof output.post === "object"
      ? {
          ...output.post,
        }
      : sourcePost && typeof sourcePost === "object"
        ? {
            ...sourcePost,
          }
        : null;

  const metadataPost = post || sourcePost || {};

  if (post?.product && typeof post.product === "object") {
    post.product = {
      ...post.product,
      affiliate_buy_url: appendBgMetadata(
        post.product.affiliate_buy_url,
        metadataPost,
        true
      ),
    };
  }

  if (post) {
    output.post = post;
  }

  if (Array.isArray(output.cta_buttons)) {
    output.cta_buttons = output.cta_buttons.map((button) => {
      if (!button || typeof button !== "object") {
        return button;
      }

      return {
        ...button,
        button_url: appendBgMetadata(
          button.button_url,
          metadataPost,
          false
        ),
      };
    });
  }

  if (Array.isArray(output.template_fields)) {
    output.template_fields = output.template_fields.map((field) =>
      decorateStoredField(field, metadataPost)
    );
  }

  return output;
}

function formatSqlDate(value) {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = cleanText(value, 64);

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString().slice(0, 10);
}

function formatSourceUpdatedAt(value) {
  if (!value) return null;

  const parsed =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

function postJson(urlValue, body, syncKey) {
  return new Promise((resolve, reject) => {
    const target = safeHttpUrl(urlValue);

    if (!target) {
      reject(new Error("Supgad traffic sync URL is invalid."));
      return;
    }

    const payload = Buffer.from(
      JSON.stringify(body),
      "utf8"
    );

    const transport =
      target.protocol === "https:"
        ? https
        : http;

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
        timeout: 3500,
      },
      (response) => {
        let raw = "";

        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          raw += chunk;
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
            response.statusCode >= 200 &&
            response.statusCode < 300
          ) {
            resolve({
              status: response.statusCode,
              body: parsed,
            });
            return;
          }

          const message =
            cleanText(parsed?.message, 500) ||
            "Supgad traffic sync returned HTTP " +
              String(response.statusCode || 0) +
              ".";

          reject(new Error(message));
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(
        new Error("Supgad traffic sync timed out.")
      );
    });

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

async function resolvePostSyncContext(postId) {
  const [postRows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      slug,
      title
    FROM product_posts
    WHERE id = ?
    LIMIT 1
    `,
    [postId]
  );

  const post = postRows[0] || null;

  if (!post) {
    return null;
  }

  const [identityRows] = await pool.query(
    `
    SELECT external_user_id
    FROM user_external_identities
    WHERE provider = 'supgad'
      AND user_id = ?
    LIMIT 1
    `,
    [post.user_id]
  );

  const supgadUserId = cleanText(
    identityRows[0]?.external_user_id,
    191
  );

  return {
    post,
    supgadUserId,
  };
}

async function readPostTraffic(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      DATE(created_at) AS traffic_date,
      COUNT(*) AS page_views,
      COUNT(DISTINCT NULLIF(ip_address, '')) AS unique_visitors,
      MAX(created_at) AS source_updated_at
    FROM analytics_post_views
    WHERE post_id = ?
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
    `,
    [postId, TRAFFIC_WINDOW_DAYS]
  );

  return rows;
}

async function syncPostTrafficToSupgad(postIdValue) {
  const postId = numericId(postIdValue);

  if (!postId) {
    return {
      ok: false,
      skipped: "invalid_post_id",
    };
  }

  const now = Date.now();
  const lastStarted = Number(syncStartedAt.get(postId) || 0);

  if (
    lastStarted &&
    now - lastStarted < SYNC_THROTTLE_MS
  ) {
    return {
      ok: true,
      skipped: "throttled",
    };
  }

  syncStartedAt.set(postId, now);

  try {
    const [context, apiBaseUrl, syncKey] =
      await Promise.all([
        resolvePostSyncContext(postId),
        getSupgadApiBaseUrl(),
        getSupgadSyncKey(),
      ]);

    if (!context?.post) {
      return {
        ok: false,
        skipped: "post_not_found",
      };
    }

    if (!context.supgadUserId) {
      return {
        ok: true,
        skipped: "writer_not_linked_to_supgad",
      };
    }

    const baseUrl = cleanText(apiBaseUrl, 500);
    const secret = cleanText(syncKey, 8192);

    if (!baseUrl || secret.length < 24) {
      return {
        ok: true,
        skipped: "supgad_sync_not_configured",
      };
    }

    const trafficRows = await readPostTraffic(postId);

    if (!trafficRows.length) {
      return {
        ok: true,
        skipped: "no_post_traffic",
      };
    }

    const records = trafficRows
      .map((row) => ({
        supgad_user_id: context.supgadUserId,
        bg_post_id: String(context.post.id),
        bg_writer_id: String(context.post.user_id),
        bg_post_slug: cleanText(
          context.post.slug,
          255
        ) || null,
        bg_post_title: cleanText(
          context.post.title,
          255
        ) || null,
        traffic_date: formatSqlDate(
          row.traffic_date
        ),
        page_views: Math.max(
          0,
          Number(row.page_views || 0)
        ),
        unique_visitors: Math.max(
          0,
          Number(row.unique_visitors || 0)
        ),
        source_updated_at: formatSourceUpdatedAt(
          row.source_updated_at
        ),
      }))
      .filter((record) => record.traffic_date);

    if (!records.length) {
      return {
        ok: true,
        skipped: "no_valid_traffic_records",
      };
    }

    const target = new URL(
      "/api/affiliate/bloggad/traffic-sync",
      baseUrl
    ).toString();

    const response = await postJson(
      target,
      { records },
      secret
    );

    return {
      ok: true,
      status: response.status,
      records: records.length,
    };
  } catch (error) {
    syncStartedAt.delete(postId);
    throw error;
  }
}

module.exports = {
  appendBgMetadata,
  decoratePublicPostPayload,
  syncPostTrafficToSupgad,
};