import React from "react";
import Link from "next/link";
import { fetchAPI } from "@/utils/strapi";
import styles from "./RecentProjects.module.scss";
import Button from "@/components/ui/Button/Button";
import RecentProjectsGrid from "./RecentProjectsGrid";

interface RecentProjectsProps {
  category?: string;
  title?: string;
  limit?: number;
  buttonLabel?: string;
  buttonHref?: string;
  buttonBlank?: boolean;
}

const arrowIcon = (
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
      strokeWidth="1.5"
      strokeLinecap="square"
    />
  </svg>
);

export default async function RecentProjects({
  category,
  title = "Plus de projets",
  limit = 3,
  buttonLabel = "retourner à la liste de projets",
  buttonHref = "/work",
  buttonBlank = false,
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
      sort: ["rank:desc"],
      pagination: { limit },
      populate: {
        thumbnail: true,
        thumbnailFallback: true,
        client: { populate: { Favicon: true } },
      },
      status: "published",
      filters,
    });

    projects = projectsData?.data || [];
  } catch (error) {
    console.error("Failed to fetch recent projects:", error);
  }

  if (!projects || projects.length === 0) return null;

  // target="_blank" uniquement pour une URL externe — Blank:true côté CMS
  // n'a de sens que dans ce cas, et un lien interne mal coché (cas observé
  // sur /work) ne doit jamais ouvrir un nouvel onglet.
  const isExternal = /^https?:\/\//i.test(buttonHref);
  const target = isExternal && buttonBlank ? "_blank" : undefined;

  return (
    <section className={`${styles.recentProjects} pt-top pb-bottom`}>
      <div className="container">
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <Button
            className={styles.viewAllDesktop}
            label={buttonLabel}
            variant="outline"
            color="black"
            href={buttonHref}
            target={target}
            icon={arrowIcon}
          />
        </div>

        <RecentProjectsGrid projects={projects} limit={limit} />
        <Button
          className={styles.viewAllMobile}
          label={buttonLabel}
          variant="outline"
          color="black"
          href={buttonHref}
          target={target}
          icon={arrowIcon}
        />
      </div>
    </section>
  );
}
