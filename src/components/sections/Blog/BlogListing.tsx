"use client";

import React, { useState, useEffect, useRef } from "react";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import Image from "next/image";
import { getStrapiMedia } from "@/utils/strapi";
import gsap from "gsap";
import styles from "./BlogListing.module.scss";

interface Article {
  id: number;
  attributes: any;
}

interface BlogListingProps {
  articles: Article[];
}

const BlogListing: React.FC<BlogListingProps> = ({ articles }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wrapperYTo = useRef<gsap.QuickToFunc | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndexRef = useRef<number | null>(null);
  const zIndexCounter = useRef<number>(10);

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

    // Initial state for items
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

    gsap.killTweensOf(el);
    zIndexCounter.current += 1;
    gsap.set(el, { zIndex: zIndexCounter.current });

    if (prev === index) return;

    gsap.fromTo(
      el,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.6,
        ease: "expo.out",
        onComplete: () => {
          if (prev !== null && prev !== prevIndexRef.current) {
            const prevEl = itemRefs.current[prev];
            if (prevEl) gsap.set(prevEl, { scale: 0, zIndex: 1 });
          }
        },
      }
    );

    prevIndexRef.current = index;
  };

  const handleMouseLeaveList = () => {
    setHoveredIndex(null);
    setIsVisible(false);

    if (wrapperRef.current) {
      gsap.killTweensOf(wrapperRef.current, "scale,opacity");
      gsap.to(wrapperRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }

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

  // Format date helper
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${month}.${year}`; // format "01.2026"
  };

  return (
    <div className={styles.listingWrapper} onMouseLeave={handleMouseLeaveList}>
      {/* Floating Image cursor */}
      <div ref={wrapperRef} className={styles.imageReelWrapper}>
        <div className={styles.imageReel}>
          {articles.map((article, idx) => {
            const url = getStrapiMedia(
              article.attributes?.image ?? article.attributes ?? null,
              "medium"
            );
            return (
              <div
                key={article.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className={styles.reelItem}
              >
                {url && (
                  <Image
                    src={url}
                    alt={article.attributes?.title || "Blog Image"}
                    fill
                    className={styles.reelImage}
                    sizes="500px"
                    unoptimized={true}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Headers */}
      <div className={styles.tableHeader}>
        <div className={styles.colTitle}>Titre</div>
        <div className={styles.colDate}>Date</div>
        <div className={styles.colType}>Type</div>
        <div className={styles.colSummary}>Résumé</div>
      </div>

      {/* List */}
      <div className={styles.tableBody}>
        {articles.map((article, index) => {
          const attrs = article.attributes || article;
          const isHovered = hoveredIndex === index;
          const hasHover = hoveredIndex !== null;

          // Compute row classes: if a row is hovered, others get dimmed
          const rowClass = `${styles.tableRow} ${
            hasHover && !isHovered ? styles.dimmed : ""
          }`;

          const thumbnailUrl = getStrapiMedia(attrs.image, "medium");

          return (
            <TransitionLink
              key={article.id}
              href={`/blog/${attrs.slug}`}
              className={rowClass}
              onMouseEnter={() => handleMouseEnter(index)}
            >
              <div className={styles.colTitle}>
                <h3>{attrs.title}</h3>
              </div>
              <div className={styles.colDate}>
                {formatDate(attrs.publishedAt)}
              </div>
              <div className={styles.colType}>
                {attrs.type || "Actualités"}
              </div>
              <div className={styles.colSummary}>
                {attrs.excerpt || "Découvrez notre dernier article."}
              </div>
              <div className={styles.colImage}>
                {thumbnailUrl && (
                  <Image
                    src={thumbnailUrl}
                    alt={attrs.title || "Preview"}
                    fill
                    className="fit-cover"
                    sizes="400px"
                    unoptimized={true}
                  />
                )}
              </div>
            </TransitionLink>
          );
        })}
      </div>
    </div>
  );
};

export default BlogListing;
