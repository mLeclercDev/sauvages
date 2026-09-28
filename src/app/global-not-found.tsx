// Convention Next.js 16 (experimental.globalNotFound, activé dans
// next.config.ts) : gère les URLs qui ne correspondent à AUCUNE route. Ce
// fichier contourne entièrement le rendu normal (il ne passe pas par
// layout.tsx) : Header/Footer ne sont donc pas inclus, volontairement — les
// pages not-found de l'App Router ne chargent jamais réellement les CSS
// Modules de composants aussi complexes qu'eux (bug Next.js connu), ce qui
// donnait un menu mobile dupliqué et sans mise en forme. Les imports globaux
// (styles, fonts) doivent être refaits ici car rien n'est hérité du layout.
import type { Metadata } from "next";
import { monumentNormal, monumentWide, monumentBlack } from "./fonts";
import NotFoundContent from "@/components/layout/NotFoundContent/NotFoundContent";
import "../styles/globals.scss";

export const metadata: Metadata = {
  title: "Page introuvable | Sauvages",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="fr"
      className={`${monumentNormal.variable} ${monumentWide.variable} ${monumentBlack.variable}`}
    >
      <body>
        <NotFoundContent />
      </body>
    </html>
  );
}
