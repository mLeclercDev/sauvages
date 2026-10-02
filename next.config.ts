import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Bypass complet du rendu normal (layout.tsx) pour les URLs réellement
  // inconnues : évite le bug Next.js où les CSS Modules du Header/Footer ne
  // s'appliquent jamais sur les pages not-found imbriquées dans le layout
  // (voir @/utils/notFound et le commentaire dans global-not-found.tsx).
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
  async redirects() {
    return [
      { source: '/expertises/strategie', destination: '/expertises/conseil', statusCode: 301 },
      { source: '/expertises/creation', destination: '/expertises/design', statusCode: 301 },
      { source: '/projets/la_francaise', destination: '/work/la-francaise-credit-mutuel-alliance-federale', statusCode: 301 },
      { source: '/projets/la-beaute-de-ton-job-commence-ici', destination: '/work/archives', statusCode: 301 },
      { source: '/projets', destination: '/work', statusCode: 301 },
      { source: '/projets/:slug', destination: '/work/:slug', statusCode: 301 },
      { source: '/les-vus-pas-pris', destination: '/work/vus-pas-pris', statusCode: 301 },
      { source: '/les-vus-pas-pris/:slug', destination: '/work/vus-pas-pris', statusCode: 301 },
      { source: '/blog/l-essor-du-marche-de-la-seconde-main-vers-un-marche-hybride', destination: '/blog', statusCode: 301 },
      { source: '/work/colombia-ici-on-marche-en-coeur', destination: '/work/la-colombia-ici-on-marche-en-coeur', statusCode: 301 },
    ];
  },
};

export default nextConfig;
