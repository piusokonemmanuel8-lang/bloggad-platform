const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { notFound } = require('./middleware/notFoundMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const affiliateDashboardRoutes = require('./routes/affiliate/affiliateDashboardRoutes');
const affiliateWebsiteRoutes = require('./routes/affiliate/affiliateWebsiteRoutes');
const affiliateProductRoutes = require('./routes/affiliate/affiliateProductRoutes');
const affiliatePostRoutes = require('./routes/affiliate/affiliatePostRoutes');
const affiliateSubscriptionRoutes = require('./routes/affiliate/affiliateSubscriptionRoutes');
const affiliateMenuRoutes = require('./routes/affiliate/affiliateMenuRoutes');
const affiliateSliderRoutes = require('./routes/affiliate/affiliateSliderRoutes');
const affiliateDesignRoutes = require('./routes/affiliate/affiliateDesignRoutes');
const affiliateAnalyticsRoutes = require('./routes/affiliate/affiliateAnalyticsRoutes');
const affiliateMediaRoutes = require('./routes/affiliate/affiliateMediaRoutes');

const adminDashboardRoutes = require('./routes/admin/adminDashboardRoutes');
const adminCategoryRoutes = require('./routes/admin/adminCategoryRoutes');
const adminTemplateRoutes = require('./routes/admin/adminTemplateRoutes');
const adminPlanRoutes = require('./routes/admin/adminPlanRoutes');
const adminAffiliateRoutes = require('./routes/admin/adminAffiliateRoutes');
const adminProductRoutes = require('./routes/admin/adminProductRoutes');
const adminPostRoutes = require('./routes/admin/adminPostRoutes');
const adminLinkValidationRoutes = require('./routes/admin/adminLinkValidationRoutes');

const publicHomeRoutes = require('./routes/public/publicHomeRoutes');
const publicWebsiteRoutes = require('./routes/public/publicWebsiteRoutes');
const publicCategoryRoutes = require('./routes/public/publicCategoryRoutes');
const publicProductRoutes = require('./routes/public/publicProductRoutes');
const publicPostRoutes = require('./routes/public/publicPostRoutes');

function createApp() {
  const app = express();

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';

  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  app.use(
    cors({
      origin: [FRONTEND_URL],
      credentials: true,
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        ok: false,
        message: 'Too many requests. Please try again later.',
      },
    })
  );

  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/', (req, res) => {
    res.status(200).json({
      ok: true,
      message: 'Bloggad backend is running',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/uploads', uploadRoutes);

  app.use('/api/affiliate/dashboard', affiliateDashboardRoutes);
  app.use('/api/affiliate/website', affiliateWebsiteRoutes);
  app.use('/api/affiliate/products', affiliateProductRoutes);
  app.use('/api/affiliate/posts', affiliatePostRoutes);
  app.use('/api/affiliate/subscription', affiliateSubscriptionRoutes);
  app.use('/api/affiliate/menus', affiliateMenuRoutes);
  app.use('/api/affiliate/sliders', affiliateSliderRoutes);
  app.use('/api/affiliate/design', affiliateDesignRoutes);
  app.use('/api/affiliate/analytics', affiliateAnalyticsRoutes);
  app.use('/api/affiliate/media', affiliateMediaRoutes);

  app.use('/api/admin/dashboard', adminDashboardRoutes);
  app.use('/api/admin/categories', adminCategoryRoutes);
  app.use('/api/admin/templates', adminTemplateRoutes);
  app.use('/api/admin/plans', adminPlanRoutes);
  app.use('/api/admin/affiliates', adminAffiliateRoutes);
  app.use('/api/admin/products', adminProductRoutes);
  app.use('/api/admin/posts', adminPostRoutes);
  app.use('/api/admin/link-validation', adminLinkValidationRoutes);

  app.use('/api/public/home', publicHomeRoutes);
  app.use('/api/public/websites', publicWebsiteRoutes);
  app.use('/api/public/categories', publicCategoryRoutes);
  app.use('/api/public/products', publicProductRoutes);
  app.use('/api/public/posts', publicPostRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;