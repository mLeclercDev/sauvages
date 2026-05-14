import React from "react";
import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import ProjetsPageContent from "@/components/sections/Projects/ProjetsPageContent";

export default async function ProjetsPage() {
  let projects = [];
  try {
    const projectsData = await fetchAPI("/projets", {
      populate: {
        client: { populate: "*" },
        thumbnail: { populate: "*" },
        expertise: { populate: "*" },
        secteur: { populate: "*" },
      },
      sort: ["publishedAt:desc"],
    });
    projects = projectsData?.data || [];
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  return (
    <main>
      <ProjetsPageContent projects={projects} />
    </main>
  );
}
