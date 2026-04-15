import { fetchAPI, getStrapiMedia } from "@/utils/strapi";
import AgenceHero from "@/components/sections/Agence/AgenceHero";
import AgenceValues from "@/components/sections/Agence/AgenceValues";
import AgenceStaff from "@/components/sections/Agence/AgenceStaff";
import AgenceTeam from "@/components/sections/Agence/AgenceTeam";
import AgenceHistory from "@/components/sections/Agence/AgenceHistory";
import FullWidthImage from "@/components/sections/FullWidthImage/FullWidthImage";
import TextRevealSection from "@/components/sections/TextRevealSection/TextRevealSection";
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
                populate: ["Image", "EquipePresentationItem"],
              },
              "agence.hero-section": {
                populate: ["Image"],
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
                populate: "*",
              },
            },
          },
        },
      },
      {},
      "local"
    );

    contenu = agenceData?.data?.attributes?.Contenu || agenceData?.data?.Contenu || [];
  } catch (error) {
    console.error("Failed to fetch agence data:", error);
  }

  // Extraction des modules pour distribution
  const heroData = contenu.find((m) => m.__component === "agence.hero-section");
  const agenceValuesData = contenu.find((m) => m.__component === "agence.agence");
  const introImageData = contenu.find((m) => m.__component === "global.intro-image");
  const equipePresentationData = contenu.find((m) => m.__component === "agence.equipe-presentation");
  const equipeListingData = contenu.find((m) => m.__component === "agence.equipe-listing");
  const histoireData = contenu.find((m) => m.__component === "agence.histoire");
  const blogListingData = contenu.find((m) => m.__component === "global.blog-listing");

  const introText = introImageData?.Texte?.map((p: any) => p.children?.map((c: any) => c.text).join("")).join(" ");

  return (
    <main>
      <AgenceHero data={heroData} />
      <AgenceValues data={agenceValuesData} />
      <TextRevealSection
        pt="sm"
        pb="sm"
        text={introText || ""}
      />
      <FullWidthImage
        pt="none"
        pb="sm"
        src={getStrapiMedia(introImageData?.Image, undefined, "local") || "/images/agence-hero.png"}
        alt={introImageData?.Image?.alternativeText || "L'agence Sauvages en action"}
      />
      <AgenceTeam data={equipePresentationData} />
      <AgenceStaff data={equipeListingData} />
      <AgenceHistory data={histoireData} />
      <Blog headerData={blogListingData} />
    </main>
  );
}
