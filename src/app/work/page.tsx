import React from "react";
import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import ProjetsPageContent from "@/components/sections/Projects/ProjetsPageContent";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";

export default async function ProjetsPage() {
  let projects = [];
  let titreTexteData = null;

  try {
    const [projectsData, workData] = await Promise.all([
      fetchAPI("/projets", {
        populate: {
          client: { populate: "*" },
          thumbnail: { populate: "*" },
          expertise: { populate: "*" },
        },
        sort: ["publishedAt:desc"],
      }),
      fetchAPI("/work", { populate: "deep" }),
    ]);

    projects = projectsData?.data || [];

    const contenu =
      workData?.data?.attributes?.Contenu ||
      workData?.data?.Contenu ||
      [];
    titreTexteData = contenu.find((m: any) => m.__component === "global.titre-texte");
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  return (
    <main>
      <TitreTexte data={titreTexteData} />
      <ProjetsPageContent projects={projects} />
    </main>
  );
}
