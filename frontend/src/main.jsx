import WriterPagesPage from './pages/writer/WriterPagesPage';
import PublicWriterPage from './pages/public/PublicWriterPage';
import WriterPagePostPage from './pages/public/WriterPagePostPage';
import PublicTopicsPage from './pages/public/PublicTopicsPage';
import PublicCategoriesPage from './pages/public/PublicCategoriesPage';
import PublicTopicPage from './pages/public/PublicTopicPage';
import AdminReadingCorePage from './pages/admin/AdminReadingCorePage';
import ReaderFeedPage from './pages/reader/ReaderFeedPage';
import ReaderInterestsPage from './pages/reader/ReaderInterestsPage';
import ReaderReadingControlsPage from './pages/reader/ReaderReadingControlsPage';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BloggadGlobalLoader from './components/shared/BloggadGlobalLoader';
import App from './App';
import './styles/global.css';

import { AuthProvider } from './context/AuthContext';

import AuthLayout from './layouts/AuthLayout';
import AffiliateLayout from './layouts/AffiliateLayout';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerLoginPage from './pages/auth/CustomerLoginPage';
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage';
import SupgadSsoPage from './pages/auth/SupgadSsoPage';

import AffiliateDashboardPage from './pages/affiliate/AffiliateDashboardPage';
import AffiliateWebsitePage from './pages/affiliate/AffiliateWebsitePage';
import AffiliateProductsPage from './pages/affiliate/AffiliateProductsPage';
import AffiliateCreateProductPage from './pages/affiliate/AffiliateCreateProductPage';
import AffiliateEditProductPage from './pages/affiliate/AffiliateEditProductPage';
import AffiliateProductPostsPage from './pages/affiliate/AffiliateProductPostsPage';
import AffiliatePostsPage from './pages/affiliate/AffiliatePostsPage';
import AffiliateCreatePostPage from './pages/affiliate/AffiliateCreatePostPage';
import AffiliateEditPostPage from './pages/affiliate/AffiliateEditPostPage';
import AffiliateChooseTemplatePage from './pages/affiliate/AffiliateChooseTemplatePage';
import AffiliateMenusPage from './pages/affiliate/AffiliateMenusPage';
import AffiliateSlidersPage from './pages/affiliate/AffiliateSlidersPage';
import AffiliateDesignPage from './pages/affiliate/AffiliateDesignPage';
import AffiliateAnalyticsPage from './pages/affiliate/AffiliateAnalyticsPage';
import AffiliateMediaLibraryPage from './pages/affiliate/AffiliateMediaLibraryPage';
import AffiliateSubscriptionPage from './pages/affiliate/AffiliateSubscriptionPage';
import AffiliateSettingsPage from './pages/affiliate/AffiliateSettingsPage';
import AffiliateChatsPage from './pages/affiliate/AffiliateChatsPage';
import AffiliateCustomersPage from './pages/affiliate/AffiliateCustomersPage';
import AffiliateEmailListsPage from './pages/affiliate/AffiliateEmailListsPage';
import AffiliateMonetizationEligibilityPage from './pages/affiliate/AffiliateMonetizationEligibilityPage';
import AffiliateMyAdsPage from './pages/affiliate/AffiliateMyAdsPage';
import AffiliateBlogPulseAnalyticsPage from './pages/affiliate/AffiliateBlogPulseAnalyticsPage';
import AffiliateBlogPulseWalletPage from './pages/affiliate/AffiliateBlogPulseWalletPage';
import AffiliateAdPlacementPage from './pages/affiliate/AffiliateAdPlacementPage';
import AffiliateMonetizationAnalyticsOverviewPage from './pages/affiliate/AffiliateMonetizationAnalyticsOverviewPage';
import AffiliateNotificationsPage from './pages/affiliate/AffiliateNotificationsPage';
import AffiliateAdsPage from './pages/affiliate/AffiliateAdsPage';
import WriterAdsPage from './pages/writer/WriterAdsPage';
import AffiliateLeaderboardPage from './pages/affiliate/AffiliateLeaderboardPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminTemplatesPage from './pages/admin/AdminTemplatesPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import AdminAffiliatesPage from './pages/admin/AdminAffiliatesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminLinkValidationPage from './pages/admin/AdminLinkValidationPage';
import AdminChatsPage from './pages/admin/AdminChatsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEmailListsPage from './pages/admin/AdminEmailListsPage';
import AdminBlogPulsePage from './pages/admin/AdminBlogPulsePage';
import AdminCampaignModerationPage from './pages/admin/AdminCampaignModerationPage';
import AdminCampaignModerationDetailsPage from './pages/admin/AdminCampaignModerationDetailsPage';
import AdminPaymentModerationPage from './pages/admin/AdminPaymentModerationPage';
import AdminPaymentModerationDetailsPage from './pages/admin/AdminPaymentModerationDetailsPage';
import AdminPaymentGatewaysPage from './pages/admin/AdminPaymentGatewaysPage';
import AdminSupgadIntegrationPage from './pages/admin/AdminSupgadIntegrationPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminAffiliateAdsPage from './pages/admin/AdminAffiliateAdsPage';
import AdminAffiliateAdsSettingsPage from './pages/admin/AdminAffiliateAdsSettingsPage';
import AdminBannerHomeSlidesPage from './pages/admin/AdminBannerHomeSlidesPage';
import AdminBannerHomeAdCampaignsPage from './pages/admin/AdminBannerHomeAdCampaignsPage';
import AdminLeaderboardPage from './pages/admin/AdminLeaderboardPage';
import AdminCurrenciesPage from './pages/admin/AdminCurrenciesPage';

import HomePage from './pages/public/HomePage';
import WebsiteStorefrontPage from './pages/public/WebsiteStorefrontPage';
import CategoryPage from './pages/public/CategoryPage';
import ProductPage from './pages/public/ProductPage';
import PostPage from './pages/public/PostPage';
import WriterProfilePage from './pages/public/WriterProfilePage';
import WebsitePostsPage from './pages/public/WebsitePostsPage';
import WebsiteCategoryPage from './pages/public/WebsiteCategoryPage';
import WebsitePostCategoryPage from './pages/public/WebsitePostCategoryPage';
import LegalPage from './pages/public/legal/LegalPage';

import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import CustomerAdvertiserDashboardPage from './pages/customer/CustomerAdvertiserDashboardPage';
import CustomerAdvertiserProfilePage from './pages/customer/CustomerAdvertiserProfilePage';
import CustomerAdvertiserWalletPage from './pages/customer/CustomerAdvertiserWalletPage';
import CustomerAdvertiserCampaignsPage from './pages/customer/CustomerAdvertiserCampaignsPage';
import CustomerAdvertiserCreateCampaignPage from './pages/customer/CustomerAdvertiserCreateCampaignPage';
import CustomerAdvertiserCampaignDetailsPage from './pages/customer/CustomerAdvertiserCampaignDetailsPage';
import CustomerAdvertiserCreativesPage from './pages/customer/CustomerAdvertiserCreativesPage';
import CustomerSavedPostsPage from './pages/customer/CustomerSavedPostsPage';
import CustomerSavedProductsPage from './pages/customer/CustomerSavedProductsPage';
import CustomerMessagesPage from './pages/customer/CustomerMessagesPage';
import CustomerSettingsPage from './pages/customer/CustomerSettingsPage';

import WriterSeriesPage from './pages/writer/WriterSeriesPage';
import WriterCoursesPage from './pages/writer/WriterCoursesPage';
import WriterCommunityPage from './pages/writer/WriterCommunityPage';
import WriterWalletPage from './pages/writer/WriterWalletPage';
import WriterMembershipsPage from './pages/writer/WriterMembershipsPage';
import WriterSocialNotificationsPage from './pages/writer/WriterSocialNotificationsPage';

import ReaderFollowingPage from './pages/reader/ReaderFollowingPage';
import ReaderNotificationsPage from './pages/reader/ReaderNotificationsPage';
import ReaderCreditsPage from './pages/reader/ReaderCreditsPage';
import ReaderPremiumPage from './pages/reader/ReaderPremiumPage';
import ReaderCoursesPage from './pages/reader/ReaderCoursesPage';
import ReaderAppreciationsPage from './pages/reader/ReaderAppreciationsPage';

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
                <BloggadGlobalLoader />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="legal/:slug" element={<LegalPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="topics" element={<PublicTopicsPage />} />
              <Route path="categories" element={<PublicCategoriesPage />} />
              <Route path="topic/:slug" element={<PublicTopicPage />} />
              <Route path="page/:pageSlug" element={<PublicWriterPage />} />
              <Route path="page/:pageSlug/post/:postSlug" element={<WriterPagePostPage />} />
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

          <Route element={<AffiliateLayout />}>
            <Route path="/writer/dashboard" element={<AffiliateDashboardPage />} />
            <Route path="/writer/pages" element={<WriterPagesPage />} />
            <Route path="/writer/website" element={<AffiliateWebsitePage />} />
            <Route path="/writer/products" element={<AffiliateProductsPage />} />
            <Route path="/writer/products/create" element={<AffiliateCreateProductPage />} />
            <Route path="/writer/products/:id/edit" element={<AffiliateEditProductPage />} />
            <Route path="/writer/products/:id/posts" element={<AffiliateProductPostsPage />} />
            <Route path="/writer/posts" element={<AffiliatePostsPage />} />
            <Route path="/writer/posts/create" element={<AffiliateCreatePostPage />} />
            <Route path="/writer/posts/:id/edit" element={<AffiliateEditPostPage />} />
            <Route path="/writer/templates/choose" element={<AffiliateChooseTemplatePage />} />
            <Route path="/writer/menus" element={<AffiliateMenusPage />} />
            <Route path="/writer/sliders" element={<AffiliateSlidersPage />} />
            <Route path="/writer/design" element={<AffiliateDesignPage />} />
            <Route path="/writer/analytics" element={<AffiliateAnalyticsPage />} />
            <Route path="/writer/media" element={<AffiliateMediaLibraryPage />} />
            <Route path="/writer/readers" element={<AffiliateCustomersPage />} />
            <Route path="/writer/email-lists" element={<AffiliateEmailListsPage />} />
            <Route path="/writer/messages" element={<AffiliateChatsPage />} />
            <Route path="/writer/plan" element={<AffiliateSubscriptionPage />} />
            <Route path="/writer/settings" element={<AffiliateSettingsPage />} />
            <Route path="/writer/series" element={<WriterSeriesPage />} />
            <Route path="/writer/courses" element={<WriterCoursesPage />} />
            <Route path="/writer/community" element={<WriterCommunityPage />} />
            <Route path="/writer/wallet" element={<WriterWalletPage />} />
            <Route path="/writer/memberships" element={<WriterMembershipsPage />} />
            <Route path="/writer/notifications" element={<WriterSocialNotificationsPage />} />
            <Route path="/writer/leaderboard" element={<AffiliateLeaderboardPage />} />
            <Route path="/writer/ads" element={<WriterAdsPage />} />
            <Route path="/writer/monetization" element={<Navigate to="/writer/monetization/eligibility" replace />} />
            <Route path="/writer/monetization/eligibility" element={<AffiliateMonetizationEligibilityPage />} />
            <Route path="/writer/monetization/analytics" element={<AffiliateMonetizationAnalyticsOverviewPage />} />
            <Route path="/writer/monetization/blogpulse-analytics" element={<AffiliateBlogPulseAnalyticsPage />} />
            <Route path="/writer/monetization/my-ads" element={<AffiliateMyAdsPage />} />
            <Route path="/writer/monetization/ad-placement" element={<AffiliateAdPlacementPage />} />

            <Route path="/affiliate/dashboard" element={<AffiliateDashboardPage />} />
            <Route path="/affiliate/website" element={<AffiliateWebsitePage />} />
            <Route path="/affiliate/products" element={<AffiliateProductsPage />} />
            <Route path="/affiliate/products/create" element={<AffiliateCreateProductPage />} />
            <Route path="/affiliate/products/:id/edit" element={<AffiliateEditProductPage />} />
            <Route path="/affiliate/products/:id/posts" element={<AffiliateProductPostsPage />} />
            <Route path="/affiliate/posts" element={<AffiliatePostsPage />} />
            <Route path="/affiliate/posts/create" element={<AffiliateCreatePostPage />} />
            <Route path="/affiliate/posts/:id/edit" element={<AffiliateEditPostPage />} />
            <Route path="/affiliate/templates/choose" element={<AffiliateChooseTemplatePage />} />
            <Route path="/affiliate/menus" element={<AffiliateMenusPage />} />
            <Route path="/affiliate/sliders" element={<AffiliateSlidersPage />} />
            <Route path="/affiliate/design" element={<AffiliateDesignPage />} />
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
            <Route path="/admin/payment-gateways" element={<AdminPaymentGatewaysPage />} />
              <Route path="/admin/supgad-integration" element={<AdminSupgadIntegrationPage />} />
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
            element={<CustomerProtectedRoute><CustomerDashboardPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/saved-posts"
            element={<CustomerProtectedRoute><CustomerSavedPostsPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/saved-products"
            element={<CustomerProtectedRoute><CustomerSavedProductsPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/messages"
            element={<CustomerProtectedRoute><CustomerMessagesPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/settings"
            element={<CustomerProtectedRoute><CustomerSettingsPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/following"
            element={<CustomerProtectedRoute><ReaderFollowingPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/notifications"
            element={<CustomerProtectedRoute><ReaderNotificationsPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/credits"
            element={<CustomerProtectedRoute><ReaderCreditsPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/premium"
            element={<CustomerProtectedRoute><ReaderPremiumPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/courses"
            element={<CustomerProtectedRoute><ReaderCoursesPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/appreciations"
            element={<CustomerProtectedRoute><ReaderAppreciationsPage /></CustomerProtectedRoute>}
          />

          <Route
            path="/reader/feed"
            element={<CustomerProtectedRoute><ReaderFeedPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/interests"
            element={<CustomerProtectedRoute><ReaderInterestsPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/onboarding"
            element={<CustomerProtectedRoute><ReaderInterestsPage /></CustomerProtectedRoute>}
          />
          <Route
            path="/reader/reading-controls"
            element={<CustomerProtectedRoute><ReaderReadingControlsPage /></CustomerProtectedRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
