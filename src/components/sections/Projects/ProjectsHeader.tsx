"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import styles from "./ProjectsHeader.module.scss";

const ProjectsHeader = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const titleProps = { "data-parallax": "0.1" };
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);

  // 8 images to match the screenshot
  const floatingImages = [
    "/images/agence-hero.png", // Book Top Left
    "/images/agence-team.png", // Tablet Top Center
    "/images/agence-values.png", // Book Top Right
    "/images/agence-history.png", // Phone Mid Left
    "/images/agence-hero.png", // Phone Mid Right
    "/images/agence-team.png", // Book Bottom Left
    "/images/agence-values.png", // Tablet Bottom Center
    "/images/agence-history.png", // Book Bottom Right
  ];

  return (
    <section className={styles.projectsHeader} ref={headerRef}>
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className={styles.floatingImages}>
        {floatingImages.map((src, index) => (
          <div
            key={index}
            className={`${styles.floatingImg} ${styles[`img${index + 1}`]}`}
            ref={(el) => {
              imagesRef.current[index] = el;
            }}
          >
            <Image
              className="fit-cover"
              src={src}
              alt=""
              width={400}
              height={300}
              quality={90}
            />
          </div>
        ))}
      </div>
      <h1 className={styles.title} {...titleProps}>
        PROJETS
      </h1>
    </section>
  );
};

export default ProjectsHeader;
