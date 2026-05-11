import React from "react";
import ManifesteHero from "@/components/sections/Manifeste/ManifesteHero";
import ManifesteCommitments from "@/components/sections/Manifeste/ManifesteCommitments";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import { fetchAPI } from "@/utils/strapi";

export default async function ManifestePage() {
  let contenu: any[] = [];

  try {
    const manifesteData = await fetchAPI(
      "/manifeste",
      {
        populate: {
          Contenu: {
            populate: "*",
          },
        },
      },
      {}
    );

    contenu =
      manifesteData?.data?.attributes?.Contenu ||
      manifesteData?.data?.Contenu ||
      [];
  } catch (error) {
    console.error("Failed to fetch manifeste data:", error);
  }

  // Distribution des données aux modules
  const heroData = contenu.find(
    (m) => m.__component === "manifeste.hero-section"
  );
  const missionData = contenu.find(
    (m) => m.__component === "manifeste.missions"
  );

  return (
    <main>
      <ManifesteHero data={heroData} />
      <ManifesteCommitments data={missionData} />
      <RecentProjects />
    </main>
  );
}
