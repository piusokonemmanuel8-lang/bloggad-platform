const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const { notFound } = require('./middleware/notFoundMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');

function resolveModule(candidates) {
  for (const rel of candidates) {
    const abs = path.join(__dirname, rel);
    const absJs = abs.endsWith('.js') ? abs : `${abs}.js`;

    if (fs.existsSync(abs)) return abs;
    if (fs.existsSync(absJs)) return absJs;
  }

  return null;
}

function loadRouter(label, candidates) {
  try {
    const resolved = resolveModule(candidates);

    if (!resolved) {
      console.warn(`[app] Missing route for ${label}: ${candidates.join(' | ')}`);
      return null;
    }

    const mod = require(resolved);
    return typeof mod === 'function' ? mod : null;
  } catch (error) {
    console.error(`[app] Failed loading ${label}:`, error.message);
    return null;
  }
}

function mount(app, basePath, label, candidates) {
  const router = loadRouter(label, candidates);
  if (!router) return;
  app.use(basePath, router);
  console.log(`[app] Mounted ${label} -> ${basePath}`);
}

function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => {
    return res.status(200).json({
      ok: true,
      message: 'Bloggad backend is running.',
    });
  });

  // auth + uploads
  mount(app, '/api/auth', 'authRoutes', [
    './routes/authRoutes',
  ]);

  mount(app, '/api/uploads', 'uploadRoutes', [
    './routes/uploadRoutes',
  ]);

  // affiliate core
  mount(app, '/api/affiliate/dashboard', 'affiliateDashboardRoutes', [
    './routes/affiliate/affiliateDashboardRoutes',
  ]);

  mount(app, '/api/affiliate/website', 'affiliateWebsiteRoutes', [
    './routes/affiliate/affiliateWebsiteRoutes',
    './routes/affiliate/affiliateWebsitesRoutes',
  ]);

  mount(app, '/api/affiliate/products', 'affiliateProductRoutes', [
    './routes/affiliate/affiliateProductRoutes',
    './routes/affiliate/affiliateProductsRoutes',
  ]);

  mount(app, '/api/affiliate/posts', 'affiliatePostRoutes', [
    './routes/affiliate/affiliatePostRoutes',
    './routes/affiliate/affiliatePostsRoutes',
  ]);

  mount(app, '/api/affiliate/subscription', 'affiliateSubscriptionRoutes', [
    './routes/affiliate/affiliateSubscriptionRoutes',
    './routes/affiliate/affiliateSubscriptionsRoutes',
  ]);

  mount(app, '/api/affiliate/menus', 'affiliateMenusRoutes', [
    './routes/affiliate/affiliateMenusRoutes',
    './routes/affiliate/affiliateMenuRoutes',
  ]);

  mount(app, '/api/affiliate/sliders', 'affiliateSlidersRoutes', [
    './routes/affiliate/affiliateSlidersRoutes',
    './routes/affiliate/affiliateSliderRoutes',
  ]);

  mount(app, '/api/affiliate/design', 'affiliateDesignRoutes', [
    './routes/affiliate/affiliateDesignRoutes',
  ]);

  mount(app, '/api/affiliate/analytics', 'affiliateAnalyticsRoutes', [
    './routes/affiliate/affiliateAnalyticsRoutes',
  ]);

  mount(app, '/api/affiliate/media', 'affiliateMediaRoutes', [
    './routes/affiliate/affiliateMediaRoutes',
    './routes/affiliate/affiliateMediaLibraryRoutes',
  ]);

  mount(app, '/api/affiliate/templates', 'affiliateTemplatesRoutes', [
    './routes/affiliate/affiliateTemplatesRoutes',
    './routes/affiliate/affiliateTemplateRoutes',
  ]);

  // admin core
  mount(app, '/api/admin/dashboard', 'adminDashboardRoutes', [
    './routes/admin/adminDashboardRoutes',
  ]);

  mount(app, '/api/admin/categories', 'adminCategoriesRoutes', [
    './routes/admin/adminCategoriesRoutes',
    './routes/admin/adminCategoryRoutes',
  ]);

  mount(app, '/api/admin/templates', 'adminTemplatesRoutes', [
    './routes/admin/adminTemplatesRoutes',
    './routes/admin/adminTemplateRoutes',
  ]);

  mount(app, '/api/admin/plans', 'adminPlansRoutes', [
    './routes/admin/adminPlansRoutes',
    './routes/admin/adminPlanRoutes',
  ]);

  mount(app, '/api/admin/affiliates', 'adminAffiliatesRoutes', [
    './routes/admin/adminAffiliatesRoutes',
    './routes/admin/adminAffiliateRoutes',
  ]);

  mount(app, '/api/admin/products', 'adminProductsRoutes', [
    './routes/admin/adminProductsRoutes',
    './routes/admin/adminProductRoutes',
  ]);

  mount(app, '/api/admin/posts', 'adminPostsRoutes', [
    './routes/admin/adminPostsRoutes',
    './routes/admin/adminPostRoutes',
  ]);

  mount(app, '/api/admin/link-validation', 'adminLinkValidationRoutes', [
    './routes/admin/adminLinkValidationRoutes',
  ]);

  // public
  mount(app, '/api/public/home', 'publicHomeRoutes', [
    './routes/public/publicHomeRoutes',
  ]);

  mount(app, '/api/public/websites', 'publicWebsiteRoutes', [
    './routes/public/publicWebsiteRoutes',
    './routes/public/publicWebsitesRoutes',
  ]);

  mount(app, '/api/public/categories', 'publicCategoryRoutes', [
    './routes/public/publicCategoryRoutes',
    './routes/public/publicCategoriesRoutes',
  ]);

  mount(app, '/api/public/products', 'publicProductRoutes', [
    './routes/public/publicProductRoutes',
    './routes/public/publicProductsRoutes',
  ]);

  mount(app, '/api/public/posts', 'publicPostRoutes', [
    './routes/public/publicPostRoutes',
    './routes/public/publicPostsRoutes',
  ]);

  mount(app, '/api/public', 'publicTemplateRoutes', [
    './routes/public/publicTemplateRoutes',
  ]);

  // customer
  mount(app, '/api/customer-auth', 'customerAuthRoutes', [
    './routes/customerAuthRoutes',
  ]);

  mount(app, '/api/customer', 'customerRoutes', [
    './routes/customerRoutes',
  ]);

  mount(app, '/api/customer/saved', 'customerSavedRoutes', [
    './routes/customerSavedRoutes',
  ]);

  mount(app, '/api/customer-management', 'customerManagementRoutes', [
    './routes/customerManagementRoutes',
  ]);

  // email list
  mount(app, '/api/email-list', 'emailLeadRoutes', [
    './routes/emailLeadRoutes',
  ]);

  // chats
  mount(app, '/api/customer-affiliate-chats', 'customerAffiliateChatRoutes', [
    './routes/customerAffiliateChatRoutes',
  ]);

  mount(app, '/api/customer-admin-chats', 'customerAdminChatRoutes', [
    './routes/customerAdminChatRoutes',
  ]);

  mount(app, '/api/affiliate-admin-chats', 'affiliateAdminChatRoutes', [
    './routes/affiliateAdminChatRoutes',
  ]);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;