"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";
import styles from "./Hero.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

const DEFAULT_TITLE =
  "Agence créative, unie pour créer de l’émotion depuis 20ans. De la stratégie à la création.";
const DEFAULT_VIDEO_SRC =
  "https://api.agence-sauvages.com/uploads/SAUVAGES_REEL_SITE_c3eb582103.mp4";

interface HeroProps {
  data?: any;
}

export default function Hero({ data }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);
  const hasFadedOutRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  const [scrollData, setScrollData] = useState({
    progress: 0,
    parallaxProgress: 0,
    videoWidth: 360,
    videoHeight: 202.5,
    logoPt: 44,
    logoTranslation: 535.43,
    safeArea: 44,
  });

  useEffect(() => {
    setIsClient(true);
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: `(min-width: 1024px)`,
      },
      (context) => {
        const { isDesktop } = context.conditions as any;

        if (!isDesktop) return;

        const handleScroll = () => {
          if (!heroRef.current) return;

          const rect = heroRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const windowWidth = window.innerWidth;
          const totalHeight = rect.height;
          const scrolled = -rect.top;
          const progress = Math.max(
            0,
            Math.min(1, scrolled / (totalHeight - windowHeight))
          );

          // Measure header logo dynamically to match CSS media queries
          const headerLogo = document.querySelector("header svg");

          let transformBackup = "";
          if (headerLogo) {
            transformBackup = (headerLogo as HTMLElement).style.transform;
            (headerLogo as HTMLElement).style.transform = "none";
          }

          const headerRect = headerLogo?.getBoundingClientRect();
          const targetPt = headerRect ? headerRect.top : 44;
          const targetLeft = headerRect ? headerRect.left : 44;
          const targetWidth = headerRect ? headerRect.width : 229;
          const targetHeight = headerRect ? headerRect.height : 27;

          if (headerLogo) {
            (headerLogo as HTMLElement).style.transform = transformBackup;
          }

          // GSAP Fade-out at 150px (was 300px)
          const currentScroll = window.scrollY;
          if (currentScroll > 50) {
            if (!hasFadedOutRef.current) {
              hasFadedOutRef.current = true;
              gsap.to([titleRef.current, controlsRef.current], {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            }
          } else {
            if (hasFadedOutRef.current) {
              hasFadedOutRef.current = false;
              gsap.to([titleRef.current, controlsRef.current], {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            }
          }

          // Interpolate values based on progress
          const ASPECT_RATIO = 360 / 202.5;
          const vWidth = 360 + (windowWidth - 360 - 48) * progress;
          const vHeight = vWidth / ASPECT_RATIO;

          const lPt = targetPt;

          const ASPECT_RATIO_LOGO = targetWidth / targetHeight || 229 / 27;
          const initialLogoWidth = windowWidth - targetLeft * 2;
          const initialLogoHeight = initialLogoWidth / ASPECT_RATIO_LOGO;

          const lWidth =
            initialLogoWidth + (targetWidth - initialLogoWidth) * progress;
          const lHeight =
            initialLogoHeight + (targetHeight - initialLogoHeight) * progress;

          const initialTranslation =
            windowHeight - initialLogoHeight - targetPt - 20;
          const finalTranslation = 0;
          const lTranslation =
            initialTranslation +
            (finalTranslation - initialTranslation) * progress;

          if (headerLogo) {
            const scale = targetWidth > 0 ? lWidth / targetWidth : 1;
            (headerLogo as HTMLElement).style.transformOrigin = "top left";
            (headerLogo as HTMLElement).style.transform =
              `translateY(${lTranslation}px) scale(${scale})`;
          }

          setScrollData({
            progress,
            parallaxProgress: progress * 0.5,
            videoWidth: vWidth,
            videoHeight: vHeight,
            logoPt: lPt,
            logoTranslation: lTranslation,
            safeArea: targetLeft,
          });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        // Initial call
        handleScroll();

        return () => {
          window.removeEventListener("scroll", handleScroll);
          window.removeEventListener("resize", handleScroll);
          const headerLogo = document.querySelector("header svg");
          if (headerLogo) {
            (headerLogo as HTMLElement).style.transform = "";
            (headerLogo as HTMLElement).style.transformOrigin = "";
          }
        };
      }
    );

    return () => {
      mm.revert();
    };
  }, []);

  // Removed Preloader animations (now handled in Preloader.tsx)
  useEffect(() => {
    if (!isClient) return;
  }, [isClient]);

  useEffect(() => {
    if (!cursorRef.current) return;

    // We must tell GSAP to offset the element by -50% -50% to stay centered on mouse.
    gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cursorRef.current, "x", {
      duration: 0.1,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(cursorRef.current, "y", {
      duration: 0.1,
      ease: "power2.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    // Hide cursor when mouse leaves the browser window
    const handleDocMouseLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) setIsHoveringVideo(false);
    };

    // Hide cursor when tab loses visibility
    const handleVisibilityChange = () => {
      if (document.hidden) setIsHoveringVideo(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleDocMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleDocMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Reset hover when hero is completely off-screen (scrolled above or below viewport)
  useEffect(() => {
    if (!heroRef.current || !isHoveringVideo) return;
    const rect = heroRef.current.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsHoveringVideo(false);
    }
  }, [scrollData, isHoveringVideo]);

  const isCursorVisible = isHoveringVideo && scrollData.progress > 0.85;

  const title = data?.Titre || DEFAULT_TITLE;
  const mediaAttrs = data?.Video?.data?.attributes || data?.Video?.attributes || data?.Video;
  const mediaUrl = getStrapiMedia(data?.Video, undefined) || DEFAULT_VIDEO_SRC;
  const isImageMedia = !!mediaAttrs?.mime?.startsWith("image");

  const inlineStyles = {
    "--progress": scrollData.progress,
    "--parallax-progress": scrollData.parallaxProgress,
    "--video-width": scrollData.videoWidth,
    "--video-height": scrollData.videoHeight,
    "--logo-pt": `${scrollData.logoPt}px`,
    "--logo-translation": `${scrollData.logoTranslation}px`,
    "--safe-area": `${scrollData.safeArea}px`,
    "--brand-claim-opacity": 1,
    "--reel-position": scrollData.progress === 1 ? "absolute" : "fixed",
    "--reel-top": isClient
      ? scrollData.progress === 1
        ? "auto"
        : `${142 + (window.innerHeight - scrollData.videoHeight - 142) * scrollData.progress}px`
      : "142px",
    "--reel-bottom": scrollData.progress === 1 ? "0" : "auto",
    "--reel-right": "24px",
    "--video-background-color": "#060606",
  } as React.CSSProperties;

  return (
    <section className={styles.hero} ref={heroRef} style={inlineStyles}>
      <div
        ref={cursorRef}
        className={`${styles.customCursor} ${isCursorVisible ? styles.visible : ""}`}
      >
        <div className={styles.cursorText}>Voir projets</div>
      </div>
      <div className={styles.heroInner}>
        <div
          className={styles.heroReel}
          ref={videoWrapperRef}
          data-preload="hero-video"
        >
          <Link
            href="/work"
            className={`${styles.videoLink} ${isCursorVisible ? styles.cursorReady : ""}`}
            onClick={(e) => {
              if (window.innerWidth >= 1024 && !isCursorVisible) {
                e.preventDefault();
              }
            }}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
          >
            <div className={styles.videoPlayer}>
              <div className={styles.videoPlayerVideo}>
                {isImageMedia ? (
                  <Image
                    src={mediaUrl}
                    alt={title}
                    fill
                    priority
                    unoptimized
                    className="fit-cover"
                  />
                ) : (
                  <video loop muted autoPlay playsInline src={mediaUrl}>
                    Tu navigateur no soporta la reproducción de vídeo.
                  </video>
                )}
              </div>
              <div ref={controlsRef} className={styles.videoPlayerControls}>
                <div className={styles.videoPlayerControlsStart}>
                  <div className={styles.videoPlayerCaption}>Sauvages Reel</div>
                </div>
                <div className={styles.videoPlayerControlsEnd}>
                  <div className={styles.videoPlayerDuration}>[1:20min]</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title} ref={titleRef} data-preload="hero-title">
            {title}
          </h1>
          <svg
            className={styles.logoResponsive}
            width="335"
            height="39"
            viewBox="0 0 1757 202"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M108.091 201.699C39.4279 201.699 2.95039 183.729 0 132.499H66.2496C66.2496 143.764 75.6372 153.688 107.287 153.688C136.254 153.688 141.619 148.86 141.619 141.619C141.619 130.89 127.403 128.744 93.876 124.721C34.3318 118.284 3.21861 99.7767 3.21861 60.8853C3.21861 22.262 41.5736 0 98.4356 0C163.612 0 199.553 24.676 201.967 67.3225H136.254C136.254 53.9116 124.184 48.2791 99.2403 48.2791C75.6372 48.2791 69.7364 52.8387 69.7364 59.276C69.7364 68.6636 84.2201 69.7364 118.82 75.369C172.464 83.6837 208.136 94.9488 208.136 139.205C208.136 184.802 167.904 201.699 108.091 201.699Z"
              fill="#060606"
            />
            <path
              d="M209.002 197.14L287.053 4.02344H373.419L451.47 197.14H382.002L369.932 162.271H290.272L278.202 197.14H209.002ZM306.901 114.261H353.303L330.236 46.9382L306.901 114.261Z"
              fill="#060606"
            />
            <path
              d="M552.282 201.699C480.936 201.699 450.091 166.831 450.091 102.727V4.02344H514.731V100.045C514.731 124.989 521.973 146.715 552.282 146.715C582.59 146.715 589.832 124.721 589.832 100.045V4.02344H654.472V102.727C654.472 166.831 623.627 201.699 552.282 201.699Z"
              fill="#060606"
            />
            <path
              d="M741.134 197.14L667.374 4.02344H736.574L787.267 149.665L837.692 4.02344H907.16L833.132 197.14H741.134Z"
              fill="#060606"
            />
            <path
              d="M875.354 197.14L953.405 4.02344H1039.77L1117.82 197.14H1048.35L1036.28 162.271H956.623L944.553 197.14H875.354ZM973.253 114.261H1019.65L996.588 46.9382L973.253 114.261Z"
              fill="#060606"
            />
            <path
              d="M1231.02 201.699C1160.47 201.699 1112.46 163.612 1112.46 101.922C1112.46 39.6961 1158.33 0 1227.8 0C1291.36 0 1333.74 32.186 1336.43 75.369H1269.1C1266.15 63.031 1250.06 54.1798 1227.53 54.1798C1197.76 54.1798 1178.71 72.6868 1178.71 101.386C1178.71 133.304 1201.51 148.056 1235.84 148.056C1250.6 148.056 1268.03 145.642 1282.25 139.205V127.671H1223.51V87.1705H1336.69V165.758C1314.16 187.752 1273.13 201.699 1231.02 201.699Z"
              fill="#060606"
            />
            <path
              d="M1359.53 197.14V4.02344H1529.58V54.4482H1423.91V76.9785H1525.02V123.916H1423.91V146.715H1529.58V197.14H1359.53Z"
              fill="#060606"
            />
            <path
              d="M1656.63 201.699C1587.96 201.699 1551.48 183.729 1548.53 132.499H1614.78C1614.78 143.764 1624.17 153.688 1655.82 153.688C1684.79 153.688 1690.15 148.86 1690.15 141.619C1690.15 130.89 1675.94 128.744 1642.41 124.721C1582.87 118.284 1551.75 99.7767 1551.75 60.8853C1551.75 22.262 1590.11 0 1646.97 0C1712.15 0 1748.09 24.676 1750.5 67.3225H1684.79C1684.79 53.9116 1672.72 48.2791 1647.77 48.2791C1624.17 48.2791 1618.27 52.8387 1618.27 59.276C1618.27 68.6636 1632.75 69.7364 1667.35 75.369C1721 83.6837 1756.67 94.9488 1756.67 139.205C1756.67 184.802 1716.44 201.699 1656.63 201.699Z"
              fill="#060606"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
