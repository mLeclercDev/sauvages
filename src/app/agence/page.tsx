import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import AgenceHero from "@/components/sections/Agence/AgenceHero";
import AgenceValues from "@/components/sections/Agence/AgenceValues";
import AgenceStaff from "@/components/sections/Agence/AgenceStaff";
import AgenceTeam from "@/components/sections/Agence/AgenceTeam";

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
                populate: ["Titre"],
              },
              "agence.cta": {
                populate: {
                  Bouton: {
                    populate: ["Icone"],
                  },
                },
              },
              "global.titre-texte": { populate: ["Titre"] },
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

  return (
    <main>
      <AgenceHero data={heroData} />
      <TitreTexte data={titreTexteData} />
      <AgenceValues data={agenceValuesData} />
      <AgenceTeam data={equipePresentationData} />
      <AgenceStaff data={equipeListingData} />
    </main>
  );
}
