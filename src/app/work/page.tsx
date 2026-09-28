import React from "react";

export const revalidate = 60;

export const metadata = {
  title: "Work",
  description: "Les projets réalisés par Sauvages pour ses clients.",
};

import { getProjectsPageData } from "./getProjectsPageData";
import ProjetsPageContent from "@/components/sections/Projects/ProjetsPageContent";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import TexteImage from "@/components/sections/TexteImage/TexteImage";

export default async function ProjetsPage() {
  const { projects, titreTexteData, texteImageData, pageTitle } = await getProjectsPageData();

  return (
    <main>
      <TitreTexte data={titreTexteData} />
      <TexteImage data={texteImageData} />
      <ProjetsPageContent projects={projects} title={pageTitle} />
    </main>
  );
}
