import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sanity/client', 'next-sanity'],
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
