import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import AgenceHero from "@/components/sections/Agence/AgenceHero";
import AgenceValues from "@/components/sections/Agence/AgenceValues";
import AgenceStaff from "@/components/sections/Agence/AgenceStaff";
import AgenceTeam from "@/components/sections/Agence/AgenceTeam";
import Blog from "@/components/sections/Blog/Blog";

export default async function AgencePage() {
  let contenu: any[] = [];

  try {
    const agenceData = await fetchAPI(
      "/agence",
      {
        populate: {
          Contenu: {
            on: {
              "agence.equipe-listing": {
                populate: {
                  EquipeListingItem: {
                    populate: ["Image", "Media"],
                  },
                },
              },
              "agence.equipe-presentation": {
                populate: {
                  Titre: true,
                  EquipePresentationItem: {
                    populate: ["Image"],
                  },
                },
              },
              "agence.hero-section": {
                populate: ["Image", "IdentiteItem"],
              },
              "agence.agence": {
                populate: ["Titre", "Item", "Image"],
              },
              "agence.histoire": {
                populate: ["Titre", "Image"],
              },
              "global.intro-image": {
                populate: ["Image"],
              },
              "global.blog-listing": {
                populate: { Titre: true, Bouton: { populate: { Icone: true } } },
              },
              "agence.cta": {
                populate: {
                  Bouton: {
                    populate: ["Icone"],
                  },
                },
              },
              "global.titre-texte": { populate: ["Titre", "Image"] },
            },
          },
        },
      },
      {}
    );

    contenu = agenceData?.data?.attributes?.Contenu || agenceData?.data?.Contenu || [];
  } catch (error) {
    console.error("Failed to fetch agence data:", error);
  }

  // Extraction des modules pour distribution
  const heroData = contenu.find((m) => m.__component === "agence.hero-section");
  const equipePresentationData = contenu.find(
    (m) => m.__component === "agence.equipe-presentation"
  );
  const equipeListingData = contenu.find(
    (m) => m.__component === "agence.equipe-listing"
  );
  const titreTexteData = contenu.find(
    (m) => m.__component === "global.titre-texte"
  );
  const agenceValuesData = contenu.find(
    (m) => m.__component === "agence.agence"
  );
  const blogListingData = contenu.find((m) => m.__component === "global.blog-listing");

  return (
    <main>
      <AgenceHero data={heroData} />
      <AgenceTeam data={equipePresentationData} />
      <TitreTexte data={titreTexteData} />
      <AgenceStaff data={equipeListingData} />
      <Blog data={blogListingData} />
    </main>
  );
}
