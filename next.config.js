/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'assets.mixkit.co' },
    ],
  },
  // Enable standalone output for optimized Docker builds
  output: 'standalone',
}

module.exports = nextConfig