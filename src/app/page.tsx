import Hero from "@/components/sections/Hero/Hero";
import Intro from "@/components/sections/Intro/Intro";
import Expertises from "@/components/sections/Expertises/Expertises";
import Projects from "@/components/sections/Projects/Projects";
import Blog from "@/components/sections/Blog/Blog";
import LogoSlider from "@/components/sections/LogoSlider/LogoSlider";
import { fetchAPI } from "@/utils/strapi";
import ClientsScroll from "@/components/sections/Clients/ClientsScroll";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";

export const revalidate = 60;

export default async function Home() {
  let heroData = null;
  let introData = null;
  let expertisesData = null;
  let titreTexteData = null;

  try {
    const homepageData = await fetchAPI(
      "/homepage",
      {
        populate: {
          Contenu: {
            on: {
              "homepage.hero-section": { populate: "*" },
              "homepage.intro": { populate: "*" },
              "global.expertises-listing": {
                populate: {
                  Titre: true,
                  Bouton: true,
                  Item: { populate: "*" },
                },
              },
              "global.titre-texte": { populate: "*" },
            },
          },
        },
      },
      {}
    );

    const contenu = homepageData?.data?.attributes?.Contenu || homepageData?.data?.Contenu || [];

    heroData = contenu.find((m: any) => m.__component === "homepage.hero-section");

    introData = contenu.find((m: any) => m.__component === "homepage.intro");

    // On cherche le module d'expertises
    expertisesData = contenu.find((m: any) => m.__component === "global.expertises-listing");
    titreTexteData = contenu.find((m: any) => m.__component === "global.titre-texte");
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
  }

  // Sur la home, on affiche le header si on a un titre (Texte) ou un bouton
  const hasExpertiseHeader = !!(expertisesData?.Titre?.Texte || expertisesData?.Bouton);

  return (
    <main>
      <Hero data={heroData} />
      <Intro data={introData} />
      <TitreTexte data={titreTexteData} />
      <Expertises
        data={expertisesData}
        showHeader={hasExpertiseHeader}
        isScrollAnimated={hasExpertiseHeader}
      />
      <Projects />
      <LogoSlider />
      <Blog />
      <ClientsScroll />
    </main>
  );
}
