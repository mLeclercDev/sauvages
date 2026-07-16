import React from "react";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import LogoSlider from "@/components/sections/LogoSlider/LogoSlider";
import Expertises from "@/components/sections/Expertises/Expertises";
import ExpertiseHero from "@/components/sections/Expertises/ExpertiseHero";
import { fetchAPI } from "@/utils/strapi";

export default async function ExpertisesPage() {
  let heroData = null;
  let listingData = null;

  try {
    const expertiseData = await fetchAPI(
      "/expertise-listing",
      {
        populate: {
          Contenu: {
            on: {
              "global.expertises-listing": {
                populate: {
                  Titre: true,
                  Bouton: true,
                  Item: { populate: "*" },
                },
              },
              "expertise.hero-section": {
                populate: "*",
              },
              "global.titre-texte": { populate: "*" },
            },
          },
        },
      },
      {}
    );

    let contenu = [];
    if (expertiseData?.data?.attributes?.Contenu) {
      contenu = expertiseData.data.attributes.Contenu;
    } else if (expertiseData?.data?.Contenu) {
      contenu = expertiseData.data.Contenu;
    } else if (
      Array.isArray(expertiseData?.data) &&
      expertiseData.data.length > 0
    ) {
      const firstEntry = expertiseData.data[0];
      contenu = firstEntry.attributes?.Contenu || firstEntry.Contenu || [];
    }

    heroData = contenu.find(
      (m: any) => m.__component === "expertise.hero-section"
    );

    listingData = contenu.find((m: any) => m.__component === "global.expertises-listing");
  } catch (error) {
    console.error("Failed to fetch expertise data:", error);
  }

  const titreTexteData = contenu?.find?.((m: any) => m.__component === "global.titre-texte");

  // Si Titre et Bouton sont vides, on masque le header et on désactive l'anim scroll
  const hasHeader = !!(listingData?.Titre || listingData?.Bouton);

  return (
    <main>
      <ExpertiseHero data={heroData} />
      <TitreTexte data={titreTexteData} />
      <Expertises
        data={listingData}
        showHeader={hasHeader}
        isScrollAnimated={hasHeader}
      />
      <RecentProjects limit={4} />
      <LogoSlider />
    </main>
  );
}
