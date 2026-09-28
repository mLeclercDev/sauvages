import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Bypass complet du rendu normal (layout.tsx) pour /not-found : évite le
  // bug Next.js où les CSS Modules du Header/Footer ne s'appliquent jamais
  // sur les pages not-found (voir commentaire dans global-not-found.tsx).
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-v2.agence-sauvages.com",
        pathname: "**",
      },
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
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
