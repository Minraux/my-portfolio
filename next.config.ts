import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sanity/client', 'next-sanity'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  async redirects() {
    return [
      { source: '/blog', destination: '/publications', permanent: true },
      { source: '/blog/:slug', destination: '/publications/:slug', permanent: true },
      { source: '/teaching', destination: '/source', permanent: true },
      { source: '/istochnik', destination: '/source', permanent: true },
    ]
  },
};

export default nextConfig;
