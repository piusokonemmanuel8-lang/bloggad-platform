import React from 'react';
const PublicSalesLandingPage = React.lazy(() => import('./pages/public/PublicSalesLandingPage'));
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BloggadGlobalLoader from './components/shared/BloggadGlobalLoader';
import WriterPaidPlanGate from './components/writer/WriterPaidPlanGate';
import App from './App';
import './styles/global.css';

import { AuthProvider } from './context/AuthContext';

import AuthLayout from './layouts/AuthLayout';
import AffiliateLayout from './layouts/AffiliateLayout';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';




import HomePage from './pages/public/HomePage';



import WriterSalesLandingPagesPage from './pages/writer/WriterSalesLandingPagesPage';



// Route-level code splitting: keep homepage eager, defer other pages.
const WriterPagesPage = React.lazy(() => import('./pages/writer/WriterPagesPage'));
const PublicWriterPage = React.lazy(() => import('./pages/public/PublicWriterPage'));
const WriterPagePostPage = React.lazy(() => import('./pages/public/WriterPagePostPage'));
const PublicTopicsPage = React.lazy(() => import('./pages/public/PublicTopicsPage'));
const PublicCategoriesPage = React.lazy(() => import('./pages/public/PublicCategoriesPage'));
const PublicTopicPage = React.lazy(() => import('./pages/public/PublicTopicPage'));
const AdminReadingCorePage = React.lazy(() => import('./pages/admin/AdminReadingCorePage'));
const ReaderFeedPage = React.lazy(() => import('./pages/reader/ReaderFeedPage'));
const ReaderInterestsPage = React.lazy(() => import('./pages/reader/ReaderInterestsPage'));
const ReaderReadingControlsPage = React.lazy(() => import('./pages/reader/ReaderReadingControlsPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const AdminLoginPage = React.lazy(() => import('./pages/auth/AdminLoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const CustomerLoginPage = React.lazy(() => import('./pages/auth/CustomerLoginPage'));
const CustomerRegisterPage = React.lazy(() => import('./pages/auth/CustomerRegisterPage'));
const SupgadSsoPage = React.lazy(() => import('./pages/auth/SupgadSsoPage'));
const AffiliateDashboardPage = React.lazy(() => import('./pages/affiliate/AffiliateDashboardPage'));
const AffiliateWebsitePage = React.lazy(() => import('./pages/affiliate/AffiliateWebsitePage'));
const AffiliateProductsPage = React.lazy(() => import('./pages/affiliate/AffiliateProductsPage'));
const AffiliateCreateProductPage = React.lazy(() => import('./pages/affiliate/AffiliateCreateProductPage'));
const AffiliateEditProductPage = React.lazy(() => import('./pages/affiliate/AffiliateEditProductPage'));
const AffiliateProductPostsPage = React.lazy(() => import('./pages/affiliate/AffiliateProductPostsPage'));
const AffiliatePostsPage = React.lazy(() => import('./pages/affiliate/AffiliatePostsPage'));
const AffiliateCreatePostPage = React.lazy(() => import('./pages/affiliate/AffiliateCreatePostPage'));
const AffiliateEditPostPage = React.lazy(() => import('./pages/affiliate/AffiliateEditPostPage'));
const AffiliateChooseTemplatePage = React.lazy(() => import('./pages/affiliate/AffiliateChooseTemplatePage'));
const AffiliateMenusPage = React.lazy(() => import('./pages/affiliate/AffiliateMenusPage'));
const AffiliateSlidersPage = React.lazy(() => import('./pages/affiliate/AffiliateSlidersPage'));
const AffiliateDesignPage = React.lazy(() => import('./pages/affiliate/AffiliateDesignPage'));
const AffiliateAnalyticsPage = React.lazy(() => import('./pages/affiliate/AffiliateAnalyticsPage'));
const AffiliateMediaLibraryPage = React.lazy(() => import('./pages/affiliate/AffiliateMediaLibraryPage'));
const AffiliateSubscriptionPage = React.lazy(() => import('./pages/affiliate/AffiliateSubscriptionPage'));
const AffiliateSettingsPage = React.lazy(() => import('./pages/affiliate/AffiliateSettingsPage'));
const AffiliateChatsPage = React.lazy(() => import('./pages/affiliate/AffiliateChatsPage'));
const AffiliateCustomersPage = React.lazy(() => import('./pages/affiliate/AffiliateCustomersPage'));
const AffiliateEmailListsPage = React.lazy(() => import('./pages/affiliate/AffiliateEmailListsPage'));
const AffiliateMonetizationEligibilityPage = React.lazy(() => import('./pages/affiliate/AffiliateMonetizationEligibilityPage'));
const AffiliateMyAdsPage = React.lazy(() => import('./pages/affiliate/AffiliateMyAdsPage'));
const AffiliateBlogPulseAnalyticsPage = React.lazy(() => import('./pages/affiliate/AffiliateBlogPulseAnalyticsPage'));
const AffiliateBlogPulseWalletPage = React.lazy(() => import('./pages/affiliate/AffiliateBlogPulseWalletPage'));
const AffiliateAdPlacementPage = React.lazy(() => import('./pages/affiliate/AffiliateAdPlacementPage'));
const AffiliateMonetizationAnalyticsOverviewPage = React.lazy(() => import('./pages/affiliate/AffiliateMonetizationAnalyticsOverviewPage'));
const AffiliateNotificationsPage = React.lazy(() => import('./pages/affiliate/AffiliateNotificationsPage'));
const AffiliateAdsPage = React.lazy(() => import('./pages/affiliate/AffiliateAdsPage'));
const WriterAdsPage = React.lazy(() => import('./pages/writer/WriterAdsPage'));
const AffiliateLeaderboardPage = React.lazy(() => import('./pages/affiliate/AffiliateLeaderboardPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminCategoriesPage = React.lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminTemplatesPage = React.lazy(() => import('./pages/admin/AdminTemplatesPage'));
const AdminPlansPage = React.lazy(() => import('./pages/admin/AdminPlansPage'));
const AdminAffiliatesPage = React.lazy(() => import('./pages/admin/AdminAffiliatesPage'));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminPostsPage = React.lazy(() => import('./pages/admin/AdminPostsPage'));
const AdminLinkValidationPage = React.lazy(() => import('./pages/admin/AdminLinkValidationPage'));
const AdminChatsPage = React.lazy(() => import('./pages/admin/AdminChatsPage'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminEmailListsPage = React.lazy(() => import('./pages/admin/AdminEmailListsPage'));
const AdminBlogPulsePage = React.lazy(() => import('./pages/admin/AdminBlogPulsePage'));
const AdminCampaignModerationPage = React.lazy(() => import('./pages/admin/AdminCampaignModerationPage'));
const AdminCampaignModerationDetailsPage = React.lazy(() => import('./pages/admin/AdminCampaignModerationDetailsPage'));
const AdminPaymentModerationPage = React.lazy(() => import('./pages/admin/AdminPaymentModerationPage'));
const AdminPaymentModerationDetailsPage = React.lazy(() => import('./pages/admin/AdminPaymentModerationDetailsPage'));
const AdminWriterWithdrawalsPage = React.lazy(() => import('./pages/admin/AdminWriterWithdrawalsPage'));
const AdminPaymentGatewaysPage = React.lazy(() => import('./pages/admin/AdminPaymentGatewaysPage'));
const AdminSupgadIntegrationPage = React.lazy(() => import('./pages/admin/AdminSupgadIntegrationPage'));
const AdminWebinarInfrastructurePage = React.lazy(() => import('./pages/admin/AdminWebinarInfrastructurePage'));
const AdminNotificationsPage = React.lazy(() => import('./pages/admin/AdminNotificationsPage'));
const AdminAffiliateAdsPage = React.lazy(() => import('./pages/admin/AdminAffiliateAdsPage'));
const AdminAffiliateAdsSettingsPage = React.lazy(() => import('./pages/admin/AdminAffiliateAdsSettingsPage'));
const AdminBannerHomeSlidesPage = React.lazy(() => import('./pages/admin/AdminBannerHomeSlidesPage'));
const AdminBannerHomeAdCampaignsPage = React.lazy(() => import('./pages/admin/AdminBannerHomeAdCampaignsPage'));
const AdminLeaderboardPage = React.lazy(() => import('./pages/admin/AdminLeaderboardPage'));
const AdminCurrenciesPage = React.lazy(() => import('./pages/admin/AdminCurrenciesPage'));
const WebsiteStorefrontPage = React.lazy(() => import('./pages/public/WebsiteStorefrontPage'));
const CategoryPage = React.lazy(() => import('./pages/public/CategoryPage'));
const ProductPage = React.lazy(() => import('./pages/public/ProductPage'));
const PostPage = React.lazy(() => import('./pages/public/PostPage'));
const WriterProfilePage = React.lazy(() => import('./pages/public/WriterProfilePage'));
const PublicWebinarRegistrationPage = React.lazy(() => import('./pages/public/PublicWebinarRegistrationPage'));
const WebsitePostsPage = React.lazy(() => import('./pages/public/WebsitePostsPage'));
const WebsiteCategoryPage = React.lazy(() => import('./pages/public/WebsiteCategoryPage'));
const WebsitePostCategoryPage = React.lazy(() => import('./pages/public/WebsitePostCategoryPage'));
const LegalPage = React.lazy(() => import('./pages/public/legal/LegalPage'));
const CustomerDashboardPage = React.lazy(() => import('./pages/customer/CustomerDashboardPage'));
const CustomerAdvertiserDashboardPage = React.lazy(() => import('./pages/customer/CustomerAdvertiserDashboardPage'));
const CustomerAdvertiserProfilePage = React.lazy(() => import('./pages/customer/CustomerAdvertiserProfilePage'));
const CustomerAdvertiserWalletPage = React.lazy(() => import('./pages/customer/CustomerAdvertiserWalletPage'));
const CustomerAdvertiserCampaignsPage = React.lazy(() => import('./pages/customer/CustomerAdvertiserCampaignsPage'));
const CustomerAdvertiserCreateCampaignPage = React.lazy(() => import('./pages/customer/CustomerAdvertiserCreateCampaignPage'));
const CustomerAdvertiserCampaignDetailsPage = React.lazy(() => import('./pages/customer/CustomerAdvertiserCampaignDetailsPage'));
const CustomerAdvertiserCreativesPage = React.lazy(() => import('./pages/customer/CustomerAdvertiserCreativesPage'));
const CustomerSavedPostsPage = React.lazy(() => import('./pages/customer/CustomerSavedPostsPage'));
const CustomerSavedProductsPage = React.lazy(() => import('./pages/customer/CustomerSavedProductsPage'));
const CustomerMessagesPage = React.lazy(() => import('./pages/customer/CustomerMessagesPage'));
const CustomerSettingsPage = React.lazy(() => import('./pages/customer/CustomerSettingsPage'));
const WriterSeriesPage = React.lazy(() => import('./pages/writer/WriterSeriesPage'));
const WriterCoursesPage = React.lazy(() => import('./pages/writer/WriterCoursesPage'));
const WriterWebinarsPage = React.lazy(() => import('./pages/writer/WriterWebinarsPage'));
const WriterCreateWebinarPage = React.lazy(() => import('./pages/writer/WriterCreateWebinarPage'));
const WriterManageWebinarPage = React.lazy(() => import('./pages/writer/WriterManageWebinarPage'));
const WriterWebinarPlansPage = React.lazy(() => import('./pages/writer/WriterWebinarPlansPage'));
const WriterWebinarHostRoomPage = React.lazy(() => import('./pages/writer/WriterWebinarHostRoomPage'));
const WriterCommunityPage = React.lazy(() => import('./pages/writer/WriterCommunityPage'));
const WriterWalletPage = React.lazy(() => import('./pages/writer/WriterWalletPage'));
const WriterMembershipsPage = React.lazy(() => import('./pages/writer/WriterMembershipsPage'));
const WriterSocialNotificationsPage = React.lazy(() => import('./pages/writer/WriterSocialNotificationsPage'));
const ReaderFollowingPage = React.lazy(() => import('./pages/reader/ReaderFollowingPage'));
const ReaderNotificationsPage = React.lazy(() => import('./pages/reader/ReaderNotificationsPage'));
const ReaderCreditsPage = React.lazy(() => import('./pages/reader/ReaderCreditsPage'));
const ReaderPremiumPage = React.lazy(() => import('./pages/reader/ReaderPremiumPage'));
const ReaderCoursesPage = React.lazy(() => import('./pages/reader/ReaderCoursesPage'));
const ReaderAppreciationsPage = React.lazy(() => import('./pages/reader/ReaderAppreciationsPage'));
const SharedProfilePage = React.lazy(() => import('./pages/shared/SharedProfilePage'));

function CustomerProtectedRoute({ children }) {
  const token =
    localStorage.getItem('customerToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token');

  const rawUser =
    localStorage.getItem('customerUser') ||
    localStorage.getItem('user');

  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    user = null;
  }

  if (!token) {
    return <Navigate to="/customer/login" replace />;
  }

  if (user?.role && user.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ReaderProtectedRoute({ children }) {
  const token =
    localStorage.getItem('bloggad_token') ||
    localStorage.getItem('customerToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken');

  const rawUser =
    localStorage.getItem('bloggad_user') ||
    localStorage.getItem('customerUser') ||
    localStorage.getItem('user');

  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    user = null;
  }

  if (!token) {
    return <Navigate to="/reader/login" replace />;
  }

  if (
    user?.role &&
    !['customer', 'affiliate'].includes(String(user.role).toLowerCase())
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
                <BloggadGlobalLoader />
        <React.Suspense fallback={null}>
<Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="legal/:slug" element={<LegalPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="topics" element={<PublicTopicsPage />} />
              <Route path="categories" element={<PublicCategoriesPage />} />
              <Route path="topic/:slug" element={<PublicTopicPage />} />
              <Route path="/sales/:landingSlug" element={<React.Suspense fallback={<main className="public-sales-landing state">Loading...</main>}><PublicSalesLandingPage /></React.Suspense>} />
              <Route path="page/:pageSlug" element={<PublicWriterPage />} />
              <Route path="page/:pageSlug/post/:postSlug" element={<WriterPagePostPage />} />
              <Route path="webinars/:writerPageSlug/:webinarSlug" element={<PublicWebinarRegistrationPage />} />
              <Route path=":websiteSlug" element={<WebsiteStorefrontPage />} />
              <Route path=":websiteSlug/posts" element={<WebsitePostsPage />} />
              <Route
                path=":websiteSlug/posts/category/:categorySlug"
                element={<WebsitePostCategoryPage />}
              />
              <Route path=":websiteSlug/category/:slug" element={<WebsiteCategoryPage />} />
              <Route path=":websiteSlug/product/:slug" element={<ProductPage />} />
              <Route path=":websiteSlug/post/:slug" element={<PostPage />} />
              <Route path=":websiteSlug/writer/:writerId" element={<WriterProfilePage />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/customer/login" element={<CustomerLoginPage />} />
            <Route path="/customer/register" element={<CustomerRegisterPage />} />
            <Route path="/reader/login" element={<CustomerLoginPage />} />
            <Route path="/reader/register" element={<CustomerRegisterPage />} />
            <Route path="/writer/login" element={<LoginPage />} />
            <Route path="/writer/register" element={<RegisterPage />} />
            <Route path="/auth/supgad" element={<SupgadSsoPage />} />
          </Route>

          <Route path="/profile" element={<SharedProfilePage />} />
          <Route path="/reader/profile" element={<SharedProfilePage />} />
          <Route path="/writer/profile" element={<SharedProfilePage />} />

          <Route element={<AffiliateLayout />}>
            <Route path="/writer/dashboard" element={<AffiliateDashboardPage />} />
            <Route path="/writer/pages" element={<WriterPagesPage />} />
            <Route path="/writer/sales-landing" element={<WriterPaidPlanGate feature="Sales Landing Pages"><WriterSalesLandingPagesPage /></WriterPaidPlanGate>} />
            <Route
              path="/writer/website"
              element={
                <WriterPaidPlanGate feature="Storefront">
                  <AffiliateWebsitePage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/writer/products"
              element={
                <WriterPaidPlanGate feature="Products">
                  <AffiliateProductsPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/writer/products/create"
              element={
                <WriterPaidPlanGate feature="Products">
                  <AffiliateCreateProductPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/writer/products/:id/edit"
              element={
                <WriterPaidPlanGate feature="Products">
                  <AffiliateEditProductPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/writer/products/:id/posts"
              element={
                <WriterPaidPlanGate feature="Product publishing">
                  <AffiliateProductPostsPage />
                </WriterPaidPlanGate>
              }
            />
            <Route path="/writer/posts" element={<AffiliatePostsPage />} />
            <Route path="/writer/posts/create" element={<AffiliateCreatePostPage />} />
            <Route path="/writer/posts/:id/edit" element={<AffiliateEditPostPage />} />
            <Route path="/writer/templates/choose" element={<WriterPaidPlanGate feature="Templates"><AffiliateChooseTemplatePage /></WriterPaidPlanGate>} />
            <Route
              path="/writer/menus"
              element={
                <WriterPaidPlanGate feature="Storefront Menus">
                  <AffiliateMenusPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/writer/sliders"
              element={
                <WriterPaidPlanGate feature="Storefront Sliders">
                  <AffiliateSlidersPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/writer/design"
              element={
                <WriterPaidPlanGate feature="Storefront Design">
                  <AffiliateDesignPage />
                </WriterPaidPlanGate>
              }
            />
            <Route path="/writer/analytics" element={<AffiliateAnalyticsPage />} />
            <Route path="/writer/media" element={<AffiliateMediaLibraryPage />} />
            <Route path="/writer/readers" element={<WriterPaidPlanGate feature="Readers"><AffiliateCustomersPage /></WriterPaidPlanGate>} />
            <Route path="/writer/email-lists" element={<WriterPaidPlanGate feature="Email Lists"><AffiliateEmailListsPage /></WriterPaidPlanGate>} />
            <Route path="/writer/messages" element={<AffiliateChatsPage />} />
            <Route path="/writer/plan" element={<AffiliateSubscriptionPage />} />
            <Route path="/writer/settings" element={<AffiliateSettingsPage />} />
            <Route path="/writer/series" element={<WriterPaidPlanGate feature="Series and Books"><WriterSeriesPage /></WriterPaidPlanGate>} />
            <Route path="/writer/courses" element={<WriterPaidPlanGate feature="Courses"><WriterCoursesPage /></WriterPaidPlanGate>} />
                <Route path="/writer/webinars" element={<WriterWebinarsPage />} />
                <Route path="/writer/webinars/plans" element={<WriterWebinarPlansPage />} />
                <Route path="/writer/webinars/:id/room" element={<WriterWebinarHostRoomPage />} />
                <Route path="/writer/webinars/create" element={<WriterCreateWebinarPage />} />
                <Route path="/writer/webinars/:id" element={<WriterManageWebinarPage />} />
            <Route path="/writer/community" element={<WriterPaidPlanGate feature="Community"><WriterCommunityPage /></WriterPaidPlanGate>} />
            <Route path="/writer/wallet" element={<WriterPaidPlanGate feature="Writer Wallet"><WriterWalletPage /></WriterPaidPlanGate>} />
            <Route path="/writer/memberships" element={<WriterPaidPlanGate feature="Memberships"><WriterMembershipsPage /></WriterPaidPlanGate>} />
            <Route path="/writer/notifications" element={<WriterSocialNotificationsPage />} />
            <Route path="/writer/leaderboard" element={<WriterPaidPlanGate feature="Leaderboard"><AffiliateLeaderboardPage /></WriterPaidPlanGate>} />
            <Route path="/writer/ads" element={<WriterAdsPage />} />
            <Route path="/writer/monetization" element={<Navigate to="/writer/monetization/eligibility" replace />} />
            <Route path="/writer/monetization/eligibility" element={<WriterPaidPlanGate feature="Monetization"><AffiliateMonetizationEligibilityPage /></WriterPaidPlanGate>} />
            <Route path="/writer/monetization/analytics" element={<WriterPaidPlanGate feature="Monetization"><AffiliateMonetizationAnalyticsOverviewPage /></WriterPaidPlanGate>} />
            <Route path="/writer/monetization/blogpulse-analytics" element={<WriterPaidPlanGate feature="BlogPulse Earnings"><AffiliateBlogPulseAnalyticsPage /></WriterPaidPlanGate>} />
            <Route path="/writer/monetization/my-ads" element={<WriterPaidPlanGate feature="My Ads"><AffiliateMyAdsPage /></WriterPaidPlanGate>} />
            <Route path="/writer/monetization/ad-placement" element={<WriterPaidPlanGate feature="Ad Placement"><AffiliateAdPlacementPage /></WriterPaidPlanGate>} />

            <Route path="/affiliate/dashboard" element={<AffiliateDashboardPage />} />
            <Route path="/affiliate/website" element={<Navigate to="/writer/website" replace />} />
            <Route
              path="/affiliate/products"
              element={
                <WriterPaidPlanGate feature="Products">
                  <AffiliateProductsPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/affiliate/products/create"
              element={
                <WriterPaidPlanGate feature="Products">
                  <AffiliateCreateProductPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/affiliate/products/:id/edit"
              element={
                <WriterPaidPlanGate feature="Products">
                  <AffiliateEditProductPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/affiliate/products/:id/posts"
              element={
                <WriterPaidPlanGate feature="Product publishing">
                  <AffiliateProductPostsPage />
                </WriterPaidPlanGate>
              }
            />
            <Route path="/affiliate/posts" element={<AffiliatePostsPage />} />
            <Route path="/affiliate/posts/create" element={<AffiliateCreatePostPage />} />
            <Route path="/affiliate/posts/:id/edit" element={<AffiliateEditPostPage />} />
            <Route path="/affiliate/templates/choose" element={<AffiliateChooseTemplatePage />} />
            <Route
              path="/affiliate/menus"
              element={
                <WriterPaidPlanGate feature="Storefront Menus">
                  <AffiliateMenusPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/affiliate/sliders"
              element={
                <WriterPaidPlanGate feature="Storefront Sliders">
                  <AffiliateSlidersPage />
                </WriterPaidPlanGate>
              }
            />
            <Route
              path="/affiliate/design"
              element={
                <WriterPaidPlanGate feature="Storefront Design">
                  <AffiliateDesignPage />
                </WriterPaidPlanGate>
              }
            />
            <Route path="/affiliate/analytics" element={<AffiliateAnalyticsPage />} />
            <Route path="/affiliate/media" element={<AffiliateMediaLibraryPage />} />
            <Route path="/affiliate/customers" element={<AffiliateCustomersPage />} />
            <Route path="/affiliate/email-lists" element={<AffiliateEmailListsPage />} />
            <Route path="/affiliate/chats" element={<AffiliateChatsPage />} />
            <Route path="/affiliate/subscription" element={<AffiliateSubscriptionPage />} />
            <Route path="/affiliate/notifications" element={<AffiliateNotificationsPage />} />
            <Route path="/affiliate/ads" element={<AffiliateAdsPage />} />
            <Route path="/affiliate/leaderboard" element={<AffiliateLeaderboardPage />} />
            <Route path="/affiliate/settings" element={<AffiliateSettingsPage />} />

            <Route
              path="/affiliate/monetization/eligibility"
              element={<AffiliateMonetizationEligibilityPage />}
            />
            <Route
              path="/affiliate/monetization/analytics"
              element={<AffiliateMonetizationAnalyticsOverviewPage />}
            />
            <Route
              path="/affiliate/monetization/blogpulse-analytics"
              element={<AffiliateBlogPulseAnalyticsPage />}
            />
            <Route
              path="/affiliate/monetization/wallet"
              element={<AffiliateBlogPulseWalletPage />}
            />
            <Route
              path="/affiliate/monetization/my-ads"
              element={<AffiliateMyAdsPage />}
            />
            <Route
              path="/affiliate/monetization/ad-placement"
              element={<AffiliateAdPlacementPage />}
            />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/leaderboard" element={<AdminLeaderboardPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/reading-core" element={<AdminReadingCorePage />} />
            <Route path="/admin/templates" element={<AdminTemplatesPage />} />
            <Route path="/admin/plans" element={<AdminPlansPage />} />
            <Route path="/admin/blogpulse" element={<AdminBlogPulsePage />} />
            <Route path="/admin/affiliates" element={<AdminAffiliatesPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/email-lists" element={<AdminEmailListsPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/posts" element={<AdminPostsPage />} />
            <Route path="/admin/chats" element={<AdminChatsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/affiliate-ads" element={<AdminAffiliateAdsPage />} />
            <Route
              path="/admin/affiliate-ads-settings"
              element={<AdminAffiliateAdsSettingsPage />}
            />
            <Route path="/admin/banner-home-slides" element={<AdminBannerHomeSlidesPage />} />
            <Route
              path="/admin/banner-home-ad-campaigns"
              element={<AdminBannerHomeAdCampaignsPage />}
            />
            <Route path="/admin/currencies" element={<AdminCurrenciesPage />} />
            <Route path="/admin/link-validation" element={<AdminLinkValidationPage />} />
            <Route path="/admin/campaign-moderation" element={<AdminCampaignModerationPage />} />
            <Route
              path="/admin/campaign-moderation/:campaignId"
              element={<AdminCampaignModerationDetailsPage />}
            />
            <Route path="/admin/payment-moderation" element={<AdminPaymentModerationPage />} />
            <Route
              path="/admin/payment-moderation/:paymentId"
              element={<AdminPaymentModerationDetailsPage />}
            />
            <Route path="/admin/writer-withdrawals" element={<AdminWriterWithdrawalsPage />} />
            <Route path="/admin/payment-gateways" element={<AdminPaymentGatewaysPage />} />
              <Route path="/admin/supgad-integration" element={<AdminSupgadIntegrationPage />} />
              <Route path="/admin/webinar-infrastructure" element={<AdminWebinarInfrastructurePage />} />
          </Route>

          <Route
            path="/customer/dashboard"
            element={
              <CustomerProtectedRoute>
                <CustomerDashboardPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/advertiser"
            element={
              <CustomerProtectedRoute>
                <CustomerAdvertiserDashboardPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/advertiser/profile"
            element={
              <CustomerProtectedRoute>
                <CustomerAdvertiserProfilePage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/advertiser/wallet"
            element={
              <CustomerProtectedRoute>
                <CustomerAdvertiserWalletPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/advertiser/campaigns"
            element={
              <CustomerProtectedRoute>
                <CustomerAdvertiserCampaignsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/advertiser/campaigns/create"
            element={
              <CustomerProtectedRoute>
                <CustomerAdvertiserCreateCampaignPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/advertiser/campaigns/:campaignId"
            element={
              <CustomerProtectedRoute>
                <CustomerAdvertiserCampaignDetailsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/advertiser/campaigns/:campaignId/creatives"
            element={
              <CustomerProtectedRoute>
                <CustomerAdvertiserCreativesPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/saved-posts"
            element={
              <CustomerProtectedRoute>
                <CustomerSavedPostsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/saved-products"
            element={
              <CustomerProtectedRoute>
                <CustomerSavedProductsPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/messages"
            element={
              <CustomerProtectedRoute>
                <CustomerMessagesPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/settings"
            element={
              <CustomerProtectedRoute>
                <CustomerSettingsPage />
              </CustomerProtectedRoute>
            }
          />

          <Route
            path="/reader/dashboard"
            element={<ReaderProtectedRoute><CustomerDashboardPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/saved-posts"
            element={<ReaderProtectedRoute><CustomerSavedPostsPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/saved-products"
            element={<ReaderProtectedRoute><CustomerSavedProductsPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/messages"
            element={<ReaderProtectedRoute><CustomerMessagesPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/settings"
            element={<ReaderProtectedRoute><CustomerSettingsPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/following"
            element={<ReaderProtectedRoute><ReaderFollowingPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/notifications"
            element={<ReaderProtectedRoute><ReaderNotificationsPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/credits"
            element={<ReaderProtectedRoute><ReaderCreditsPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/premium"
            element={<ReaderProtectedRoute><ReaderPremiumPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/courses"
            element={<ReaderProtectedRoute><ReaderCoursesPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/appreciations"
            element={<ReaderProtectedRoute><ReaderAppreciationsPage /></ReaderProtectedRoute>}
          />

          <Route
            path="/reader/feed"
            element={<ReaderProtectedRoute><ReaderFeedPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/interests"
            element={<ReaderProtectedRoute><ReaderInterestsPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/onboarding"
            element={<ReaderProtectedRoute><ReaderInterestsPage /></ReaderProtectedRoute>}
          />
          <Route
            path="/reader/reading-controls"
            element={<ReaderProtectedRoute><ReaderReadingControlsPage /></ReaderProtectedRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
</React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);