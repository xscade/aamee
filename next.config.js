/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
