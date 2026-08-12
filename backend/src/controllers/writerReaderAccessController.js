const pool = require('../config/db');
const {
  fail,
  positiveInt,
  money2,
  getPostAccessSetting,
  getCurrentPaidWriterSubscription,
  getWriterMembershipPolicy,
  getWriterMembershipEligibility,
  getWriterMembershipOfferRecord,
  getReaderPostAccess,
  setWriterPostAccess,
  saveWriterMembershipOffer,
  getPublicWriterMembershipOffer,
  getReaderSubscriptionState,
  getReaderWriterMemberships,
  getWriterMembers,
  activateReaderPlatformSubscription,
  activateWriterMembership,
} = require('../services/writerReaderAccessService');

function sendError(res, error, fallbackMessage) {
  const status = Number(error?.status || 500);
  const safeStatus = Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;

  return res.status(safeStatus).json({
    ok: false,
    message: error?.message || fallbackMessage,
  });
}

function cleanText(value, maxLength = 255) {
  const text = String(value || '').trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizePlanStatus(value) {
  const status = String(value || 'active').trim().toLowerCase();
  return ['active', 'inactive'].includes(status) ? status : null;
}

function normalizeBillingCycle(value) {
  const cycle = String(value || 'monthly').trim().toLowerCase();
  return ['monthly', 'yearly'].includes(cycle) ? cycle : null;
}

async function getPublicWriterMembership(req, res) {
  try {
    const writerUserId = positiveInt(req.params.writerId);

    if (!writerUserId) {
      throw fail('Valid Writer ID is required.');
    }

    const result = await getPublicWriterMembershipOffer(writerUserId);

    return res.status(200).json({
      ok: true,
      membership: result,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Writer membership.');
  }
}

async function getReaderPost(req, res) {
  try {
    const postId = positiveInt(req.params.postId);

    if (!postId) {
      throw fail('Valid post ID is required.');
    }

    const result = await getReaderPostAccess(req.user.id, postId);

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader post access.');
  }
}

async function getReaderSubscription(req, res) {
  try {
    const state = await getReaderSubscriptionState(req.user.id);

    return res.status(200).json({
      ok: true,
      ...state,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader subscription.');
  }
}

async function getReaderMemberships(req, res) {
  try {
    const memberships = await getReaderWriterMemberships(req.user.id);

    return res.status(200).json({
      ok: true,
      memberships,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader memberships.');
  }
}

async function getReaderPlans(req, res) {
  try {
    const [plans] = await pool.query(
      `
      SELECT
        id,
        name,
        tier,
        price_usd,
        billing_cycle,
        description,
        status,
        created_at,
        updated_at
      FROM reader_subscription_plans
      WHERE status = 'active'
        AND tier IN ('basic', 'premium')
      ORDER BY
        FIELD(tier, 'basic', 'premium') ASC,
        FIELD(billing_cycle, 'monthly', 'yearly') ASC,
        id ASC
      `
    );

    return res.status(200).json({
      ok: true,
      plans,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader subscription plans.');
  }
}

async function getWriterPostAccess(req, res) {
  try {
    const postId = positiveInt(req.params.postId);

    if (!postId) {
      throw fail('Valid post ID is required.');
    }

    const [[post]] = await pool.query(
      `
      SELECT id, user_id, title, status
      FROM product_posts
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [postId, req.user.id]
    );

    if (!post) {
      throw fail('Writer post not found.', 404);
    }

    const [access, paid_writer_plan] = await Promise.all([
      getPostAccessSetting(post.id),
      getCurrentPaidWriterSubscription(req.user.id),
    ]);

    return res.status(200).json({
      ok: true,
      post,
      access,
      paid_writer_plan,
      can_use_premium_posts: !!paid_writer_plan,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Writer post access.');
  }
}

async function updateWriterPostAccess(req, res) {
  try {
    const postId = positiveInt(req.params.postId);

    if (!postId) {
      throw fail('Valid post ID is required.');
    }

    const access = await setWriterPostAccess({
      writerUserId: req.user.id,
      postId,
      accessType: req.body?.access_type,
      previewPercent: req.body?.preview_percent,
    });

    return res.status(200).json({
      ok: true,
      message: 'Post access settings updated.',
      access,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update Writer post access.');
  }
}

async function getWriterMembershipOffer(req, res) {
  try {
    const eligibility = await getWriterMembershipEligibility(req.user.id);
    const offer = await getWriterMembershipOfferRecord(req.user.id);

    return res.status(200).json({
      ok: true,
      eligibility,
      offer,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Writer membership offer.');
  }
}

async function updateWriterMembershipOffer(req, res) {
  try {
    const result = await saveWriterMembershipOffer({
      writerUserId: req.user.id,
      monthlyPriceUsd: req.body?.monthly_price_usd,
      status: req.body?.status,
    });

    return res.status(200).json({
      ok: true,
      message: 'Writer membership offer updated.',
      ...result,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update Writer membership offer.');
  }
}

async function getMyWriterMembers(req, res) {
  try {
    const memberships = await getWriterMembers(req.user.id);

    return res.status(200).json({
      ok: true,
      memberships,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Writer members.');
  }
}

async function listAdminReaderPlans(req, res) {
  try {
    const [plans] = await pool.query(
      `
      SELECT
        id,
        name,
        price_usd,
        billing_cycle,
        description,
        status,
        created_at,
        updated_at
      FROM reader_subscription_plans
      ORDER BY id ASC
      `
    );

    return res.status(200).json({
      ok: true,
      plans,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader subscription plans.');
  }
}

async function createAdminReaderPlan(req, res) {
  try {
    const name = cleanText(req.body?.name, 120);
    const description = cleanText(req.body?.description, 1000);
    const billingCycle = normalizeBillingCycle(req.body?.billing_cycle);
    const status = normalizePlanStatus(req.body?.status);
    const price = money2(req.body?.price_usd);

    if (!name) {
      throw fail('Reader plan name is required.');
    }

    if (!billingCycle) {
      throw fail('Billing cycle must be monthly or yearly.');
    }

    if (!status) {
      throw fail('Plan status must be active or inactive.');
    }

    if (price <= 0) {
      throw fail('Reader plan price must be greater than zero.');
    }

    const [result] = await pool.query(
      `
      INSERT INTO reader_subscription_plans (
        name,
        price_usd,
        billing_cycle,
        description,
        status,
        created_by_user_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [name, price, billingCycle, description, status, req.user.id]
    );

    return res.status(201).json({
      ok: true,
      message: 'Reader subscription plan created.',
      plan_id: result.insertId,
    });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      error = fail('A Reader subscription plan with this name already exists.', 409);
    }

    return sendError(res, error, 'Failed to create Reader subscription plan.');
  }
}

async function updateAdminReaderPlan(req, res) {
  try {
    const planId = positiveInt(req.params.planId);

    if (!planId) {
      throw fail('Valid Reader plan ID is required.');
    }

    const [[existing]] = await pool.query(
      `
      SELECT *
      FROM reader_subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [planId]
    );

    if (!existing) {
      throw fail('Reader subscription plan not found.', 404);
    }

    const name =
      req.body?.name === undefined
        ? existing.name
        : cleanText(req.body.name, 120);
    const description =
      req.body?.description === undefined
        ? existing.description
        : cleanText(req.body.description, 1000);
    const billingCycle =
      req.body?.billing_cycle === undefined
        ? existing.billing_cycle
        : normalizeBillingCycle(req.body.billing_cycle);
    const status =
      req.body?.status === undefined
        ? existing.status
        : normalizePlanStatus(req.body.status);
    const price =
      req.body?.price_usd === undefined
        ? money2(existing.price_usd)
        : money2(req.body.price_usd);

    if (!name) {
      throw fail('Reader plan name is required.');
    }

    if (!billingCycle) {
      throw fail('Billing cycle must be monthly or yearly.');
    }

    if (!status) {
      throw fail('Plan status must be active or inactive.');
    }

    if (price <= 0) {
      throw fail('Reader plan price must be greater than zero.');
    }

    await pool.query(
      `
      UPDATE reader_subscription_plans
      SET
        name = ?,
        price_usd = ?,
        billing_cycle = ?,
        description = ?,
        status = ?,
        updated_by_user_id = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        name,
        price,
        billingCycle,
        description,
        status,
        req.user.id,
        planId,
      ]
    );

    return res.status(200).json({
      ok: true,
      message: 'Reader subscription plan updated.',
    });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      error = fail('A Reader subscription plan with this name already exists.', 409);
    }

    return sendError(res, error, 'Failed to update Reader subscription plan.');
  }
}

async function getAdminWriterMembershipPolicy(req, res) {
  try {
    const policy = await getWriterMembershipPolicy();

    return res.status(200).json({
      ok: true,
      policy,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Writer membership policy.');
  }
}

async function updateAdminWriterMembershipPolicy(req, res) {
  try {
    const enabled = Number(req.body?.enabled) === 1 ? 1 : 0;
    const minimumFollowers = Number(req.body?.minimum_followers);
    const feePercent = money2(req.body?.platform_fee_percent);
    const minimumPrice = money2(req.body?.minimum_monthly_price_usd);
    const maximumRaw = req.body?.maximum_monthly_price_usd;
    const maximumPrice =
      maximumRaw === null || maximumRaw === undefined || String(maximumRaw).trim() === ''
        ? null
        : money2(maximumRaw);

    if (
      !Number.isInteger(minimumFollowers) ||
      minimumFollowers < 0
    ) {
      throw fail('Minimum followers must be a whole number of zero or more.');
    }

    if (feePercent < 0 || feePercent > 100) {
      throw fail('Platform fee percent must be from 0 to 100.');
    }

    if (minimumPrice <= 0) {
      throw fail('Minimum monthly Writer membership price must be greater than zero.');
    }

    if (maximumPrice !== null && maximumPrice < minimumPrice) {
      throw fail('Maximum monthly price cannot be below the minimum monthly price.');
    }

    const [[existing]] = await pool.query(
      `
      SELECT id
      FROM writer_membership_settings
      ORDER BY id ASC
      LIMIT 1
      `
    );

    if (existing) {
      await pool.query(
        `
        UPDATE writer_membership_settings
        SET
          enabled = ?,
          minimum_followers = ?,
          platform_fee_percent = ?,
          minimum_monthly_price_usd = ?,
          maximum_monthly_price_usd = ?,
          updated_by_user_id = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [
          enabled,
          minimumFollowers,
          feePercent,
          minimumPrice,
          maximumPrice,
          req.user.id,
          existing.id,
        ]
      );
    } else {
      await pool.query(
        `
        INSERT INTO writer_membership_settings (
          enabled,
          minimum_followers,
          platform_fee_percent,
          minimum_monthly_price_usd,
          maximum_monthly_price_usd,
          updated_by_user_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          enabled,
          minimumFollowers,
          feePercent,
          minimumPrice,
          maximumPrice,
          req.user.id,
        ]
      );
    }

    return res.status(200).json({
      ok: true,
      message: 'Writer membership policy updated.',
      policy: await getWriterMembershipPolicy(),
    });
  } catch (error) {
    return sendError(res, error, 'Failed to update Writer membership policy.');
  }
}

async function listAdminReaderSubscriptions(req, res) {
  try {
    const [subscriptions] = await pool.query(
      `
      SELECT
        rs.id,
        rs.reader_user_id,
        rs.plan_id,
        rs.amount_paid_usd,
        rs.currency_code,
        rs.status,
        rs.starts_at,
        rs.ends_at,
        rs.provider_name,
        rs.provider_reference,
        rs.approved_by_user_id,
        rs.created_at,
        rs.updated_at,
        rsp.name AS plan_name
      FROM reader_subscriptions rs
      INNER JOIN reader_subscription_plans rsp
        ON rsp.id = rs.plan_id
      ORDER BY rs.id DESC
      LIMIT 1000
      `
    );

    return res.status(200).json({
      ok: true,
      subscriptions,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Reader subscriptions.');
  }
}

async function activateAdminReaderSubscription(req, res) {
  try {
    const subscription = await activateReaderPlatformSubscription({
      readerUserId: req.body?.reader_user_id,
      planId: req.body?.plan_id,
      amountPaidUsd: req.body?.amount_paid_usd,
      providerName: req.body?.provider_name,
      providerReference: req.body?.provider_reference,
      approvedByUserId: req.user.id,
    });

    return res.status(201).json({
      ok: true,
      message: 'Verified Reader platform subscription activated.',
      subscription,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to activate Reader subscription.');
  }
}

async function listAdminWriterMemberships(req, res) {
  try {
    const [memberships] = await pool.query(
      `
      SELECT
        wm.id,
        wm.reader_user_id,
        wm.writer_user_id,
        wm.offer_id,
        wm.amount_paid_usd,
        wm.gross_amount_usd,
        wm.platform_fee_percent,
        wm.platform_fee_usd,
        wm.writer_net_usd,
        wm.currency_code,
        wm.status,
        wm.starts_at,
        wm.ends_at,
        wm.provider_name,
        wm.provider_reference,
        wm.approved_by_user_id,
        wm.created_at,
        wm.updated_at
      FROM writer_memberships wm
      ORDER BY wm.id DESC
      LIMIT 1000
      `
    );

    return res.status(200).json({
      ok: true,
      memberships,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to load Writer memberships.');
  }
}

async function activateAdminWriterMembership(req, res) {
  try {
    const membership = await activateWriterMembership({
      readerUserId: req.body?.reader_user_id,
      writerUserId: req.body?.writer_user_id,
      amountPaidUsd: req.body?.amount_paid_usd,
      providerName: req.body?.provider_name,
      providerReference: req.body?.provider_reference,
      approvedByUserId: req.user.id,
    });

    return res.status(201).json({
      ok: true,
      message: 'Verified direct Writer membership activated and earnings credited.',
      membership,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to activate Writer membership.');
  }
}

module.exports = {
  getPublicWriterMembership,
  getReaderPost,
  getReaderSubscription,
  getReaderMemberships,
  getReaderPlans,
  getWriterPostAccess,
  updateWriterPostAccess,
  getWriterMembershipOffer,
  updateWriterMembershipOffer,
  getMyWriterMembers,
  listAdminReaderPlans,
  createAdminReaderPlan,
  updateAdminReaderPlan,
  getAdminWriterMembershipPolicy,
  updateAdminWriterMembershipPolicy,
  listAdminReaderSubscriptions,
  activateAdminReaderSubscription,
  listAdminWriterMemberships,
  activateAdminWriterMembership,
};