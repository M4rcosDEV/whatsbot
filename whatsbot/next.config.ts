import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mmg.whatsapp.net",
      },
      {
        protocol: "https",
        hostname: "pps.whatsapp.net",
      },
      {
        protocol: "https",
        hostname: "dyn.whatsapp.net",
      },
      {
        protocol: "https",
        hostname: "scontent.xx.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.fna.fbcdn.net", // cobre servidores regionais como fcgh1-1, gru1-2, etc
      },
      {
        protocol: "https",
        hostname: "lookaside.whatsapp.com",
      },
      {
        protocol: "https",
        hostname: "scontent.whatsapp.net",
      }
    ],
  },
  experimental: {
    allowedDevOrigins: ["http://10.0.2.111:3000"], 
  },
};

export default nextConfig;
