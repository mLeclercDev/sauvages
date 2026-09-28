import React from "react";
import { fetchAPI, getStrapiMedia } from "@/utils/strapi";
import { strapiBlocksToPlainText } from "@/utils/strapiRichText";
import styles from "./page.module.scss";

export const revalidate = 60;

import ProjectDetail from "@/components/sections/Projects/ProjectDetail";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import Breadcrumb from "@/components/sections/Breadcrumb/Breadcrumb";
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

/** Le champ description Strapi est soit une chaîne markdown, soit des blocs richtext. */
const descriptionToPlainText = (content: unknown): string => {
  if (typeof content === "string") {
    const text = content
      .replace(/<[^>]+>/g, " ")
      .replace(/\*\*|\*/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return text.length <= 160 ? text : `${text.slice(0, 159).trimEnd()}…`;
  }
  if (Array.isArray(content)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return strapiBlocksToPlainText(content as any);
  }
  return "";
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (SLUG_TO_SECTION[slug]) {
    const { pageTitle } = await getProjectsPageData();
    return { title: pageTitle || "Work" };
  }

  const projectsData = await fetchAPI("/projets", {
    filters: { slug: { $eq: slug } },
    populate: { client: { populate: "*" }, thumbnail: { populate: "*" } },
  });
  const project = projectsData?.data?.[0];
  if (!project) return { title: "Projet" };

  const attrs = project.attributes || project;
  const clientName = attrs.client?.data?.attributes?.name || attrs.client?.name;
  const title = clientName ? `${attrs.title} — ${clientName}` : attrs.title;
  const description =
    descriptionToPlainText(attrs.description || attrs.Description) ||
    `Découvrez le projet ${attrs.title} réalisé par Sauvages${clientName ? ` pour ${clientName}` : ""}.`;
  const image = getStrapiMedia(attrs.thumbnail, undefined);

  return {
    title,
    description,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

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
        thumbnailFallback: { populate: "*" },
        expertise: { populate: "*" },
        sections: { populate: { image: true, medias: { populate: { media: true } } } },
        Galerie: { populate: { Images: true, Medias: { populate: { media: true } } } },
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

  const projectAttrs = project.attributes || project;

  return (
    <main className={styles.page}>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Work", href: "/work" },
          { label: projectAttrs.title },
        ]}
      />
      <ProjectDetail project={project} otherProjects={otherProjects} />
      <RecentProjects limit={4} title="Plus de projets" />
    </main>
  );
}
