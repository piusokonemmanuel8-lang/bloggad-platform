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

import AffiliateDashboardPage from './pages/affiliate/AffiliateDashboardPage';
import AffiliateWebsitePage from './pages/affiliate/AffiliateWebsitePage';
import AffiliateProductsPage from './pages/affiliate/AffiliateProductsPage';
import AffiliateCreateProductPage from './pages/affiliate/AffiliateCreateProductPage';
import AffiliateEditProductPage from './pages/affiliate/AffiliateEditProductPage';
import AffiliateProductPostsPage from './pages/affiliate/AffiliateProductPostsPage';
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

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminTemplatesPage from './pages/admin/AdminTemplatesPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import AdminAffiliatesPage from './pages/admin/AdminAffiliatesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminLinkValidationPage from './pages/admin/AdminLinkValidationPage';

import HomePage from './pages/public/HomePage';
import WebsiteStorefrontPage from './pages/public/WebsiteStorefrontPage';
import CategoryPage from './pages/public/CategoryPage';
import ProductPage from './pages/public/ProductPage';
import PostPage from './pages/public/PostPage';
import WebsitePostsPage from './pages/public/WebsitePostsPage';
import WebsiteCategoryPage from './pages/public/WebsiteCategoryPage';

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
          </Route>

          <Route element={<AffiliateLayout />}>
            <Route path="/affiliate/dashboard" element={<AffiliateDashboardPage />} />
            <Route path="/affiliate/website" element={<AffiliateWebsitePage />} />
            <Route path="/affiliate/products" element={<AffiliateProductsPage />} />
            <Route path="/affiliate/products/create" element={<AffiliateCreateProductPage />} />
            <Route path="/affiliate/products/:id/edit" element={<AffiliateEditProductPage />} />
            <Route path="/affiliate/products/:id/posts" element={<AffiliateProductPostsPage />} />
            <Route path="/affiliate/posts/create" element={<AffiliateCreatePostPage />} />
            <Route path="/affiliate/posts/:id/edit" element={<AffiliateEditPostPage />} />
            <Route path="/affiliate/templates/choose" element={<AffiliateChooseTemplatePage />} />
            <Route path="/affiliate/menus" element={<AffiliateMenusPage />} />
            <Route path="/affiliate/sliders" element={<AffiliateSlidersPage />} />
            <Route path="/affiliate/design" element={<AffiliateDesignPage />} />
            <Route path="/affiliate/analytics" element={<AffiliateAnalyticsPage />} />
            <Route path="/affiliate/media" element={<AffiliateMediaLibraryPage />} />
            <Route path="/affiliate/subscription" element={<AffiliateSubscriptionPage />} />
            <Route path="/affiliate/settings" element={<AffiliateSettingsPage />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/templates" element={<AdminTemplatesPage />} />
            <Route path="/admin/plans" element={<AdminPlansPage />} />
            <Route path="/admin/affiliates" element={<AdminAffiliatesPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/posts" element={<AdminPostsPage />} />
            <Route path="/admin/link-validation" element={<AdminLinkValidationPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);