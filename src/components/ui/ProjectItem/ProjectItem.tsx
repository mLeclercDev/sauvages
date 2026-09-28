"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import { parseVimeoField } from "@/utils/vimeo";
import VimeoEmbed from "@/components/ui/VimeoEmbed/VimeoEmbed";
import styles from "./ProjectItem.module.scss";

interface ProjectItemProps {
  title: string;
  client: string;
  slug: string;
  thumbnail: any;
  thumbnailFallback?: any;
  /** New Strapi field: Vimeo ID/URL for this project's thumbnail reel */
  thumbnailVimeo?: string | null;
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
  thumbnailFallback,
  thumbnailVimeo,
  clientFavicon,
  className = "",
  imageAspectRatio,
  onMouseEnter,
  onMouseLeave,
}) => {
  const mediaUrl = getStrapiMedia(thumbnail);
  const fallbackUrl = getStrapiMedia(thumbnailFallback);
  const faviconUrl = getStrapiMedia(clientFavicon);
  const thumbnailAttrs = thumbnail?.data?.attributes || thumbnail?.attributes || thumbnail || {};
  const mime = (thumbnailAttrs.mime as string) || "";
  const vimeo = parseVimeoField(thumbnailVimeo);
  const isThumbnailVideoFile = mime.startsWith("video/") || /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl || "");
  // Legacy fallback: mime-sniffed native video, used until `thumbnailVimeo` is populated.
  const isLegacyVideo = !vimeo && isThumbnailVideoFile;
  const isVideo = !!vimeo || isLegacyVideo;
  // Never pass a video file URL to next/image — only a real poster/fallback qualifies.
  const vimeoFallbackImageUrl = fallbackUrl || (isThumbnailVideoFile ? undefined : mediaUrl);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

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
    if (!isLegacyVideo) return;
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
  }, [isLegacyVideo]);

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
          {vimeo ? (
            <VimeoEmbed
              vimeoId={vimeo.id}
              vimeoHash={vimeo.hash}
              mode="background"
              fallbackImageUrl={vimeoFallbackImageUrl}
              alt={title}
              className={styles.video}
            />
          ) : mediaUrl ? (
            isLegacyVideo && !(hasVideoError && fallbackUrl) ? (
              <video
                ref={mainVideoRef}
                muted
                loop
                playsInline
                preload="none"
                poster={fallbackUrl || undefined}
                onError={() => setHasVideoError(true)}
                className={styles.video}
              >
                <source src={mediaUrl} type={mime || "video/mp4"} />
              </video>
            ) : (
              <Image
                src={isVideo ? fallbackUrl! : mediaUrl}
                alt={title}
                fill
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
          ) : vimeo ? (
            <VimeoEmbed
              vimeoId={vimeo.id}
              vimeoHash={vimeo.hash}
              mode="background"
              fallbackImageUrl={vimeoFallbackImageUrl}
              alt={title}
            />
          ) : mediaUrl ? (
            isLegacyVideo && !(hasVideoError && fallbackUrl) ? (
              <video
                muted
                loop
                playsInline
                preload="none"
                poster={fallbackUrl || undefined}
                onError={() => setHasVideoError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              >
                <source src={mediaUrl} type={mime || "video/mp4"} />
              </video>
            ) : (
              <Image src={isVideo ? fallbackUrl! : mediaUrl} alt={title} fill className="fit-cover" sizes="80px" />
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
