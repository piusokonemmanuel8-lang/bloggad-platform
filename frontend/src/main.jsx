import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import './styles/global.css';

import { AuthProvider } from './context/AuthContext';

import AuthLayout from './layouts/AuthLayout';
import AffiliateLayout from './layouts/AffiliateLayout';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerLoginPage from './pages/auth/CustomerLoginPage';
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage';

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
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminAffiliateAdsPage from './pages/admin/AdminAffiliateAdsPage';
import AdminAffiliateAdsSettingsPage from './pages/admin/AdminAffiliateAdsSettingsPage';

import HomePage from './pages/public/HomePage';
import WebsiteStorefrontPage from './pages/public/WebsiteStorefrontPage';
import CategoryPage from './pages/public/CategoryPage';
import ProductPage from './pages/public/ProductPage';
import PostPage from './pages/public/PostPage';
import WebsitePostsPage from './pages/public/WebsitePostsPage';
import WebsiteCategoryPage from './pages/public/WebsiteCategoryPage';

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
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<App />}>
              <Route index element={<HomePage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path=":websiteSlug" element={<WebsiteStorefrontPage />} />
              <Route path=":websiteSlug/posts" element={<WebsitePostsPage />} />
              <Route path=":websiteSlug/category/:slug" element={<WebsiteCategoryPage />} />
              <Route path=":websiteSlug/product/:slug" element={<ProductPage />} />
              <Route path=":websiteSlug/post/:slug" element={<PostPage />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/customer/login" element={<CustomerLoginPage />} />
            <Route path="/customer/register" element={<CustomerRegisterPage />} />
          </Route>

          <Route element={<AffiliateLayout />}>
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
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);