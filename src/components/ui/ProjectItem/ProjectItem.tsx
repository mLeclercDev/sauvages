"use client";

import React, { useRef } from "react";
import Image from "next/image";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./ProjectItem.module.scss";

interface ProjectItemProps {
  title: string;
  client: string;
  slug: string;
  thumbnail: any;
  clientFavicon?: any;
  className?: string;
  imageAspectRatio?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  title,
  client,
  slug,
  thumbnail,
  clientFavicon,
  className = "",
  imageAspectRatio,
  onMouseEnter,
  onMouseLeave,
}) => {
  const mediaUrl = getStrapiMedia(thumbnail);
  const faviconUrl = getStrapiMedia(clientFavicon);
  const thumbnailAttrs = thumbnail?.data?.attributes || thumbnail?.attributes || thumbnail || {};
  const isVideo = (thumbnailAttrs.mime as string || "").startsWith("video/");
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
    <TransitionLink
      href={`/work/${slug}`}
      className={`${styles.projectItem} ${className} project-item`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={containerRef}
        className={`${styles.imageWrapper} image-wrapper`}
        style={imageAspectRatio ? { aspectRatio: imageAspectRatio } : undefined}
      >
        <div ref={imageRef} className={styles.imageWrapperInner}>
          {mediaUrl ? (
            isVideo ? (
              <video
                src={mediaUrl}
                className={styles.video}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={mediaUrl}
                alt={title}
                fill
                unoptimized
                className="fit-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.imgWrapper}>
          {faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faviconUrl}
              alt={client}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : mediaUrl ? (
            isVideo ? (
              <video src={mediaUrl} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Image src={mediaUrl} alt={title} fill unoptimized className="fit-cover" sizes="80px" />
            )
          ) : null}
        </div>
        <div className={styles.infoWrapper}>
          <span className={styles.client}>{client}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
      </div>
    </TransitionLink>
  );
};

export default ProjectItem;
