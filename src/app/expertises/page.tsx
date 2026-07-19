import React from "react";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import TexteImage from "@/components/sections/TexteImage/TexteImage";
import LogoSlider from "@/components/sections/LogoSlider/LogoSlider";
import Expertises from "@/components/sections/Expertises/Expertises";
import ExpertiseHero from "@/components/sections/Expertises/ExpertiseHero";
import ClientsScroll from "@/components/sections/Clients/ClientsScroll";
import { fetchAPI } from "@/utils/strapi";

export default async function ExpertisesPage() {
  let heroData = null;
  let listingData = null;
  let titreTexteData = null;
  let texteImageData = null;
  let clientsScrollData = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contenu: any[] = [];

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
              "global.clients-scroll": { populate: "*" },
            },
          },
        },
      },
      {}
    );

    if (expertiseData?.data?.attributes?.Contenu) {
      contenu = expertiseData.data.attributes.Contenu;
    } else if (expertiseData?.data?.Contenu) {
      contenu = expertiseData.data.Contenu;
    } else if (Array.isArray(expertiseData?.data) && expertiseData.data.length > 0) {
      const firstEntry = expertiseData.data[0];
      contenu = firstEntry.attributes?.Contenu || firstEntry.Contenu || [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    heroData = contenu.find((m: any) => m.__component === "expertise.hero-section") ?? null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listingData = contenu.find((m: any) => m.__component === "global.expertises-listing") ?? null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    titreTexteData = contenu.find((m: any) => m.__component === "global.titre-texte") ?? null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    texteImageData = contenu.find((m: any) => m.__component === "global.texte-image") ?? null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientsScrollData = contenu.find((m: any) => m.__component === "global.clients-scroll") ?? null;
  } catch (error) {
    console.error("Failed to fetch expertise data:", error);
  }

  const hasHeader = !!(listingData?.Titre || listingData?.Bouton);

  return (
    <main>
      <ExpertiseHero data={heroData} />
      <TitreTexte data={titreTexteData} />
      <TexteImage data={texteImageData} />
      <Expertises
        data={listingData}
        showHeader={hasHeader}
        isScrollAnimated={hasHeader}
      />
      <RecentProjects limit={4} title="Nos réalisations" />
      <ClientsScroll
        label={clientsScrollData?.Label}
        title={clientsScrollData?.Titre?.Texte}
      />
    </main>
  );
}
