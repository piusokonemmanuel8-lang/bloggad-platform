const pool = require('../config/db');

const {
  encryptCredential,
  decryptCredential,
} = require('./paymentCredentialService');

const {
  CloudFrontClient,
  GetDistributionCommand,
} = require('@aws-sdk/client-cloudfront');

const {
  CloudWatchLogsClient,
  DescribeDeliverySourcesCommand,
  DescribeDeliveriesCommand,
} = require('@aws-sdk/client-cloudwatch-logs');

const {
  PricingPlanManagerClient,
  ListSubscriptionsCommand,
} = require('@aws-sdk/client-pricing-plan-manager');

const FIXED = Object.freeze({
  region: 'us-east-1',
  accountId: '988687011114',
  distributionId: 'E3A73JW8JL9RT1',
  distributionDomain: 'd2px3eurhhl6vw.cloudfront.net',
  webinarAlias: 'webinar-media.bloggad.com',
  protectedPath: 'webinars/hls/*',
  launchPlanTarget: 'FREE',
});

const KEYS = Object.freeze({
  accessKeyId:
    'webinar_infra_aws_access_key_id_encrypted',
  secretAccessKey:
    'webinar_infra_aws_secret_access_key_encrypted',
});

function cleanText(value, maxLength = 8192) {
  return String(value ?? '')
    .trim()
    .slice(0, maxLength);
}

function encryptionReady() {
  return String(
    process.env.BLOGGAD_PAYMENT_CREDENTIALS_KEY || ''
  ).trim().length >= 32;
}

async function readSetting(
  key,
  connection = pool
) {
  const [rows] = await connection.query(
    `
    SELECT setting_value
    FROM admin_settings
    WHERE setting_key = ?
    LIMIT 1
    `,
    [key]
  );

  const value = rows[0]?.setting_value;

  return value === null || value === undefined
    ? ''
    : String(value);
}

async function writeSetting(
  key,
  value,
  connection = pool
) {
  await connection.query(
    `
    INSERT INTO admin_settings (
      setting_key,
      setting_value
    )
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value)
    `,
    [key, value]
  );
}

async function storedCredentialState(
  connection = pool
) {
  const [accessStored, secretStored] =
    await Promise.all([
      readSetting(KEYS.accessKeyId, connection),
      readSetting(KEYS.secretAccessKey, connection),
    ]);

  return {
    accessStored: Boolean(accessStored),
    secretStored: Boolean(secretStored),
    credentialsConfigured:
      Boolean(accessStored && secretStored),
  };
}

function fixedPublicConfiguration() {
  return {
    region: FIXED.region,
    account_id: FIXED.accountId,
    distribution_id: FIXED.distributionId,
    distribution_domain:
      FIXED.distributionDomain,
    webinar_alias: FIXED.webinarAlias,
    protected_path: FIXED.protectedPath,
    launch_policy: {
      cloudfront_plan_target:
        FIXED.launchPlanTarget,
      free_plan_locked: true,
      paid_plan_actions_exposed: false,
      logging_write_actions_exposed: false,
      billing_approval_exposed: false,
      logging_worker_expected_enabled: false,
    },
  };
}

async function getAdminInfrastructureSettings() {
  const state = await storedCredentialState();

  return {
    ...fixedPublicConfiguration(),
    encryption_ready: encryptionReady(),
    access_key_id_configured:
      state.accessStored,
    secret_access_key_configured:
      state.secretStored,
    credentials_configured:
      state.credentialsConfigured,
    credentials_source:
      state.credentialsConfigured
        ? 'admin'
        : 'not_configured',
    secrets_returned: false,
  };
}

function validateCredentialPair(
  accessKeyId,
  secretAccessKey
) {
  if (!accessKeyId && !secretAccessKey) {
    return false;
  }

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'Enter both the AWS Access Key ID and Secret Access Key together.'
    );
  }

  if (accessKeyId.length < 16) {
    throw new Error(
      'AWS Access Key ID is incomplete.'
    );
  }

  if (secretAccessKey.length < 20) {
    throw new Error(
      'AWS Secret Access Key is incomplete.'
    );
  }

  return true;
}

async function saveAdminInfrastructureSettings(
  input = {}
) {
  const accessKeyId =
    cleanText(input.access_key_id, 256);

  const secretAccessKey =
    cleanText(input.secret_access_key, 1024);

  const shouldWrite = validateCredentialPair(
    accessKeyId,
    secretAccessKey
  );

  if (!shouldWrite) {
    return await getAdminInfrastructureSettings();
  }

  if (!encryptionReady()) {
    throw new Error(
      'Encrypted credential storage is not ready.'
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await writeSetting(
      KEYS.accessKeyId,
      encryptCredential(accessKeyId),
      connection
    );

    await writeSetting(
      KEYS.secretAccessKey,
      encryptCredential(secretAccessKey),
      connection
    );

    await connection.commit();

    return await getAdminInfrastructureSettings();
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    throw error;
  } finally {
    connection.release();
  }
}

async function getStoredAwsCredentials() {
  const [accessEncrypted, secretEncrypted] =
    await Promise.all([
      readSetting(KEYS.accessKeyId),
      readSetting(KEYS.secretAccessKey),
    ]);

  if (!accessEncrypted || !secretEncrypted) {
    return null;
  }

  if (!encryptionReady()) {
    throw new Error(
      'Encrypted credential storage is not ready.'
    );
  }

  return {
    accessKeyId:
      decryptCredential(accessEncrypted),
    secretAccessKey:
      decryptCredential(secretEncrypted),
  };
}

function awsClientConfig(credentials) {
  if (!credentials) {
    return null;
  }

  return {
    region: FIXED.region,
    credentials,
  };
}

function distributionArn() {
  return (
    `arn:aws:cloudfront::${FIXED.accountId}:` +
    `distribution/${FIXED.distributionId}`
  );
}

function summarizeDistribution(distribution) {
  const config =
    distribution?.DistributionConfig || {};

  const aliases =
    config?.Aliases?.Items || [];

  const cacheBehaviors =
    config?.CacheBehaviors?.Items || [];

  const protectedHls =
    cacheBehaviors.find(
      (behavior) =>
        String(behavior?.PathPattern || '') ===
        FIXED.protectedPath
    );

  const viewerCertificate =
    config?.ViewerCertificate || {};

  return {
    id: distribution?.Id || null,
    domain_name:
      distribution?.DomainName || null,
    status: distribution?.Status || null,
    enabled: Boolean(config?.Enabled),
    webinar_alias_present:
      aliases.includes(FIXED.webinarAlias),
    hls_protection: {
      path_pattern:
        protectedHls?.PathPattern || null,
      enabled: Boolean(
        protectedHls?.TrustedKeyGroups?.Enabled
      ),
      trusted_key_group_count:
        (
          protectedHls?.TrustedKeyGroups?.Items ||
          []
        ).length,
    },
    tls: {
      custom_certificate:
        Boolean(
          viewerCertificate.ACMCertificateArn
        ),
      minimum_protocol_version:
        viewerCertificate.MinimumProtocolVersion ||
        null,
    },
    legacy_logging_enabled:
      Boolean(config?.Logging?.Enabled),
  };
}

function subscriptionResourceArns(
  subscription
) {
  const values =
    subscription?.resourceArns ||
    subscription?.ResourceArns ||
    [];

  return Array.isArray(values)
    ? values
    : [];
}

function findSubscriptionForDistribution(
  subscriptions,
  targetArn
) {
  return (
    (subscriptions || []).find(
      (subscription) =>
        subscriptionResourceArns(
          subscription
        ).includes(targetArn)
    ) || null
  );
}

function summarizeSubscription(
  subscription
) {
  if (!subscription) {
    return {
      found: false,
      plan_family: null,
      plan_tier: null,
      usage_level: null,
      status: null,
      pending_change: null,
    };
  }

  return {
    found: true,
    plan_family:
      subscription.planFamily || null,
    plan_tier:
      subscription.planTier || null,
    usage_level:
      subscription.usageLevel || null,
    status:
      subscription.status || null,
    pending_change:
      subscription.pendingChange || null,
  };
}

async function listAllSubscriptions(client) {
  const all = [];
  let nextToken;

  for (let page = 0; page < 20; page += 1) {
    const response = await client.send(
      new ListSubscriptionsCommand({
        ...(nextToken
          ? { nextToken }
          : {}),
      })
    );

    all.push(
      ...(response.subscriptionSummaries || [])
    );

    nextToken = response.nextToken;

    if (!nextToken) break;
  }

  return all;
}

async function listAllDeliverySources(
  client
) {
  const all = [];
  let nextToken;

  for (let page = 0; page < 20; page += 1) {
    const response = await client.send(
      new DescribeDeliverySourcesCommand({
        limit: 50,
        ...(nextToken
          ? { nextToken }
          : {}),
      })
    );

    all.push(
      ...(response.deliverySources || [])
    );

    nextToken = response.nextToken;

    if (!nextToken) break;
  }

  return all;
}

async function listAllDeliveries(client) {
  const all = [];
  let nextToken;

  for (let page = 0; page < 20; page += 1) {
    const response = await client.send(
      new DescribeDeliveriesCommand({
        limit: 50,
        ...(nextToken
          ? { nextToken }
          : {}),
      })
    );

    all.push(
      ...(response.deliveries || [])
    );

    nextToken = response.nextToken;

    if (!nextToken) break;
  }

  return all;
}

function summarizeLogging(
  sources,
  deliveries,
  targetArn
) {
  const matchingSources =
    (sources || []).filter(
      (source) =>
        (source.resourceArns || [])
          .includes(targetArn)
    );

  const sourceNames = new Set(
    matchingSources
      .map((source) => source.name)
      .filter(Boolean)
  );

  const matchingDeliveries =
    (deliveries || []).filter(
      (delivery) =>
        sourceNames.has(
          delivery.deliverySourceName
        )
    );

  return {
    standard_v2_enabled:
      matchingSources.length > 0 &&
      matchingDeliveries.length > 0,
    source_count:
      matchingSources.length,
    delivery_count:
      matchingDeliveries.length,
  };
}

function sanitizeAwsError(error) {
  return {
    code:
      error?.name ||
      error?.Code ||
      'AWS_ERROR',
    message:
      String(
        error?.message ||
        'AWS request failed.'
      ).slice(0, 500),
  };
}

function buildActionState(
  pricingPlan,
  logging
) {
  return {
    mode: 'read_only',
    launch_free_plan_locked: true,
    paid_plan_actions_available: false,
    logging_enable_available: false,
    logging_disable_available: false,
    logging_worker_should_run: false,
    current_plan:
      pricingPlan?.plan_tier || null,
    current_logging_v2_enabled:
      Boolean(
        logging?.standard_v2_enabled
      ),
    reason:
      'Launch policy keeps CloudFront on FREE. Paid-plan and logging write actions are not exposed.',
  };
}

async function getInfrastructureStatus() {
  const settings =
    await getAdminInfrastructureSettings();

  if (!settings.credentials_configured) {
    return {
      connected: false,
      settings,
      distribution: null,
      pricing_plan: null,
      logging: null,
      actions: buildActionState(
        null,
        null
      ),
      error: {
        code:
          'WEBINAR_INFRA_CREDENTIALS_REQUIRED',
        message:
          'Save the dedicated read-only AWS credentials first.',
      },
    };
  }

  const credentials =
    await getStoredAwsCredentials();

  const config =
    awsClientConfig(credentials);

  const cloudFront =
    new CloudFrontClient(config);

  const pricing =
    new PricingPlanManagerClient(config);

  const logs =
    new CloudWatchLogsClient(config);

  try {
    const [
      distributionResponse,
      subscriptions,
      deliverySources,
      deliveries,
    ] = await Promise.all([
      cloudFront.send(
        new GetDistributionCommand({
          Id: FIXED.distributionId,
        })
      ),
      listAllSubscriptions(pricing),
      listAllDeliverySources(logs),
      listAllDeliveries(logs),
    ]);

    const distribution =
      summarizeDistribution(
        distributionResponse.Distribution
      );

    const pricingPlan =
      summarizeSubscription(
        findSubscriptionForDistribution(
          subscriptions,
          distributionArn()
        )
      );

    const logging =
      summarizeLogging(
        deliverySources,
        deliveries,
        distributionArn()
      );

    return {
      connected: true,
      settings,
      distribution,
      pricing_plan: pricingPlan,
      logging,
      actions: buildActionState(
        pricingPlan,
        logging
      ),
      error: null,
    };
  } catch (error) {
    return {
      connected: false,
      settings,
      distribution: null,
      pricing_plan: null,
      logging: null,
      actions: buildActionState(
        null,
        null
      ),
      error: sanitizeAwsError(error),
    };
  } finally {
    cloudFront.destroy();
    pricing.destroy();
    logs.destroy();
  }
}

module.exports = {
  FIXED,
  fixedPublicConfiguration,
  encryptionReady,
  getAdminInfrastructureSettings,
  saveAdminInfrastructureSettings,
  getStoredAwsCredentials,
  distributionArn,
  summarizeDistribution,
  findSubscriptionForDistribution,
  summarizeSubscription,
  summarizeLogging,
  buildActionState,
  getInfrastructureStatus,
};