import React from "react";
import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import ProjectDetail from "@/components/sections/Projects/ProjectDetail";
import RecentProjects from "@/components/sections/Projects/RecentProjects";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjetDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let project = null;
  let otherProjects = [];

  try {
    const projectsData = await fetchAPI("/projets", {
      filters: { slug: { $eq: slug } },
      populate: {
        client: { populate: "*" },
        thumbnail: { populate: "*" },
        expertise: { populate: "*" },
        secteur: { populate: "*" },
        gallery: { populate: "*" },
        content: { populate: "*" },
        sections: { populate: "*" },
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
        client: { populate: "*" },
      },
      sort: ["publishedAt:desc"],
    });
    otherProjects = otherProjectsData?.data || [];
  } catch (error) {
    console.error("Failed to fetch project detail:", error);
    notFound();
  }

  return (
    <main>
      <ProjectDetail project={project} otherProjects={otherProjects} />
      <RecentProjects />
    </main>
  );
}
