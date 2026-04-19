const ROUTES = {
  auth: {
    login: '/login',
    register: '/register',
  },

  affiliate: {
    dashboard: '/affiliate/dashboard',
    website: '/affiliate/website',
    products: '/affiliate/products',
    createProduct: '/affiliate/products/create',
    editProduct: '/affiliate/products/:id/edit',
    productPosts: '/affiliate/products/:id/posts',
    createPost: '/affiliate/posts/create',
    editPost: '/affiliate/posts/:id/edit',
    chooseTemplate: '/affiliate/templates/choose',
    menus: '/affiliate/menus',
    sliders: '/affiliate/sliders',
    design: '/affiliate/design',
    analytics: '/affiliate/analytics',
    media: '/affiliate/media',
    subscription: '/affiliate/subscription',
    settings: '/affiliate/settings',
  },

  admin: {
    dashboard: '/admin/dashboard',
    categories: '/admin/categories',
    templates: '/admin/templates',
    plans: '/admin/plans',
    affiliates: '/admin/affiliates',
    products: '/admin/products',
    posts: '/admin/posts',
    linkValidation: '/admin/link-validation',
  },

  public: {
    home: '/',
    website: '/:websiteSlug',
    websiteCategory: '/:websiteSlug/category/:slug',
    websitePosts: '/:websiteSlug/posts',
    product: '/:websiteSlug/product/:slug',
    post: '/:websiteSlug/post/:slug',
    category: '/category/:slug',
  },
};

export default ROUTES;