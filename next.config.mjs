/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tiyaksa.ru', pathname: '/blog/wp-content/**' },
    ],
  },
};

export default nextConfig;
