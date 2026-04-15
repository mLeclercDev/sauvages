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

    // Center the cursor relative to the mouse
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



  return (
    <div className={styles.gridWrapper}>
      <div
        ref={cursorRef}
        className={`${styles.customCursor} ${isHovered ? styles.visible : ""}`}
      >
        <div className={styles.cursorText}>Voir projet</div>
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
              className={styles.projectCard}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsList;
