import type { MetadataRoute } from 'next'

const siteUrl = 'https://jovomart.store'

const publicPaths = [
  '/',
  '/accommodations',
  '/appliances-deals',
  '/beauty-deals',
  '/become-seller',
  '/campus-guide',
  '/cleaning-hygiene',
  '/computing-deals',
  '/contact',
  '/cookie',
  '/deals',
  '/drink-deals',
  '/electronic-deals',
  '/fashion-deals',
  '/flash-sales',
  '/gaming-deals',
  '/groceries',
  '/help',
  '/home-deals',
  '/limited-deals',
  '/logistics',
  '/news',
  '/perishable',
  '/personal-care',
  '/phone-deals',
  '/privacy',
  '/return-policy',
  '/returns-refund',
  '/services',
  '/shop',
  '/sponsored-products',
  '/terms',
  '/top-sellers',
  '/tv-audio-deals',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.6,
  }))
}
