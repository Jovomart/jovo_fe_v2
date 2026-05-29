/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ── Existing ──────────────────────────────────────────────
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "assets.mixkit.co" },
      { protocol: "https", hostname: "placehold.co" },
      // ── Your API server ───────────────────────────────────────
      { protocol: "https", hostname: "api.yourstore.com" }, // ← replace with your real API domain
      // ── Google Shopping thumbnails ────────────────────────────
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "encrypted-tbn1.gstatic.com" },
      { protocol: "https", hostname: "encrypted-tbn2.gstatic.com" },
      { protocol: "https", hostname: "encrypted-tbn3.gstatic.com" },
      // ── Google / Firebase Storage ─────────────────────────────
      { protocol: "https", hostname: "*.googleapis.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // ── Cloudinary ────────────────────────────────────────────
      { protocol: "https", hostname: "res.cloudinary.com" },
      // ── AWS S3 ────────────────────────────────────────────────
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;