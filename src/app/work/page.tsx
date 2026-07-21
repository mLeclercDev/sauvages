import React from "react";
import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import ProjetsPageContent from "@/components/sections/Projects/ProjetsPageContent";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import TexteImage from "@/components/sections/TexteImage/TexteImage";

export default async function ProjetsPage() {
  let projects = [];
  let titreTexteData = null;
  let texteImageData = null;
  let pageTitle: string | null = null;

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

    const workAttrs = workData?.data?.attributes || workData?.data || {};
    const contenu = workAttrs.Contenu || [];
    titreTexteData = contenu.find((m: any) => m.__component === "global.titre-texte");
    texteImageData = contenu.find((m: any) => m.__component === "global.texte-image");
    pageTitle = workAttrs.Titre || null;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  return (
    <main>
      <TitreTexte data={titreTexteData} />
      <TexteImage data={texteImageData} />
      <ProjetsPageContent projects={projects} title={pageTitle} />
    </main>
  );
}
