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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isTransitioning, setTransitioning] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Configuration de la grille
  const cols = 12;
  const [cellCount, setCellCount] = useState(0);

  useEffect(() => {
    // Calculer le nombre de div nécessaires pour couvrir l'écran
    const calculateGrid = () => {
      const cellWidth = window.innerWidth / cols;
      const rows = Math.ceil(window.innerHeight / cellWidth) + 1; // +1 pour marge de sécu
      setCellCount(cols * rows);
    };

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, [cols]);

  useEffect(() => {
    const handleTransitionStart = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string }>;
      const { href } = customEvent.detail;

      if (!wrapperRef.current || cellsRef.current.length === 0) return;

      setIsAnimating(true);
      setTransitioning(true);

      // Wrapper cliquable pour bloquer la navigation multiple
      gsap.set(wrapperRef.current, { pointerEvents: "all" });

      // Couleur aléatoire
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const validCells = cellsRef.current.filter(
        (c) => c !== null
      ) as HTMLDivElement[];

      // On s'assure qu'elles sont de la bonne couleur et invisibles
      gsap.set(validCells, { backgroundColor: randomColor, opacity: 0 });

      // On mélange l'ordre pour le stagger
      const shuffled = gsap.utils.shuffle([...validCells]);

      gsap.to(shuffled, {
        keyframes: [
          { opacity: "random(0.2, 0.6)", duration: 0.05, ease: "none" },
          { opacity: 1, duration: 0.05, ease: "power1.inOut" },
        ],
        stagger: {
          each: 0.008,
        },
        onComplete: () => {
          setPendingRoute(href);
          router.push(href);
        },
      });
    };

    window.addEventListener("start-page-transition", handleTransitionStart);
    return () => {
      window.removeEventListener(
        "start-page-transition",
        handleTransitionStart
      );
    };
  }, [router, setIsAnimating]);

  useEffect(() => {
    // Reveal the route once pathname has changed
    if (isTransitioning && wrapperRef.current && cellsRef.current.length > 0) {
      const validCells = cellsRef.current.filter(
        (c) => c !== null
      ) as HTMLDivElement[];
      const shuffled = gsap.utils.shuffle([...validCells]);

      // Délai très léger pour laisser React peindre le nouveau composant
      setTimeout(() => {
        gsap.to(shuffled, {
          keyframes: [
            { opacity: "random(0.2, 0.6)", duration: 0.05, ease: "none" },
            { opacity: 0, duration: 0.05, ease: "power1.inOut" },
          ],
          stagger: {
            each: 0.008,
          },
          onComplete: () => {
            gsap.set(wrapperRef.current, { pointerEvents: "none" });
            setIsAnimating(false);
            setTransitioning(false);
            setPendingRoute(null);
          },
        });
      }, 50);
    }
  }, [pathname]);

  return (
    <div
      className={styles.transitionWrapper}
      ref={wrapperRef}
      style={{ "--cols": cols } as React.CSSProperties}
    >
      {Array.from({ length: cellCount }).map((_, i) => (
        <div
          key={i}
          className={styles.cell}
          ref={(el) => {
            cellsRef.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
