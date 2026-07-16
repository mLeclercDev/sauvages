import React from "react";
import Link from "next/link";
import ProjectItem from "@/components/ui/ProjectItem/ProjectItem";
import { fetchAPI } from "@/utils/strapi";
import styles from "./RecentProjects.module.scss";

interface RecentProjectsProps {
  category?: string;
  title?: string;
  limit?: number;
}

export default async function RecentProjects({
  category,
  title = "Nos réalisations",
  limit = 3,
}: RecentProjectsProps) {
  let projects = [];

  try {
    let filters: any = {};
    if (category) {
      filters = {
        expertise: {
          slug: {
            $eq: category,
          },
        },
      };
    }

    const projectsData = await fetchAPI("/projets", {
      populate: {
        client: { populate: "*" },
        thumbnail: { populate: "*" },
        expertise: { populate: "*" },
        secteur: { populate: "*" },
      },
      sort: ["publishedAt:desc"],
      pagination: {
        limit,
      },
      filters,
    });

    projects = projectsData?.data || [];
  } catch (error) {
    console.error("Failed to fetch recent projects:", error);
  }

  if (!projects || projects.length === 0) return null;

  return (
    <section className={`${styles.recentProjects} pt-top pb-bottom`}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Link href="/work" className={styles.viewAllDesktop}>
            Voir tous les projets
          </Link>
        </div>

        <div className={`${styles.grid} ${limit === 4 ? styles.grid4 : ""}`}>
          {projects.map((project: any) => {
            const attrs = project.attributes || project;
            return (
              <ProjectItem
                key={project.id}
                title={attrs.title}
                client={
                  attrs.client?.data?.attributes?.name ||
                  attrs.client?.name ||
                  "Client"
                }
                slug={attrs.slug}
                thumbnail={attrs.thumbnail}
              />
            );
          })}
        </div>

        <Link href="/work" className={styles.viewAllMobile}>
          Voir tous les projets
        </Link>
      </div>
    </section>
  );
}
