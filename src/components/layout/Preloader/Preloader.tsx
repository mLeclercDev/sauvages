"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Preloader.module.scss";

export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Le preloader ne s'active que sur la home page
    if (sessionStorage.getItem("visited_home") || window.location.pathname !== "/") {
      document.documentElement.classList.remove("is-first-visit");
      return;
    }

    // Lire la couleur posée par le script <head>
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--preloader-color")
      .trim();

    if (overlayRef.current) {
      gsap.set(overlayRef.current, { backgroundColor: color || "#efff9b" });
    }

    document.body.style.overflow = "hidden";

    // Cibler les paths du logo SAUVAGES dans le header (pas l'icône du CTA,
    // qui doit apparaître avec le reste du CTA, pas avec le logo). ".logo"
    // est une classe CSS Modules (hashée) : on ne peut pas la cibler en
    // querySelector littéral, d'où l'attribut data-preload dédié.
    const logoPaths = document.querySelectorAll(
      'header [data-preload="header-logo"] svg path'
    );
    if (logoPaths.length > 0) {
      gsap.fromTo(
        logoPaths,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
        }
      );
    }

    // Sélecteurs pour le contenu à révéler
    const heroVideoEl = document.querySelector("[data-preload='hero-video']");
    const heroTitleEl = document.querySelector("[data-preload='hero-title']");
    // Calque décoy de la nav droite : c'est LUI qui fait le fondu d'entrée
    // pendant le preloader (la vraie nav reste cachée dessous jusqu'à la fin,
    // pour éviter que les deux ne soient visibles/interactives en même temps).
    const navMaskEl = document.querySelector('[data-preload="header-nav-mask"]');

    const tl = gsap.timeline({
      delay: 2.0,
      onStart: () => {
        // IMPORTANT : On cache le ::before statique du CSS dès que l'anim commence
        // sinon il reste à scale:1 derrière et bloque la vue.
        document.documentElement.classList.add("preloader-animating");
      },
      onComplete: () => {
        document.body.style.overflow = "";
        document.documentElement.classList.remove("is-first-visit");
        document.documentElement.classList.remove("preloader-animating");
        sessionStorage.setItem("visited_home", "true");

        // La classe retirée ci-dessus fait basculer la vraie nav en un seul
        // instant (couleur + mix-blend-mode), mais elle est encore entièrement
        // recouverte par le calque décoy (encore à opacity 1) : rien n'est
        // visible. On révèle la vraie nav en fondu en faisant disparaître le
        // décoy par-dessus elle.
        if (navMaskEl) {
          gsap.to(navMaskEl, { opacity: 0, duration: 0.4, ease: "power2.out" });
        }
      },
    });

    if (overlayRef.current) {
      tl.to(overlayRef.current, {
        scale: 0,
        duration: 1.2,
        ease: "expo.inOut",
        transformOrigin: "center center",
      });
    }

    if (navMaskEl) {
      tl.to(navMaskEl, { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6");
    }
    tl.to([heroVideoEl, heroTitleEl], { opacity: 1, duration: 1, ease: "power2.out" }, "-=0.8");
  }, []);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      aria-hidden="true"
    />
  );
}
