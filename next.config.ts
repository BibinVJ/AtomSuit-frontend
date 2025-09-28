import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Allow tenant subdomains in development
  allowedDevOrigins: [
    '*.atomsuit.test',
    'atomsuit.test',
    'company.atomsuit.test', // Specific tenant for testing
  ],
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
