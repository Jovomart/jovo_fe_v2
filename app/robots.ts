import type { MetadataRoute } from 'next'

const siteUrl = 'https://jovomart.store'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/complete-profile',
        '/forgot-password',
        '/login',
        '/profile',
        '/register',
        '/seller/application-status',
        '/seller/dashboard',
        '/settings',
        '/verify-email',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
