import React from "react";
import Link from "next/link";
import ProjectItem from "@/components/ui/ProjectItem/ProjectItem";
import { fetchAPI } from "@/utils/strapi";
import styles from "./RecentProjects.module.scss";
import Button from "@/components/ui/Button/Button";

interface RecentProjectsProps {
  category?: string;
  title?: string;
  limit?: number;
}

export default async function RecentProjects({
  category,
  title,
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
      sort: ["createdAt:desc"],
      pagination: { limit },
      populate: ["thumbnail", "client"],
      status: "published",
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
          {title && <h2 className={styles.title}>{title}</h2>}
          <Button
            className={styles.viewAllDesktop}
            label="retourner à la liste de projets"
            variant="outline"
            color="black"
            href={"/work"}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="13"
                viewBox="0 0 14 13"
                fill="none"
              >
                <path
                  d="M13.0039 0.75V6.07884C13.0039 6.68637 12.5591 7.17884 12.0068 7.17884C9.87641 7.17884 4.76829 7.17884 1.00391 7.17884M5.08391 11.75C5.08391 11.75 2.59725 8.96403 1.00391 7.17884C2.59725 5.39376 3.49057 4.39287 5.08391 2.60778"
                  stroke="#060606"
                  stroke-width="1.5"
                  stroke-linecap="square"
                />
              </svg>
            }
          />
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
                  ""
                }
                slug={attrs.slug}
                thumbnail={attrs.thumbnail}
              />
            );
          })}
        </div>
        <Button
          className={styles.viewAllMobile}
          label="retourner à la liste de projets"
          variant="outline"
          color="black"
          href={"/work"}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="13"
              viewBox="0 0 14 13"
              fill="none"
            >
              <path
                d="M13.0039 0.75V6.07884C13.0039 6.68637 12.5591 7.17884 12.0068 7.17884C9.87641 7.17884 4.76829 7.17884 1.00391 7.17884M5.08391 11.75C5.08391 11.75 2.59725 8.96403 1.00391 7.17884C2.59725 5.39376 3.49057 4.39287 5.08391 2.60778"
                stroke="#060606"
                stroke-width="1.5"
                stroke-linecap="square"
              />
            </svg>
          }
        />
      </div>
    </section>
  );
}
