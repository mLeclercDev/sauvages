// Convention Next.js 16 (experimental.globalNotFound, activé dans
// next.config.ts) : gère les URLs qui ne correspondent à AUCUNE route. Ce
// fichier contourne entièrement le rendu normal (il ne passe pas par
// layout.tsx) : rien n'est hérité, donc les imports globaux (styles, fonts)
// et le Header/Footer doivent être refaits/réimportés ici à la main. C'est
// aussi le SEUL chemin de 404 où le CSS se charge de façon fiable : voir
// @/utils/notFound pour pourquoi les pages avec slug redirigent ici plutôt
// que d'appeler notFound() directement.
//
// Les liens de Header/Footer (TransitionLink) font une navigation "douce"
// via le router client de Next. Depuis cette page, ce routeur met bien à
// jour l'URL et le <title>, mais ne parvient jamais à réconcilier le
// contenu affiché (on reste visuellement sur la 404) — probablement parce
// que cette page vit dans un arbre React séparé du RootLayout. Vérifié en
// prod avec des clics simulés sur plusieurs liens. HardNavigationGuard force
// donc un rechargement complet pour tout lien interne cliqué ici, ce qui
// contourne le problème de façon fiable (pas besoin de TransitionProvider/
// PageTransition dans ce cas : leur animation ne se déclenche jamais,
// HardNavigationGuard intercepte le clic avant).
import type { Metadata } from "next";
import { monumentNormal, monumentWide, monumentBlack } from "./fonts";
import NotFoundContent from "@/components/layout/NotFoundContent/NotFoundContent";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HardNavigationGuard from "@/components/layout/HardNavigationGuard/HardNavigationGuard";
import { getHeaderData } from "@/services/header";
import { getFooterData } from "@/services/footer";
import { fetchAPI } from "@/utils/strapi";
import "../styles/globals.scss";

export const metadata: Metadata = {
  title: "Page introuvable | Sauvages",
  robots: { index: false, follow: true },
};

export default async function GlobalNotFound() {
  const [headerData, footerData, legalPagesData] = await Promise.all([
    getHeaderData(),
    getFooterData(),
    fetchAPI("/pages-legales", { fields: ["slug", "Titre"] }, { next: { revalidate: 60 } }).catch(
      () => null
    ),
  ]);

  const legalPages = (legalPagesData?.data || []).map((p: any) => ({
    slug: p.slug,
    titre: p.Titre || p.attributes?.Titre || "",
  }));

  return (
    <html
      lang="fr"
      className={`${monumentNormal.variable} ${monumentWide.variable} ${monumentBlack.variable}`}
    >
      <body>
        <HardNavigationGuard />
        <Header data={headerData} />
        <NotFoundContent />
        <Footer data={footerData} legalPages={legalPages} />
      </body>
    </html>
  );
}
