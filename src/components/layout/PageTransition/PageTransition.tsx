"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import styles from "./PageTransition.module.scss";
import { useTransitionPage } from "@/context/TransitionContext";

const colors = [
  "#96e91e",
  "#efff9b",
  "#f22d19",
  "#fea3e0",
  "#d8d0ff",
  "#0f0fca",
];

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsAnimating } = useTransitionPage();

  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const handleTransitionStart = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string }>;
      const { href } = customEvent.detail;

      if (!overlayRef.current) return;

      const overlay = overlayRef.current;
      const content = document.querySelector(
        "[data-page-content]"
      ) as HTMLElement | null;

      const color = colors[Math.floor(Math.random() * colors.length)];
      gsap.set(overlay, {
        backgroundColor: color,
        y: "100%",
        pointerEvents: "all",
      });

      setIsAnimating(true);
      setTransitioning(true);

      const tl = gsap.timeline();

      // Overlay monte depuis le bas pour couvrir l'écran
      tl.to(overlay, { y: "0%", duration: 0.65, ease: "power2.inOut" }, 0);

      // Contenu sort en fade (pas de translateY pour ne pas casser position:fixed)
      if (content) {
        tl.to(content, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0);
      }

      // Navigation une fois l'overlay en place, contenu prêt pour l'entrée
      tl.call(() => {
        if (content) gsap.set(content, { opacity: 0 });
        router.push(href);
      });
    };

    window.addEventListener("start-page-transition", handleTransitionStart);
    return () =>
      window.removeEventListener("start-page-transition", handleTransitionStart);
  }, [router, setIsAnimating]);

  useEffect(() => {
    if (!isTransitioning || !overlayRef.current) return;

    const overlay = overlayRef.current;
    const content = document.querySelector(
      "[data-page-content]"
    ) as HTMLElement | null;

    // Petit délai pour laisser React peindre le nouveau contenu
    const timer = setTimeout(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { y: "100%", pointerEvents: "none" });
          setIsAnimating(false);
          setTransitioning(false);
        },
      });

      // Overlay sort vers le haut
      tl.to(overlay, { y: "-100%", duration: 0.65, ease: "power2.inOut" }, 0);

      // Nouveau contenu fade-in (pas de translateY pour ne pas casser position:fixed)
      if (content) {
        tl.to(content, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0.15);
        tl.set(content, { clearProps: "opacity" });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <div className={styles.overlay} ref={overlayRef} />;
}
