/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  // For IIS deployment
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
