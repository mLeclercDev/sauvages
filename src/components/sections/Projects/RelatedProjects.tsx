import React from "react";
import Link from "next/link";
import ProjectItem from "@/components/ui/ProjectItem/ProjectItem";
import styles from "./RelatedProjects.module.scss";

interface RelatedProjectsProps {
  projects: any[];
}

const RelatedProjects: React.FC<RelatedProjectsProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <section className={`${styles.relatedProjects} pt-top pb-bottom`}>
      <div className="container">
        <div className={styles.header}>
          <h3 className={styles.title}>Autres projets</h3>
          <Link href="/work" className={styles.viewAll}>
            Voir tous les projets
          </Link>
        </div>

        <div className={styles.grid}>
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
      </div>
    </section>
  );
};

export default RelatedProjects;
