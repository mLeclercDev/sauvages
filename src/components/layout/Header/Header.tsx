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
                viewBox="0 0 229 27"
                fill="none"
              >
                <path
                  d="M167.226 18.1238V16.5528L159.615 16.5672L159.61 11.3349L174.257 11.3309L174.262 21.5354C173.13 22.6397 171.85 23.4416 170.447 24.1187C166.485 25.9566 161.491 26.6034 157.2 25.975C154.733 25.6135 152.403 24.8141 150.344 23.4285C149.566 22.9052 148.935 22.3321 148.289 21.6524C146.451 19.7146 145.381 17.2062 145.184 14.5308C145.049 12.685 145.175 10.8143 145.713 9.04605C146.622 6.05519 148.623 3.59677 151.35 2.06387C153.494 0.858323 155.867 0.239116 158.323 0.0471746C159.137 -0.0159293 161.223 -0.017244 162.02 0.0524332C165.178 0.327198 168.164 1.18042 170.684 3.16293C172.677 4.73132 174.134 7.13453 174.211 9.74545H165.559C165.405 9.65606 165.437 9.38918 165.362 9.2564C164.929 8.49127 164.248 7.92464 163.393 7.58809C161.466 6.83084 159.251 6.76248 157.313 7.48423C155.376 8.20598 154.011 10.0044 153.758 12.104C153.471 14.4967 154.091 16.7921 156.251 18.1067C159.134 19.8605 164.134 19.424 167.227 18.1225L167.226 18.1238Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M213.807 26.1525C210.781 25.9987 206.934 25.4268 204.612 23.322C203.762 22.5437 203.079 21.6747 202.674 20.5901C202.271 19.5082 202.016 18.4144 202.004 17.239L210.478 17.243C210.622 19.3202 212.813 19.779 214.478 19.9039C215.815 20.0459 217.127 19.9946 218.461 19.8329C219.246 19.7382 220.273 19.4832 220.377 18.6076C220.44 18.0804 220.231 17.5901 219.743 17.3153C218.649 16.7 217.022 16.5541 215.749 16.3806L211.875 15.8521C210.323 15.6404 207.802 14.941 206.399 14.2245C205.488 13.7591 204.596 13.086 203.908 12.3143C202.862 11.1429 202.406 9.63766 202.373 8.07321C202.31 5.08235 203.931 2.92629 206.53 1.64055C206.92 1.4473 207.261 1.27376 207.674 1.1252C210.769 0.00773947 213.521 -0.0908605 216.773 0.0498086C217.204 0.068214 217.603 0.124745 218.031 0.170758C220.038 0.383733 221.973 0.870159 223.752 1.8062C224.61 2.32023 225.403 2.83427 226.076 3.56259C227.388 4.98375 228.105 6.7546 228.152 8.69899H219.698C219.697 7.86943 219.255 7.2476 218.569 6.84531C217.846 6.50087 217.073 6.38255 216.258 6.26817C214.733 6.27343 213.394 6.09332 211.942 6.58106C211.537 6.71647 211.106 7.00044 211.031 7.41982C210.956 7.8392 211.087 8.24411 211.438 8.47155C212.064 8.87778 212.773 9.0316 213.521 9.15518L219.091 10.0768C220.866 10.3699 222.566 10.7512 224.235 11.3954C226.181 12.146 228.105 13.5948 228.682 15.6838C229.21 17.594 229.118 19.9749 228.123 21.7339C227.172 23.414 225.5 24.5473 223.673 25.1586C220.637 26.1722 217.003 26.3129 213.809 26.1512L213.807 26.1525Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M198.792 16.0748L185.653 16.0787L185.646 19.0893L199.377 19.0854L199.385 25.6363L177.305 25.6337L177.299 0.509165L199.382 0.503906L199.384 6.98915L185.644 7.00098L185.649 10.0129L198.783 10.0116L198.792 16.0748Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M136.559 25.0541L135.186 21.0982H124.725L123.169 25.6351L114.194 25.6299L120.049 11.1291L123.289 3.13729L124.366 0.492188L135.542 0.497446L137.53 5.40509L138.893 8.77852L145.298 24.6281C145.439 24.9765 145.595 25.2473 145.66 25.6312L136.811 25.6378C136.65 25.4721 136.712 25.2552 136.559 25.0528V25.0541ZM133.018 14.8365L129.973 6.02167C129.728 6.48706 129.615 6.93404 129.455 7.39155L128.586 9.87626L126.891 14.8562L133.018 14.8365Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M76.8555 0.507888L85.213 0.5L85.1841 14.4354C85.0999 16.2681 84.7975 17.9824 84.1428 19.6731C83.2291 22.0342 81.4477 23.8695 79.1338 24.9081C76.4519 26.111 73.1559 26.3476 70.2439 26.1544C67.0347 25.9414 63.8702 25.0895 61.6103 22.6929C60.7978 21.8304 60.2233 20.876 59.7973 19.7861C59.2636 18.4189 58.7508 16.3509 58.7456 14.9074L58.6982 0.5L67.0558 0.509203C67.0203 0.93121 66.9808 1.22701 67.0452 1.60432L67.0742 13.995C67.0755 14.7142 67.2543 15.3518 67.437 16.0196C67.6434 16.7703 68.047 17.4644 68.6018 17.9956C69.8613 19.2011 72.0976 19.2905 73.6726 18.8738C75.1543 18.4807 76.1692 17.216 76.5373 15.7593C76.7556 14.8943 76.745 14.6261 76.8568 13.7452L76.8542 0.513147L76.8555 0.507888Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M26.3843 21.2063C25.5981 23.0481 23.7693 24.414 21.9038 25.074C18.7853 26.177 15.0371 26.3242 11.7386 26.152C9.94795 26.0587 8.21913 25.8326 6.49557 25.3501C3.56249 24.5284 1.14871 22.7037 0.353318 19.6615C0.142967 18.8583 -0.0318873 18.0839 0.00492411 17.2373L8.44394 17.2412C8.65167 18.7912 9.78362 19.4854 11.2548 19.7417C13.1321 20.0691 15.0345 20.0651 16.9119 19.7483C17.3392 19.676 17.7559 19.534 18.0622 19.2461C18.3686 18.9582 18.4488 18.5256 18.3633 18.1326C18.124 17.048 16.2782 16.7377 15.2922 16.6023L9.92166 15.8608C8.33614 15.6426 6.84396 15.2495 5.36493 14.6566C2.14919 13.3669 0.19424 11.0978 0.373038 7.49167C0.438773 6.17569 0.848958 4.94911 1.67721 3.90264C3.79387 1.23124 7.5092 0.330696 10.7631 0.057246C11.4861 -0.00322858 12.1672 0.00597408 12.9008 0.000715419C14.7979 -0.0124312 16.6384 0.154531 18.483 0.591C20.3275 1.02747 22.2653 1.86097 23.6011 3.11647C23.8061 3.30841 24.0441 3.45697 24.1782 3.72253C25.4377 4.99907 26.0885 6.96186 26.166 8.69853H17.677C17.7572 5.9614 13.119 6.16386 11.3468 6.2927C10.4936 6.35449 9.004 6.62268 8.98297 7.65863C8.96193 8.69459 10.6369 9.01537 11.4546 9.15078L17.0789 10.0789C18.7564 10.3563 21.466 10.9821 22.9595 11.7157C24.3294 12.3888 25.6756 13.4156 26.3409 14.8314C27.1941 16.6509 27.1731 19.3591 26.3829 21.2063H26.3843Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M42.0524 21.089L37.7665 21.1034L37.2038 22.7533L36.2033 25.6351H27.2397L30.725 16.9872L32.1554 13.481L36.4899 2.71784L37.405 0.5L48.5983 0.502629L50.1378 4.31121L51.7088 8.21708L58.7437 25.6206L49.8288 25.6443L48.2354 21.0982L42.0524 21.089ZM45.9071 14.8627C46.0662 14.8627 46.0241 14.6445 46.0031 14.5853L45.1932 12.2689L43.1094 6.28978C43.0779 6.19776 42.9898 6.10573 42.9004 6.13991C42.8491 6.46858 42.7124 6.78015 42.598 7.11013L40.3893 13.4889C40.2302 13.9503 40.0698 14.3566 39.9726 14.8614H45.9071V14.8627Z"
                  fill="#F6F6F6"
                />
                <path
                  d="M109.216 0.516732C109.963 0.453629 110.631 0.502271 111.374 0.502271L118.19 0.508845L108.648 25.3954C108.588 25.5545 108.496 25.64 108.333 25.64H96.7266C96.5229 25.4691 96.5018 25.2745 96.4045 25.0194L87.0649 0.562746C87.1543 0.491754 87.2477 0.485181 87.3818 0.485181H96.0075L100.53 13.5398L102.334 18.763C102.46 18.993 102.431 19.2731 102.676 19.4032L106.902 7.18997L108.071 3.80734L109.216 0.516732Z"
                  fill="#F6F6F6"
                />
              </svg>
              <svg
                className={styles.logoResponsive}
                xmlns="http://www.w3.org/2000/svg"
                width="59"
                height="14"
                viewBox="0 0 59 14"
                fill="none"
              >
                <path
                  d="M7.77403 5.14157L7.39998 5.08258C5.36949 4.76417 4.44307 4.61937 4.44307 3.94902C4.44307 3.5676 4.68507 3.12919 6.57009 3.12919C8.45511 3.12919 9.22668 3.55955 9.22668 4.56708V4.70115H13.352L13.3453 4.56038C13.2722 3.08629 12.6475 1.94401 11.4864 1.16574C10.3321 0.392154 8.6723 0 6.55199 0C4.68507 0 3.12181 0.357296 2.0325 1.03368C0.892234 1.74157 0.28892 2.78664 0.28892 4.05494C0.28892 5.32324 0.798385 6.34418 1.84547 7.04335C2.80206 7.6822 4.25604 8.10586 6.28854 8.33914C8.58314 8.61934 9.59738 8.77486 9.59738 9.53102C9.59738 10.076 9.17841 10.4393 7.13519 10.4393C5.09197 10.4393 4.16085 9.91379 4.16085 8.8781V8.74403H0L0.00670349 8.8848C0.161554 12.1125 2.37035 13.5518 7.17072 13.5518C11.5374 13.5518 13.7515 12.1521 13.7515 9.39024C13.7515 6.2939 11.1606 5.65573 7.77403 5.14224V5.14157Z"
                  fill="white"
                />
                <path
                  d="M25.2022 0.265625L21.6574 10.0232L18.0952 0.265625H13.7419L18.846 13.2509H24.4333L29.5555 0.265625H25.2022Z"
                  fill="white"
                />
                <path
                  d="M36.4342 8.60526H40.4965V9.46532C39.6291 9.88831 38.5016 10.1209 37.3097 10.1209C34.824 10.1209 33.3989 8.9143 33.3989 6.81074C33.3989 4.70719 34.747 3.4476 36.8324 3.4476C38.6303 3.4476 39.6056 4.2547 39.7746 5.05443L39.7974 5.16101H44.0065L43.9964 5.01756C43.8972 3.6058 43.1571 2.33214 41.9123 1.43186C40.6172 0.495388 38.8669 0 36.8505 0C32.2197 0 29.2273 2.68743 29.2273 6.84627C29.2273 8.86201 29.9781 10.5607 31.3992 11.7572C32.7915 12.9304 34.7376 13.5504 37.0275 13.5504C39.8202 13.5504 42.4171 12.6649 43.973 11.1821L44.0145 11.1425V5.88164H36.4342V8.60459V8.60526Z"
                  fill="white"
                />
                <path
                  d="M53.0219 5.14224L52.6478 5.08325C50.6174 4.76484 49.6909 4.62004 49.6909 3.94969C49.6909 3.56827 49.9329 3.12986 51.818 3.12986C53.703 3.12986 54.4745 3.56022 54.4745 4.56776V4.70183H58.5999L58.5932 4.56105C58.5201 3.08696 57.8947 1.94468 56.7343 1.16641C55.5799 0.392154 53.9202 0 51.7999 0C49.9329 0 48.3697 0.357296 47.2804 1.03368C46.1394 1.74157 45.5368 2.78664 45.5368 4.05561C45.5368 5.32458 46.0463 6.34485 47.0933 7.04402C48.0499 7.68287 49.5039 8.10653 51.5364 8.33981C53.831 8.62001 54.8452 8.77553 54.8452 9.53169C54.8452 10.0767 54.4263 10.44 52.3831 10.44C50.3398 10.44 49.4087 9.91446 49.4087 8.87877V8.7447H45.2485L45.2552 8.88547C45.4094 12.1132 47.6189 13.5524 52.4193 13.5524C56.7859 13.5524 59.0001 12.1528 59.0001 9.39091C59.0001 6.29457 56.4092 5.6564 53.0226 5.14291L53.0219 5.14224Z"
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
