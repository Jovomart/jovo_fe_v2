import type { MetadataRoute } from 'next'

const publicPaths = [
  '/',
  '/accommodations',
  '/become-seller',
  '/campus-guide',
  '/cleaning-hygiene',
  '/contact',
  '/cookie',
  '/flash-sales',
  '/groceries',
  '/help',
  '/limited-deals',
  '/logistics',
  '/news',
  '/perishable',
  '/personal-care',
  '/privacy',
  '/return-policy',
  '/returns-refund',
  '/services',
  '/shop',
  '/sponsored-products',
  '/terms',
  '/top-sellers',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `https://jovomart.store${path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.65,
  }))
}
