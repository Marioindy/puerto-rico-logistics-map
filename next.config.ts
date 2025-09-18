import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable image optimization for Amplify
  images: {
    unoptimized: true
  },

  // Exclude legacy project directory from builds
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/pr-logistics-map/**']
    };
    return config;
  },

  // Environment variables configuration
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },

  // Redirect configuration for route compatibility
  async redirects() {
    return [
      {
        source: '/(dashboard)/tracking',
        destination: '/tracking',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
