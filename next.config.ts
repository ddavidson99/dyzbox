import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Allow ngrok for development
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  
  // Allow ngrok domains
  images: {
    domains: ["*.ngrok-free.app", "localhost"],
  },
  
  // Properly configure allowed dev origins for ngrok
  experimental: {
    allowedDevOrigins: [
      "localhost", 
      "*.ngrok-free.app",
      "splendid-positively-chow.ngrok-free.app"
    ],
  },
};

export default nextConfig;
