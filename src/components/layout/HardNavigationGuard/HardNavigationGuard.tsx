"use client";

import { useEffect } from "react";

// global-not-found.tsx rend son propre <html>/<body>, hors de l'arbre du
// RootLayout. Depuis cette page, la navigation "douce" de Next (via
// TransitionLink/router.push, utilisé par tous les liens de Header/Footer)
// met bien à jour l'URL et le <title>, mais ne parvient jamais à réconcilier
// le contenu affiché : on reste visuellement sur la 404 (vérifié en prod,
// clics simulés sur le bouton retour et sur les liens du Header). On force
// donc un rechargement complet pour tout clic sur un lien interne quittant
// cette page, ce qui contourne le problème de façon fiable.
export default function HardNavigationGuard() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as HTMLElement)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.target === "_blank") {
        return;
      }

      e.preventDefault();
      e.stopImmediatePropagation();
      window.location.href = href;
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
