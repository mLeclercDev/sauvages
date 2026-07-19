import React from "react";
import styles from "./page.module.scss";

export const revalidate = 60;

import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import TexteImage from "@/components/sections/TexteImage/TexteImage";
import ManifesteHero from "@/components/sections/Manifeste/ManifesteHero";
import ManifesteCommitments from "@/components/sections/Manifeste/ManifesteCommitments";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import AgenceCta from "@/components/sections/Agence/AgenceCta";
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

  const ctaData = contenu.find((m) => m.__component === "agence.cta");
  const titreTexteData = contenu.find((m) => m.__component === "global.titre-texte");
  const texteImageData = contenu.find((m) => m.__component === "global.texte-image");

  return (
    <main className={styles.page}>
      <ManifesteHero data={heroData} />
      <TitreTexte data={titreTexteData} />
      <TexteImage data={texteImageData} />
      <ManifesteCommitments data={missionData} />
      <AgenceCta data={ctaData} />
    </main>
  );
}
