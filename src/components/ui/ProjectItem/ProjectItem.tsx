"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./ProjectItem.module.scss";

interface ProjectItemProps {
  title: string;
  client: string;
  slug: string;
  thumbnail: any;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  title,
  client,
  slug,
  thumbnail,
  className = "",
  onMouseEnter,
  onMouseLeave,
}) => {
  const imageUrl = getStrapiMedia(thumbnail, "large");
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current && imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { y: "-10%" },
        {
          y: "10%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }
  }, []);

  return (
    <Link
      href={`/work/${slug}`}
      className={`${styles.projectItem} ${className} project-item`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={containerRef}
        className={`${styles.imageWrapper} image-wrapper`}
      >
        <div ref={imageRef} className={styles.imageWrapperInner}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="fit-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.imgWrapper}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="fit-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : null}
        </div>
        <div className={styles.infoWrapper}>
          <span className={styles.client}>{client}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
      </div>
    </Link>
  );
};

export default ProjectItem;
