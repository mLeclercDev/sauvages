import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.agence-sauvages.com",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
