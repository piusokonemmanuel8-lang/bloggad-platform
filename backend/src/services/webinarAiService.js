const {
  getWebinarAnalytics,
} = require('./webinarAnalyticsService');

const DEFAULT_MODEL = 'gpt-5-mini';
const RESPONSES_URL = 'https://api.openai.com/v1/responses';

function aiError(message, status = 500, code = 'WEBINAR_AI_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function cleanText(value, maxLength = 500) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return !['0', 'false', 'no', 'off'].includes(
    String(value).trim().toLowerCase()
  );
}

function getAiConfig() {
  const enabled = parseBoolean(process.env.WEBINAR_AI_ENABLED, true);
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  const model =
    cleanText(process.env.WEBINAR_AI_MODEL, 120) || DEFAULT_MODEL;
  const timeoutMs = Math.min(
    60000,
    Math.max(
      5000,
      Number(process.env.WEBINAR_AI_TIMEOUT_MS || 25000)
    )
  );

  if (!enabled) {
    throw aiError(
      'Webinar AI helpers are disabled.',
      503,
      'WEBINAR_AI_DISABLED'
    );
  }

  if (!apiKey) {
    throw aiError(
      'Webinar AI helpers are not configured.',
      503,
      'WEBINAR_AI_NOT_CONFIGURED'
    );
  }

  return {
    apiKey,
    model,
    timeoutMs,
  };
}

function extractOutputText(payload) {
  const direct = cleanText(payload?.output_text, 20000);

  if (direct) {
    return direct;
  }

  const output = Array.isArray(payload?.output)
    ? payload.output
    : [];

  for (const item of output) {
    const content = Array.isArray(item?.content)
      ? item.content
      : [];

    for (const part of content) {
      if (
        part?.type === 'output_text' &&
        typeof part?.text === 'string'
      ) {
        return part.text.trim();
      }
    }
  }

  return '';
}

async function createStructuredResponse({
  schemaName,
  schema,
  instructions,
  input,
  maxOutputTokens = 900,
}) {
  const config = getAiConfig();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.timeoutMs
  );

  try {
    const response = await fetch(RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        store: false,
        instructions,
        input: JSON.stringify(input),
        max_output_tokens: maxOutputTokens,
        text: {
          format: {
            type: 'json_schema',
            name: schemaName,
            strict: true,
            schema,
          },
        },
      }),
      signal: controller.signal,
    });

    let payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      throw aiError(
        'The webinar AI provider could not complete the request.',
        502,
        'WEBINAR_AI_UPSTREAM_ERROR'
      );
    }

    const outputText = extractOutputText(payload);

    if (!outputText) {
      throw aiError(
        'The webinar AI provider returned no usable output.',
        502,
        'WEBINAR_AI_EMPTY_RESPONSE'
      );
    }

    try {
      return {
        model: cleanText(payload?.model, 120) || config.model,
        response_id: cleanText(payload?.id, 160) || null,
        output: JSON.parse(outputText),
      };
    } catch (error) {
      throw aiError(
        'The webinar AI provider returned invalid structured output.',
        502,
        'WEBINAR_AI_INVALID_RESPONSE'
      );
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw aiError(
        'The webinar AI request timed out.',
        504,
        'WEBINAR_AI_TIMEOUT'
      );
    }

    if (error?.status) {
      throw error;
    }

    throw aiError(
      'The webinar AI request failed.',
      502,
      'WEBINAR_AI_REQUEST_FAILED'
    );
  } finally {
    clearTimeout(timeout);
  }
}

function buildWebinarContext(webinar) {
  return {
    title: cleanText(webinar?.title, 255),
    description: cleanText(webinar?.description, 4000),
    webinar_type: cleanText(webinar?.webinar_type, 30),
    visibility: cleanText(webinar?.visibility, 30),
    status: cleanText(webinar?.status, 30),
    registration_mode: cleanText(
      webinar?.registration_mode,
      30
    ),
    ticket_price_usd: cleanText(
      webinar?.ticket_price_usd,
      30
    ),
    ticket_currency_code: cleanText(
      webinar?.ticket_currency_code,
      10
    ),
    duration_seconds: Number(webinar?.duration_seconds || 0),
    timezone: cleanText(webinar?.timezone, 80),
    scheduled_start_at: webinar?.scheduled_start_at || null,
  };
}

async function suggestWriterWebinarCopy({
  webinar,
  audience,
  tone,
  goal,
}) {
  const context = {
    webinar: buildWebinarContext(webinar),
    audience: cleanText(audience, 500) || 'General audience',
    tone:
      cleanText(tone, 120) ||
      'Clear, professional, natural, and concise',
    goal:
      cleanText(goal, 500) ||
      'Improve clarity and registration appeal without exaggeration',
  };

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      title_suggestions: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'string',
          maxLength: 140,
        },
      },
      description_suggestion: {
        type: 'string',
        maxLength: 1200,
      },
      registration_blurb: {
        type: 'string',
        maxLength: 400,
      },
      attendee_takeaways: {
        type: 'array',
        minItems: 3,
        maxItems: 5,
        items: {
          type: 'string',
          maxLength: 220,
        },
      },
    },
    required: [
      'title_suggestions',
      'description_suggestion',
      'registration_blurb',
      'attendee_takeaways',
    ],
  };

  const result = await createStructuredResponse({
    schemaName: 'webinar_copy_suggestions',
    schema,
    instructions: [
      'You are a concise webinar copy assistant inside Bloggad.',
      'Return suggestions only. Never claim facts not present in the input.',
      'Do not promise earnings, guaranteed outcomes, attendance, or results.',
      'Keep titles natural and distinct from each other.',
      'Do not include markdown.',
    ].join(' '),
    input: context,
    maxOutputTokens: 850,
  });

  return {
    provider: 'openai',
    model: result.model,
    response_id: result.response_id,
    suggestions: result.output,
  };
}

function compactAnalytics(analytics) {
  return {
    webinar: analytics?.webinar || null,
    registrations: analytics?.registrations || {},
    revenue: analytics?.revenue || {},
    attendance: analytics?.attendance || {},
    engagement: analytics?.engagement || {},
    retention: analytics?.retention || {},
    registration_sources:
      analytics?.registration_sources || [],
    payment_providers:
      analytics?.payment_providers || [],
    sessions: Array.isArray(analytics?.sessions)
      ? analytics.sessions.slice(0, 20)
      : [],
  };
}

async function generateWriterWebinarAnalyticsInsights(webinar) {
  const analytics = await getWebinarAnalytics(webinar.id);

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      summary: {
        type: 'string',
        maxLength: 700,
      },
      strengths: {
        type: 'array',
        minItems: 0,
        maxItems: 4,
        items: {
          type: 'string',
          maxLength: 240,
        },
      },
      improvement_opportunities: {
        type: 'array',
        minItems: 0,
        maxItems: 4,
        items: {
          type: 'string',
          maxLength: 260,
        },
      },
      next_actions: {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: {
          type: 'string',
          maxLength: 260,
        },
      },
      data_limitations: {
        type: 'array',
        minItems: 0,
        maxItems: 4,
        items: {
          type: 'string',
          maxLength: 240,
        },
      },
    },
    required: [
      'summary',
      'strengths',
      'improvement_opportunities',
      'next_actions',
      'data_limitations',
    ],
  };

  const result = await createStructuredResponse({
    schemaName: 'webinar_analytics_insights',
    schema,
    instructions: [
      'You are a webinar analytics assistant inside Bloggad.',
      'Use only the aggregate metrics supplied in the input.',
      'Do not invent benchmarks, causes, demographics, or attendee behavior.',
      'If the dataset is too small for a conclusion, say so in data_limitations.',
      'Keep recommendations practical and concise.',
      'Do not include markdown.',
    ].join(' '),
    input: compactAnalytics(analytics),
    maxOutputTokens: 900,
  });

  return {
    provider: 'openai',
    model: result.model,
    response_id: result.response_id,
    insights: result.output,
  };
}

module.exports = {
  suggestWriterWebinarCopy,
  generateWriterWebinarAnalyticsInsights,
};
