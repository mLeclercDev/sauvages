import React from "react";
import { fetchAPI } from "@/utils/strapi";
import styles from "./page.module.scss";

export const revalidate = 60;

import ProjectDetail from "@/components/sections/Projects/ProjectDetail";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import { notFound } from "next/navigation";
import { getProjectsPageData } from "../getProjectsPageData";
import ProjetsPageContent, { type Section } from "@/components/sections/Projects/ProjetsPageContent";
import TitreTexte from "@/components/sections/TitreTexte/TitreTexte";
import TexteImage from "@/components/sections/TexteImage/TexteImage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SLUG_TO_SECTION: Record<string, Section> = {
  "vus-pas-pris": "vus_pas_pris",
  archives: "archives",
};

export default async function ProjetDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const filterSection = SLUG_TO_SECTION[slug];
  if (filterSection) {
    const { projects, titreTexteData, texteImageData, pageTitle } = await getProjectsPageData();
    return (
      <main>
        <TitreTexte data={titreTexteData} />
        <TexteImage data={texteImageData} />
        <ProjetsPageContent projects={projects} title={pageTitle} initialSection={filterSection} />
      </main>
    );
  }

  let project = null;
  let otherProjects = [];

  try {
    const projectsData = await fetchAPI("/projets", {
      filters: { slug: { $eq: slug } },
      populate: {
        client: { populate: "*" },
        thumbnail: { populate: "*" },
        expertise: { populate: "*" },
        sections: { populate: "*" },
        Galerie: { populate: { Images: true } },
      },
    });

    project = projectsData?.data?.[0] || null;

    if (!project) {
      notFound();
    }

    // Fetch other projects for the bottom section
    const otherProjectsData = await fetchAPI("/projets", {
      filters: { slug: { $ne: slug } },
      pagination: { limit: 3 },
      populate: {
        thumbnail: { populate: "*" },
        thumbnailFallback: { populate: "*" },
        client: { populate: "*" },
      },
      sort: ["rank:desc"],
    });
    otherProjects = otherProjectsData?.data || [];
  } catch (error) {
    console.error("Failed to fetch project detail:", error);
    notFound();
  }

  return (
    <main className={styles.page}>
      <ProjectDetail project={project} otherProjects={otherProjects} />
      <RecentProjects limit={4} title="Plus de projets" />
    </main>
  );
}
