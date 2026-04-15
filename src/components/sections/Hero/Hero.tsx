"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import styles from "./Hero.module.scss";

export default function Hero() {
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
          const vWidth = 360 + (windowWidth - 360 - 64) * progress;
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

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isCursorVisible = isHoveringVideo && scrollData.progress > 0.85;

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
    "--reel-right": "32px",
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
                <video
                  loop
                  muted
                  autoPlay
                  playsInline
                  src="https://api.agence-sauvages.com/uploads/SAUVAGES_REEL_SITE_c3eb582103.mp4"
                >
                  Tu navigateur no soporta la reproducción de vídeo.
                </video>
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
            Agence créative, unie pour créer de l’émotion depuis 20ans. De la
            stratégie à la création.
          </h1>
          <svg
            className={styles.logoResponsive}
            width="335"
            height="39"
            viewBox="0 0 335 39"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M244.633 26.5137V24.2154L233.499 24.2365L233.492 16.582L254.918 16.5763L254.926 31.5045C253.27 33.12 251.397 34.2932 249.345 35.2837C243.548 37.9724 236.244 38.9186 229.966 37.9993C226.356 37.4704 222.948 36.3011 219.937 34.274C218.798 33.5085 217.875 32.67 216.931 31.6757C214.242 28.8408 212.676 25.1712 212.388 21.2574C212.19 18.5572 212.374 15.8204 213.161 13.2336C214.492 8.85825 217.419 5.26178 221.408 3.01927C224.545 1.25566 228.016 0.349807 231.609 0.0690126C232.799 -0.0233033 235.851 -0.0252266 237.017 0.0767056C241.637 0.478664 246.004 1.72685 249.691 4.62711C252.607 6.92154 254.738 10.4372 254.851 14.2568H242.194C241.969 14.126 242.015 13.7356 241.906 13.5414C241.273 12.422 240.277 11.5931 239.025 11.1008C236.207 9.99297 232.967 9.89296 230.132 10.9488C227.297 12.0047 225.301 14.6357 224.931 17.7071C224.51 21.2074 225.418 24.5654 228.578 26.4887C232.795 29.0543 240.11 28.4158 244.635 26.5117L244.633 26.5137Z"
              fill="#060606"
            />
            <path
              d="M312.774 38.259C308.347 38.0339 302.719 37.1973 299.323 34.1182C298.079 32.9796 297.081 31.7084 296.488 30.1217C295.898 28.5389 295.525 26.9387 295.507 25.2193L307.905 25.2251C308.114 28.2638 311.32 28.9351 313.755 29.1178C315.711 29.3255 317.63 29.2505 319.582 29.0139C320.731 28.8754 322.233 28.5023 322.385 27.2214C322.477 26.4502 322.171 25.7328 321.458 25.3309C319.858 24.4308 317.477 24.2173 315.615 23.9635L309.947 23.1903C307.678 22.8807 303.989 21.8575 301.937 20.8093C300.604 20.1285 299.3 19.1438 298.292 18.0148C296.763 16.3012 296.096 14.0991 296.048 11.8104C295.955 7.43506 298.327 4.28093 302.129 2.4C302.698 2.11728 303.198 1.86341 303.802 1.64608C308.33 0.0113222 312.355 -0.132922 317.113 0.072866C317.744 0.0997915 318.327 0.182491 318.954 0.249805C321.888 0.561371 324.719 1.27297 327.322 2.64233C328.577 3.39432 329.737 4.14631 330.722 5.21179C332.641 7.29082 333.689 9.88143 333.759 12.7259H321.392C321.39 11.5123 320.744 10.6026 319.74 10.0141C318.682 9.51025 317.552 9.33715 316.359 9.16983C314.128 9.17752 312.17 8.91404 310.045 9.62756C309.453 9.82566 308.822 10.2411 308.712 10.8546C308.603 11.4681 308.795 12.0605 309.309 12.3932C310.224 12.9875 311.261 13.2125 312.355 13.3933L320.504 14.7415C323.1 15.1704 325.587 15.7281 328.029 16.6705C330.876 17.7687 333.689 19.8881 334.534 22.9441C335.307 25.7386 335.172 29.2216 333.716 31.7949C332.326 34.2528 329.88 35.9107 327.206 36.805C322.765 38.2878 317.45 38.4936 312.776 38.257L312.774 38.259Z"
              fill="#060606"
            />
            <path
              d="M290.81 23.5172L271.589 23.523L271.579 27.9272L291.666 27.9215L291.677 37.505L259.376 37.5012L259.369 0.745974L291.673 0.738281L291.675 10.2257L271.575 10.243L271.583 14.6491L290.796 14.6472L290.81 23.5172Z"
              fill="#060606"
            />
            <path
              d="M199.771 36.6547L197.761 30.8676H182.458L180.182 37.5048L167.052 37.4971L175.619 16.2837L180.357 4.59223L181.933 0.722656L198.282 0.730349L201.19 7.90983L203.184 12.8449L212.554 36.0316C212.76 36.5412 212.989 36.9374 213.083 37.499L200.138 37.5086C199.903 37.2663 199.994 36.949 199.771 36.6528V36.6547ZM194.589 21.7072L190.135 8.81184C189.778 9.49267 189.612 10.1466 189.377 10.8159L188.106 14.4508L185.627 21.7361L194.589 21.7072Z"
              fill="#060606"
            />
            <path
              d="M112.431 0.742008L124.657 0.730469L124.615 21.1169C124.491 23.7979 124.049 26.3058 123.091 28.7791C121.755 32.2333 119.149 34.9181 115.764 36.4375C111.84 38.1973 107.019 38.5434 102.759 38.2607C98.0642 37.9492 93.4349 36.7029 90.1289 33.1968C88.9403 31.9352 88.0999 30.5389 87.4767 28.9445C86.6959 26.9443 85.9458 23.9191 85.9381 21.8073L85.8689 0.730469L98.095 0.743932C98.043 1.36129 97.9853 1.79402 98.0796 2.346L98.1219 20.4726C98.1238 21.5246 98.3854 22.4574 98.6527 23.4344C98.9546 24.5326 99.5451 25.5481 100.357 26.3251C102.199 28.0887 105.471 28.2195 107.775 27.6098C109.942 27.0347 111.427 25.1846 111.965 23.0536C112.285 21.7881 112.269 21.3958 112.433 20.1072L112.429 0.749701L112.431 0.742008Z"
              fill="#060606"
            />
            <path
              d="M38.5971 31.023C37.447 33.7175 34.7717 35.7158 32.0427 36.6812C27.4807 38.2948 21.9976 38.5102 17.1721 38.2583C14.5527 38.1217 12.0236 37.7909 9.50225 37.0851C5.2115 35.8831 1.68042 33.2136 0.516863 28.7632C0.209144 27.5881 -0.0466474 26.4553 0.00720339 25.2167L12.3525 25.2225C12.6564 27.49 14.3123 28.5055 16.4644 28.8805C19.2108 29.3594 21.9937 29.3537 24.7401 28.8902C25.3652 28.7844 25.9748 28.5767 26.4229 28.1555C26.8711 27.7343 26.9884 27.1015 26.8634 26.5265C26.5133 24.9398 23.8131 24.4859 22.3707 24.2878L14.5142 23.2031C12.1948 22.8838 10.0119 22.3088 7.84826 21.4414C3.14401 19.5547 0.28415 16.2352 0.545711 10.9597C0.641873 9.03454 1.24193 7.24015 2.45357 5.70925C5.54999 1.80121 10.9851 0.483782 15.7451 0.0837462C16.8029 -0.00472315 17.7991 0.00873959 18.8723 0.0010466C21.6475 -0.0181859 24.3401 0.226067 27.0384 0.864585C29.7367 1.5031 32.5715 2.72244 34.5256 4.55914C34.8256 4.83994 35.1737 5.05726 35.3699 5.44576C37.2123 7.31323 38.1643 10.1846 38.2778 12.7253H25.8594C25.9767 8.72105 19.1915 9.01723 16.599 9.20571C15.3508 9.2961 13.1718 9.68845 13.141 11.204C13.1103 12.7195 15.5605 13.1888 16.7567 13.3869L24.9844 14.7447C27.4384 15.1505 31.4022 16.0659 33.587 17.1391C35.591 18.1238 37.5604 19.6259 38.5336 21.6972C39.7818 24.359 39.751 28.3209 38.5951 31.023H38.5971Z"
              fill="#060606"
            />
            <path
              d="M61.518 30.8544L55.2483 30.8755L54.4251 33.2892L52.9615 37.5049H39.8489L44.9474 24.8538L47.0399 19.7245L53.3808 3.97889L54.7194 0.734375L71.0939 0.738221L73.346 6.30987L75.6443 12.0238L85.9355 37.4838L72.894 37.5184L70.5631 30.8678L61.518 30.8544ZM67.157 21.7459C67.3897 21.7459 67.3282 21.4266 67.2974 21.3401L66.1127 17.9513L63.0643 9.20436C63.0182 9.06973 62.8893 8.9351 62.7585 8.98511C62.6835 9.46592 62.4835 9.92173 62.3162 10.4045L59.0851 19.7361C58.8524 20.4111 58.6178 21.0054 58.4755 21.7439H67.157V21.7459Z"
              fill="#060606"
            />
            <path
              d="M159.771 0.758274C160.863 0.665958 161.84 0.737118 162.927 0.737118L172.899 0.746734L158.94 37.1538C158.852 37.3865 158.717 37.5115 158.479 37.5115H141.5C141.202 37.2615 141.171 36.9769 141.029 36.6038L127.366 0.825588C127.497 0.721732 127.634 0.712116 127.83 0.712116H140.448L147.064 19.81L149.703 27.451C149.887 27.7876 149.845 28.1973 150.203 28.3877L156.386 10.5207L158.096 5.57216L159.771 0.758274Z"
              fill="#060606"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
