import React from "react";
import styles from "./ProjectsHeader.module.scss";

interface ProjectsHeaderProps {
  title?: string | null;
}

const ProjectsHeader = ({ title }: ProjectsHeaderProps) => {
  return (
    <section className={styles.projectsHeader}>
      <h1 className={styles.title}>{title || "Projets"}</h1>
    </section>
  );
};

export default ProjectsHeader;
