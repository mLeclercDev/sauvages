"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ProjectItem from "@/components/ui/ProjectItem/ProjectItem";
import styles from "./Projects.module.scss";

interface Project {
  id: number;
  attributes: any;
}

interface ProjectsListProps {
  projects: Project[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorRef.current) return;

    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cursorRef.current, "x", {
      duration: 0.6,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursorRef.current, "y", {
      duration: 0.6,
      ease: "power3.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const renderCard = (project: any, sizeClass: string) => {
    const attrs = project.attributes || project;
    const isSmall = sizeClass === styles.cardSmall;
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
        className={`${styles.projectCard} ${sizeClass}`}
        imageAspectRatio={isSmall ? "452 / 400" : "768 / 708"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    );
  };

  return (
    <div className={styles.gridWrapper}>
      <div
        ref={cursorRef}
        className={`${styles.customCursor} ${isHovered ? styles.visible : ""}`}
      >
        <div className={styles.cursorText}>Voir projet</div>
      </div>

      <div className={styles.grid}>
        {/* Row A : Grand (gauche) + Petit */}
        {projects[0] && (
          <div className={styles.rowA}>
            {renderCard(projects[0], styles.cardLarge)}
            {projects[1] && renderCard(projects[1], styles.cardSmall)}
          </div>
        )}

        {/* Row B : Grand (droite, décalé) */}
        {projects[2] && (
          <div className={styles.rowB}>
            {renderCard(projects[2], styles.cardLarge)}
          </div>
        )}

        {/* Row C : Petit + Petit (gauche) */}
        {projects[3] && (
          <div className={styles.rowC}>
            {renderCard(projects[3], styles.cardSmall)}
            {projects[4] && renderCard(projects[4], styles.cardSmall)}
          </div>
        )}

        {/* Row D : Petit (tout à droite) */}
        {projects[5] && (
          <div className={styles.rowD}>
            {renderCard(projects[5], styles.cardSmall)}
          </div>
        )}

        {/* Row A : Grand + Petit (cycle suivant) */}
        {projects[6] && (
          <div className={styles.rowA}>
            {renderCard(projects[6], styles.cardLarge)}
            {projects[7] && renderCard(projects[7], styles.cardSmall)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
