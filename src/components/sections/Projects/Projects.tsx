import React from "react";
import { fetchAPI } from "@/utils/strapi";
import ProjectsList from "./ProjectsList";
import SeeMore from "@/components/ui/SeeMore/SeeMore";
import styles from "./Projects.module.scss";

const Projects: React.FC = async () => {
  let projects = [];

  try {
    const projectsData = await fetchAPI("/projets", {
      populate: {
        client: { populate: "*" },
        thumbnail: { populate: "*" },
      },
      sort: ["publishedAt:desc"],
      pagination: { limit: 8 },
    });
    projects = projectsData?.data || [];
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  const defaultProjects = [
    {
      id: 1,
      attributes: {
        title: "KERA - Identité Visuelle",
        slug: "kera-identite-visuelle",
        client: { data: { attributes: { name: "Groupe KERA" } } },
      }
    },
    {
      id: 2,
      attributes: {
        title: "Nova - Plateforme Digitale",
        slug: "nova-plateforme-digitale",
        client: { data: { attributes: { name: "Nova" } } },
      }
    },
    {
      id: 3,
      attributes: {
        title: "Bulletin CN - Magazine",
        slug: "bulletin-cn-magazine",
        client: { data: { attributes: { name: "Bulletin CN" } } },
      }
    }
  ];

  if (projects.length === 0) {
    projects = defaultProjects;
  }

  return (
    <section className={`${styles.projects} pt-top pb-bottom`}>
      <div className="container">
        <ProjectsList projects={projects} />
        <div className={styles.seeMoreWrapper}>
          <SeeMore label="Voir tous nos projets" href="/work" />
        </div>
      </div>
    </section>
  );
};


export default Projects;
