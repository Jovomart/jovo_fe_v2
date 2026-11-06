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
        '/profile',
        '/settings',
        '/seller/dashboard',
        '/seller/application-status',
        '/seller-application',
        '/report-product',
      ],
    },
    sitemap: 'https://jovomart.store/sitemap.xml',
    host: 'https://jovomart.store',
  }
}
