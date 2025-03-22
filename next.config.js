/** @type {import('next').NextConfig} */
const nextConfig = {
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
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ngrok-free.app",
      },
    ],
  },
  
  // Properly configure allowed dev origins for ngrok
  allowedDevOrigins: [
    "localhost", 
    "*.ngrok-free.app",
    "splendid-positively-chow.ngrok-free.app"
  ],
  
  experimental: {
    // Other experimental features can go here
  },
};

module.exports = nextConfig; 