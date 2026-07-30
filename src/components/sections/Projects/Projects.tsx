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
        thumbnail: true,
        client: { populate: { Favicon: true } },
      },
      sort: ["rank:desc"],
      pagination: { limit: 5 },
    });
    projects = projectsData?.data || [];
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  if (projects.length === 0) return null;

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
