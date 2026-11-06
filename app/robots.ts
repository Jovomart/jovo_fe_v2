import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/register',
        '/complete-profile',
        '/forgot-password',
        '/verify-email',
        '/cart',
        '/order',
        '/profile',
        '/settings',
        '/wishlist',
        '/seller/add-product',
        '/seller/analytics',
        '/seller/application-status',
        '/seller/dashboard',
        '/seller/deliveries',
        '/seller/orders',
        '/seller/products',
        '/seller/profile',
        '/seller/promote',
        '/seller/settings',
        '/seller/wallet',
        '/seller-application',
        '/report-product',
        '/services/apply',
        '/services/dashboard',
      ],
    },
    sitemap: 'https://jovomart.store/sitemap.xml',
    host: 'https://jovomart.store',
  }
}
