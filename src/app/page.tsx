import Hero from "@/components/sections/Hero/Hero";
import Intro from "@/components/sections/Intro/Intro";
import Expertises from "@/components/sections/Expertises/Expertises";
import Projects from "@/components/sections/Projects/Projects";
import Blog from "@/components/sections/Blog/Blog";
import LogoSlider from "@/components/sections/LogoSlider/LogoSlider";
import { fetchAPI } from "@/utils/strapi";

export default async function Home() {
  let introData = null;
  let expertisesData = null;

  try {
    const homepageData = await fetchAPI(
      "/homepage",
      {
        populate: {
          Contenu: {
            populate: "*",
          },
        },
      },
      {},
      "local"
    );

    const contenu = homepageData?.data?.attributes?.Contenu || homepageData?.data?.Contenu || [];
    
    introData = contenu.find((m: any) => m.__component === "homepage.intro");
    
    // On cherche le module d'expertises
    expertisesData = contenu.find(
      (m: any) => m.__component === "global.expertises-listing"
    );

  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
  }

  // Sur la home, on affiche le header si on a un titre (Texte) ou un bouton
  const hasExpertiseHeader = !!(expertisesData?.Titre?.Texte || expertisesData?.Bouton);

  return (
    <main>
      <Hero />
      <Intro data={introData} />
      <Expertises 
        data={expertisesData} 
        showHeader={hasExpertiseHeader} 
        isScrollAnimated={hasExpertiseHeader}
      />
      <Projects />
      <LogoSlider />
      <Blog />
    </main>
  );
}
