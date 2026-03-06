import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sanity/client', 'next-sanity'],
};

export default nextConfig;
