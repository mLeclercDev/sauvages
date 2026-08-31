"use client";

import React, { useRef, useEffect } from "react";
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
  const mime = (thumbnailAttrs.mime as string) || "";
  const isVideo = mime.startsWith("video/") || /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

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

  // Trigger .play() / .pause() via IntersectionObserver — reliable on iOS Safari and Android
  useEffect(() => {
    if (!isVideo) return;
    const el = mainVideoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideo]);

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
                ref={mainVideoRef}
                muted
                loop
                playsInline
                preload="none"
                className={styles.video}
              >
                <source src={mediaUrl} type={mime || "video/mp4"} />
              </video>
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
              <video muted loop playsInline preload="none" style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                <source src={mediaUrl} type={mime || "video/mp4"} />
              </video>
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
