"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ProjectItem from "@/components/ui/ProjectItem/ProjectItem";
import styles from "./WorkProjectsGrid.module.scss";

interface WorkProjectsGridProps {
  projects: any[];
}

const WorkProjectsGrid: React.FC<WorkProjectsGridProps> = ({ projects }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!gridRef.current) return;
    const allCards = Array.from(gridRef.current.children) as HTMLElement[];
    const prevCount = prevCountRef.current;
    const newCount = allCards.length;

    const targets =
      newCount > prevCount && prevCount > 0
        ? allCards.slice(prevCount)
        : allCards;

    if (targets.length > 0) {
      gsap.from(targets, {
        opacity: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });
    }

    prevCountRef.current = newCount;
  }, [projects]);

  useEffect(() => {
    if (!cursorRef.current) return;

    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.6, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          color: "#fff",
          textAlign: "center",
          background: "transparent",
          mixBlendMode: "difference",
          fontSize: "20px",
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: isHovered ? 1 : 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          transition: "opacity 0.5s ease",
        }}
      >
        Voir projet
      </div>

      <div ref={gridRef} className={styles.grid}>
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
              clientFavicon={
                attrs.client?.Favicon ||
                attrs.client?.data?.attributes?.Favicon
              }
              className={styles.card}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WorkProjectsGrid;
