"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./ProjectsTable.module.scss";

interface Project {
  id: number;
  attributes?: {
    title: string;
    slug: string;
    thumbnail?: any;
    client?: { data: { attributes: { name: string } } };
    expertise?: { data: any[] };
    sector?: string;
    secteur?: string;
  };
}

interface ProjectsTableProps {
  projects: Project[];
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperYTo = useRef<gsap.QuickToFunc | null>(null);
  // One ref per image item
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndexRef = useRef<number | null>(null);
  const zIndexCounter = useRef<number>(10);
  const normalizedProjects = projects.map((project: any) => ({
    ...project,
    attrs: project.attributes || project,
  }));

  useEffect(() => {
    if (!wrapperRef.current) return;

    const updateX = () => {
      if (wrapperRef.current) {
        gsap.set(wrapperRef.current, { x: window.innerWidth * 0.55 });
      }
    };

    updateX();
    gsap.set(wrapperRef.current, { yPercent: -50 });

    wrapperYTo.current = gsap.quickTo(wrapperRef.current, "y", {
      duration: 0.25,
      ease: "power3.out",
    });

    // Set all items to scale 0 initially
    itemRefs.current.forEach((el) => {
      if (el) gsap.set(el, { scale: 0, opacity: 1, zIndex: 1 });
    });

    const handleMouseMove = (e: MouseEvent) => {
      wrapperYTo.current?.(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", updateX);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateX);
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    // If this is the very first hover, animate the entire wrapper in
    if (!isVisible && wrapperRef.current) {
      gsap.killTweensOf(wrapperRef.current, "scale,opacity");
      gsap.fromTo(
        wrapperRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "expo.out" }
      );
    }

    setIsVisible(true);
    setHoveredIndex(index);

    const prev = prevIndexRef.current;
    const el = itemRefs.current[index];

    if (!el) return;

    // Stop any conflicting animations on the newly active item
    gsap.killTweensOf(el);

    // Always guarantee the new item is fundamentally above EVERYTHING else
    zIndexCounter.current += 1;
    gsap.set(el, { zIndex: zIndexCounter.current });

    // If same item re-entered, just keep it visible
    if (prev === index) return;

    // Reveal new image with pure scale 0 -> 1
    gsap.fromTo(
      el,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.6,
        ease: "expo.out",
        onComplete: () => {
          // Reset previous item to scale 0 underneath ONLY if it hasn't become active again
          if (prev !== null && prev !== prevIndexRef.current) {
            const prevEl = itemRefs.current[prev];
            if (prevEl) gsap.set(prevEl, { scale: 0, zIndex: 1 });
          }
        },
      }
    );

    prevIndexRef.current = index;
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsVisible(false);

    // Fade and scale out the entire wrapper
    if (wrapperRef.current) {
      gsap.killTweensOf(wrapperRef.current, "scale,opacity");
      gsap.to(wrapperRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }

    // Shrink active image back to 0
    const prev = prevIndexRef.current;
    if (prev !== null) {
      const el = itemRefs.current[prev];
      if (el) {
        gsap.killTweensOf(el);
        gsap.to(el, { scale: 0, duration: 0.4, ease: "power2.inOut" });
      }
    }
    prevIndexRef.current = null;
  };

  return (
    <div className={styles.tableWrapper} onMouseLeave={handleMouseLeave}>
      <div className="container" style={{ position: "relative" }}>
        <div ref={wrapperRef} className={styles.imageReelWrapper}>
          <div className={styles.imageReel}>
            {normalizedProjects.map((p, idx) => {
              const url = getStrapiMedia(p.attrs?.thumbnail);
              return (
                <div
                  key={p.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  className={styles.reelItem}
                >
                  {url && (
                    <Image
                      src={url}
                      alt={p.attrs?.title || "Projet"}
                      fill
                      className={styles.reelImage}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.listContainer}>
          <div
            className={`${styles.listHeader} ${hoveredIndex === 0 ? styles.headerActive : ""}`}
          >
            <div className={styles.col}>Projet</div>
            <div className={styles.col}>Client</div>
            <div className={`${styles.col} ${styles.expertise}`}>Expertise</div>
            <div className={`${styles.col} ${styles.sector}`}>Secteur</div>
          </div>

          <div className={styles.listBody}>
            {normalizedProjects.map((project, index) => {
              const attrs = project.attrs || {};
              const clientName =
                attrs.client?.data?.attributes?.name ||
                attrs.client?.name ||
                "Client";
              const expertiseArr = (attrs.expertise?.data || attrs.expertise || [])
                .map((item: any) => item.attributes?.titre || item.attributes?.name || item.titre || item.name)
                .filter(Boolean);

              // Only take the first one to keep the layout clean
              const expertise = expertiseArr[0] || "";

              const sectorRaw = attrs.sector || attrs.secteur || "";
              // Also ensure sector is just one word/phrase
              const sector = Array.isArray(sectorRaw)
                ? sectorRaw[0]
                : sectorRaw;

              const isRowActive = hoveredIndex === index;
              const isPrevActive =
                hoveredIndex !== null && index === hoveredIndex - 1;

              return (
                <Link
                  key={project.id}
                  href={`/work/${attrs.slug || ""}`}
                  className={`${styles.projectRow} ${isRowActive ? styles.rowActive : ""} ${isPrevActive ? styles.prevActive : ""}`}
                  onMouseEnter={() => handleMouseEnter(index)}
                >
                  <div className={styles.projectName}>{attrs.title}</div>
                  <div className={styles.clientName}>{clientName}</div>
                  <div className={`${styles.expertise} ${styles.col}`}>
                    {expertise}
                  </div>
                  <div className={`${styles.sector} ${styles.col}`}>
                    {sector}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;
