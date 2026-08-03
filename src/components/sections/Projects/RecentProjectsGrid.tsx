"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ProjectItem from "@/components/ui/ProjectItem/ProjectItem";
import styles from "./RecentProjects.module.scss";

interface RecentProjectsGridProps {
  projects: any[];
  limit: number;
}

const RecentProjectsGrid: React.FC<RecentProjectsGridProps> = ({ projects, limit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorRef.current) return;
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.6, ease: "power3.out" });
    const handleMouseMove = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY); };
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
              clientFavicon={
                attrs.client?.Favicon ||
                attrs.client?.data?.attributes?.Favicon
              }
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RecentProjectsGrid;
