import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude legacy project directory from builds
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/pr-logistics-map/**']
    };
    return config;
  }
};

export default nextConfig;
