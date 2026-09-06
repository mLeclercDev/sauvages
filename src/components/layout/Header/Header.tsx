"use client";

import React, { useState, useEffect, useRef } from "react";
import TransitionLink from "@/components/ui/TransitionLink/TransitionLink";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import styles from "./Header.module.scss";
import Button from "@/components/ui/Button/Button";

interface HeaderProps {
  data?: any;
}

const normalizeHref = (href: string) => {
  if (!href) return "#";
  if (href.startsWith("#") || href.startsWith("/") || /^https?:\/\//i.test(href)) return href;
  return `/${href}`;
};

const Header: React.FC<HeaderProps> = ({ data }) => {
  const headerContent = data?.attributes || data || {};
  const navItems: { Texte: string; Url: string }[] = headerContent?.Navigation || [];
  const bouton = headerContent?.Bouton;

  const fallbackNav = [
    { Texte: "Agence", Url: "/agence" },
    { Texte: "Expertises", Url: "/expertises" },
    { Texte: "Work", Url: "/work" },
    { Texte: "Manifeste", Url: "/manifeste" },
    { Texte: "Blog", Url: "/blog" },
  ];

  const resolvedNav = navItems.length > 0 ? navItems : fallbackNav;
  const [time, setTime] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuLabelRef = useRef<HTMLSpanElement>(null); // "MENU" span
  const fermerLabelRef = useRef<HTMLSpanElement>(null); // "FERMER" span
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const isMenuOpenRef = useRef(isMenuOpen);
  isMenuOpenRef.current = isMenuOpen;
  const skipCloseAnimRef = useRef(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpenRef.current) {
      skipCloseAnimRef.current = true;
      tlRef.current?.pause(0);
      if (menuRef.current) {
        gsap.set(menuRef.current, { visibility: "hidden" });
        menuRef.current.classList.remove(styles.visible);
      }
      if (headerRef.current) {
        headerRef.current.style.mixBlendMode = "difference";
        headerRef.current.style.backgroundColor = "#000";
        headerRef.current.style.height = "";
      }
      document.body.style.overflow = "";
      setIsMenuOpen(false);
    }

    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);

    // Fix bug disparition : reset au changement de page
    if (headerRef.current) gsap.set(headerRef.current, { yPercent: 0, opacity: 1 });

    return () => {
      clearInterval(interval);
      if (headerRef.current) gsap.set(headerRef.current, { yPercent: 0, opacity: 1 });
      document.body.style.overflow = "";
    };
  }, [pathname]);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const onOpenCompleteRef = useRef<(() => void) | null>(null);
  const onCloseCompleteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!menuRef.current || !bgRef.current || !footerRef.current) return;

    // Filter out null items
    const validItems = itemRefs.current.filter((item) => item !== null);

    // Initial states
    gsap.set(bgRef.current, { scale: 0 });
    gsap.set(validItems, { yPercent: 100 });
    gsap.set(footerRef.current, { opacity: 0, y: 20 });
    // Button label initial states: MENU visible (yPercent 0), FERMER hidden below
    gsap.set(menuLabelRef.current, { yPercent: 0 });
    gsap.set(fermerLabelRef.current, { yPercent: 100 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        gsap.set(menuRef.current, { visibility: "visible" });
        menuRef.current?.classList.add(styles.visible);
        if (headerRef.current) {
          headerRef.current.style.mixBlendMode = "normal";
          headerRef.current.style.backgroundColor = "transparent";
          headerRef.current.style.height = "100dvh";
        }
      },
      onComplete: () => {
        onOpenCompleteRef.current?.();
      },
      onReverseComplete: () => {
        gsap.set(menuRef.current, { visibility: "hidden" });
        menuRef.current?.classList.remove(styles.visible);
        if (headerRef.current) {
          headerRef.current.style.mixBlendMode = "difference";
          headerRef.current.style.backgroundColor = "#000";
          headerRef.current.style.height = "";
        }
        onCloseCompleteRef.current?.();
      },
    });

    tl
      // 1. MENU slides out upward quickly
      .to(menuLabelRef.current, {
        yPercent: -100,
        duration: 0.25,
        ease: "power3.inOut",
      })
      // 2. Background expands (slight overlap)
      .to(
        bgRef.current,
        { scale: 1, duration: 0.6, ease: "power4.inOut" },
        "-=0.1"
      )
      // 3. Nav items slide in
      .to(
        validItems,
        { yPercent: 0, duration: 0.6, stagger: 0.05, ease: "expo.out" },
        "-=0.2"
      )
      // 4. Footer fades in
      .to(
        footerRef.current,
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2"
      )
      // 5. FERMER slides in from below — last, after everything is visible
      .to(
        fermerLabelRef.current,
        { y: 0, yPercent: 0, duration: 0.4, ease: "expo.out" },
        "-=0.2"
      );

    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      tlRef.current?.play();
    } else {
      if (skipCloseAnimRef.current) {
        skipCloseAnimRef.current = false;
      } else {
        tlRef.current?.reverse();
      }
    }
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isMenuOpen ? styles.isMenuOpen : ""}`}
    >
      <div ref={bgRef} className={styles.menuBackground} />
      <div className="container">
        <div className={styles.wrapper}>
          <div className={styles.logo}>
            <TransitionLink href="/">
              <svg
                className={styles.logoDesktop}
                xmlns="http://www.w3.org/2000/svg"
                width="229"
                height="27"
                viewBox="0 0 1757 202"
                fill="none"
              >
                <path
                  d="M108.091 201.699C39.4279 201.699 2.95039 183.729 0 132.499H66.2496C66.2496 143.764 75.6372 153.688 107.287 153.688C136.254 153.688 141.619 148.86 141.619 141.619C141.619 130.89 127.403 128.744 93.876 124.721C34.3318 118.284 3.21861 99.7767 3.21861 60.8853C3.21861 22.262 41.5736 0 98.4356 0C163.612 0 199.553 24.676 201.967 67.3225H136.254C136.254 53.9116 124.184 48.2791 99.2403 48.2791C75.6372 48.2791 69.7364 52.8387 69.7364 59.276C69.7364 68.6636 84.2201 69.7364 118.82 75.369C172.464 83.6837 208.136 94.9488 208.136 139.205C208.136 184.802 167.904 201.699 108.091 201.699Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M209.002 197.14L287.053 4.02344H373.419L451.47 197.14H382.002L369.932 162.271H290.272L278.202 197.14H209.002ZM306.901 114.261H353.303L330.236 46.9382L306.901 114.261Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M552.282 201.699C480.936 201.699 450.091 166.831 450.091 102.727V4.02344H514.731V100.045C514.731 124.989 521.973 146.715 552.282 146.715C582.59 146.715 589.832 124.721 589.832 100.045V4.02344H654.472V102.727C654.472 166.831 623.627 201.699 552.282 201.699Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M741.134 197.14L667.374 4.02344H736.574L787.267 149.665L837.692 4.02344H907.16L833.132 197.14H741.134Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M875.354 197.14L953.405 4.02344H1039.77L1117.82 197.14H1048.35L1036.28 162.271H956.623L944.553 197.14H875.354ZM973.253 114.261H1019.65L996.588 46.9382L973.253 114.261Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M1231.02 201.699C1160.47 201.699 1112.46 163.612 1112.46 101.922C1112.46 39.6961 1158.33 0 1227.8 0C1291.36 0 1333.74 32.186 1336.43 75.369H1269.1C1266.15 63.031 1250.06 54.1798 1227.53 54.1798C1197.76 54.1798 1178.71 72.6868 1178.71 101.386C1178.71 133.304 1201.51 148.056 1235.84 148.056C1250.6 148.056 1268.03 145.642 1282.25 139.205V127.671H1223.51V87.1705H1336.69V165.758C1314.16 187.752 1273.13 201.699 1231.02 201.699Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M1359.53 197.14V4.02344H1529.58V54.4482H1423.91V76.9785H1525.02V123.916H1423.91V146.715H1529.58V197.14H1359.53Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M1656.63 201.699C1587.96 201.699 1551.48 183.729 1548.53 132.499H1614.78C1614.78 143.764 1624.17 153.688 1655.82 153.688C1684.79 153.688 1690.15 148.86 1690.15 141.619C1690.15 130.89 1675.94 128.744 1642.41 124.721C1582.87 118.284 1551.75 99.7767 1551.75 60.8853C1551.75 22.262 1590.11 0 1646.97 0C1712.15 0 1748.09 24.676 1750.5 67.3225H1684.79C1684.79 53.9116 1672.72 48.2791 1647.77 48.2791C1624.17 48.2791 1618.27 52.8387 1618.27 59.276C1618.27 68.6636 1632.75 69.7364 1667.35 75.369C1721 83.6837 1756.67 94.9488 1756.67 139.205C1756.67 184.802 1716.44 201.699 1656.63 201.699Z"
                  fill="#F6F6F6"
                />
              </svg>
              <svg
                className={styles.logoResponsive}
                xmlns="http://www.w3.org/2000/svg"
                width="59"
                height="14"
                viewBox="0 0 887 202"
                fill="none"
              >
                <path
                  d="M108.092 201.7C39.4281 201.7 2.9504 183.729 0 132.5H66.2499C66.2499 143.765 75.6375 153.689 107.287 153.689C136.255 153.689 141.619 148.861 141.619 141.619C141.619 130.89 127.404 128.745 93.8763 124.721C34.3319 118.284 3.21862 99.7771 3.21862 60.8855C3.21862 22.2621 41.5738 0 98.436 0C163.613 0 199.554 24.6761 201.968 67.3227H136.255C136.255 53.9118 124.185 48.2792 99.2407 48.2792C75.6375 48.2792 69.7367 52.839 69.7367 59.2762C69.7367 68.6638 84.2205 69.7367 118.821 75.3693C172.464 83.684 208.137 94.9492 208.137 139.205C208.137 184.802 167.905 201.7 108.092 201.7Z"
                  fill="white"
                />
                <path
                  d="M278.304 197.14L204.544 4.02344H273.744L324.437 149.666L374.862 4.02344H444.331L370.303 197.14H278.304Z"
                  fill="white"
                />
                <path
                  d="M557.332 201.7C486.79 201.7 438.779 163.613 438.779 101.923C438.779 39.6963 484.645 0 554.113 0C617.681 0 660.059 32.1862 662.741 75.3693H595.419C592.468 63.0312 576.375 54.18 553.845 54.18C524.073 54.18 505.029 72.6871 505.029 101.386C505.029 133.304 527.828 148.056 562.16 148.056C576.912 148.056 594.346 145.642 608.561 139.205V127.672H549.822V87.1709H663.01V165.759C640.479 187.753 599.442 201.7 557.332 201.7Z"
                  fill="white"
                />
                <path
                  d="M786.757 201.7C718.093 201.7 681.615 183.729 678.665 132.5H744.915C744.915 143.765 754.303 153.689 785.952 153.689C814.92 153.689 820.284 148.861 820.284 141.619C820.284 130.89 806.069 128.745 772.541 124.721C712.997 118.284 681.884 99.7771 681.884 60.8855C681.884 22.2621 720.239 0 777.101 0C842.278 0 878.219 24.6761 880.633 67.3227H814.92C814.92 53.9118 802.85 48.2792 777.906 48.2792C754.303 48.2792 748.402 52.839 748.402 59.2762C748.402 68.6638 762.886 69.7367 797.486 75.3693C851.129 83.684 886.802 94.9492 886.802 139.205C886.802 184.802 846.57 201.7 786.757 201.7Z"
                  fill="white"
                />
              </svg>
            </TransitionLink>
          </div>
          <div className={styles.desktopMenu}>
            <nav className={styles.desktopNav}>
              <ul>
                {resolvedNav.map((item) => (
                  <li key={item.Texte}>
                    <TransitionLink href={normalizeHref(item.Url)}>
                      <div className={styles.labelWrapper}>
                        <span className={styles.label}>{item.Texte}</span>
                        <span className={styles.label}>{item.Texte}</span>
                      </div>
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>

            <button className={styles.menuButton} onClick={toggleMenu}>
              <div className={styles.menuButtonWrapper}>
                <span ref={menuLabelRef}>MENU</span>
                <span ref={fermerLabelRef}>FERMER</span>
              </div>
            </button>

            <div
              className={`${styles.desktopButton}`}
              data-preload="header-cta"
            >
              <Button
                label={bouton?.Texte || "contact"}
                variant="outline"
                color="white"
                href={bouton?.Url ? normalizeHref(bouton.Url) : undefined}
                target={bouton?.Blank ? "_blank" : undefined}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="15"
                    viewBox="0 0 18 15"
                    fill="none"
                  >
                    <path
                      d="M6.92191 4.06698V1.75C6.92191 1.19772 7.36962 0.75 7.92191 0.75H15.75C16.3023 0.75 16.75 1.19771 16.75 1.75V8.24395C16.75 8.5832 16.475 8.85823 16.1357 8.85823H16.0374C15.7524 8.85823 15.5214 9.08924 15.5214 9.3742C15.5214 9.84481 14.943 10.0698 14.6251 9.7228L14.2102 9.27009C14.0672 9.11409 13.8654 9.02526 13.6537 9.02526H11.0857M10.2711 5.80411V11.5437C10.2711 12.0959 9.82334 12.5437 9.27105 12.5437H4.03304C3.8003 12.5437 3.57824 12.6413 3.42097 12.8129L2.87503 13.4084C2.557 13.7554 1.97856 13.5304 1.97856 13.0597C1.97856 12.7747 1.74751 12.5437 1.4625 12.5437H1.36428C1.02502 12.5437 0.75 12.2686 0.75 11.9294V5.80411C0.75 5.25183 1.19771 4.80411 1.75 4.80411H9.27105C9.82334 4.80411 10.2711 5.25183 10.2711 5.80411Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        <div ref={menuRef} className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <ul>
              <li>
                <div className={styles.itemMask}>
                  <span
                    ref={(el) => { itemRefs.current[0] = el; }}
                    style={{ display: "block" }}
                  >
                    <TransitionLink href="/">Home</TransitionLink>
                  </span>
                </div>
              </li>
              {resolvedNav.map((item, index) => (
                <li key={item.Texte}>
                  <div className={styles.itemMask}>
                    <span
                      ref={(el) => {
                        itemRefs.current[index + 1] = el;
                      }}
                      style={{ display: "block" }}
                    >
                      <TransitionLink href={normalizeHref(item.Url)}>
                        {item.Texte}
                      </TransitionLink>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
          <div
            ref={footerRef}
            className={styles.mobileMenuFooter}
            style={{ transform: "translateY(20px)" }}
          >
            <div className={styles.time}>{time}</div>
            <Button
              label={bouton?.Texte || "contact"}
              variant="outline"
              color="white"
              href={bouton?.Url ? normalizeHref(bouton.Url) : undefined}
              target={bouton?.Blank ? "_blank" : undefined}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                >
                  <path
                    d="M6.92191 4.06698V1.75C6.92191 1.19772 7.36962 0.75 7.92191 0.75H15.75C16.3023 0.75 16.75 1.19771 16.75 1.75V8.24395C16.75 8.5832 16.475 8.85823 16.1357 8.85823H16.0374C15.7524 8.85823 15.5214 9.08924 15.5214 9.3742C15.5214 9.84481 14.943 10.0698 14.6251 9.7228L14.2102 9.27009C14.0672 9.11409 13.8654 9.02526 13.6537 9.02526H11.0857M10.2711 5.80411V11.5437C10.2711 12.0959 9.82334 12.5437 9.27105 12.5437H4.03304C3.8003 12.5437 3.57824 12.6413 3.42097 12.8129L2.87503 13.4084C2.557 13.7554 1.97856 13.5304 1.97856 13.0597C1.97856 12.7747 1.74751 12.5437 1.4625 12.5437H1.36428C1.02502 12.5437 0.75 12.2686 0.75 11.9294V5.80411C0.75 5.25183 1.19771 4.80411 1.75 4.80411H9.27105C9.82334 4.80411 10.2711 5.25183 10.2711 5.80411Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
