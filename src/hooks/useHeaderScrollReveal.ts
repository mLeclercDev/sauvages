"use client";

import { RefObject, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Marge de scroll avant d'autoriser le masquage sur une page sans hero animé */
const DEFAULT_THRESHOLD = 120;
/** Décalage vertical de départ des groupes lors de la réapparition */
const GROUP_OFFSET = -14;
/**
 * Distance à parcourir dans une même direction avant de basculer.
 * Évite que le header réagisse aux micro-variations de direction du smooth
 * scroll (le lerp de Lenis en produit beaucoup, surtout au trackpad).
 */
const DIRECTION_DELTA = 110;

interface Options {
  /** Passe à false pour figer le header visible (menu mobile ouvert) */
  enabled?: boolean;
  /** Change de valeur pour réarmer le hook (typiquement le pathname) */
  resetKey?: string;
}

/**
 * Masque le header au scroll descendant et le révèle au scroll montant.
 *
 * Le bloc se translate hors écran, puis réapparaît avec un stagger des groupes
 * internes (logo / nav / CTA) — la nav étant flottante et sans fond, c'est ce
 * décalage qui rend la réapparition lisible.
 *
 * Reste verrouillé visible tant que le scroll n'a pas dépassé la zone du hero
 * (`[data-hero]`), car Hero.tsx y pilote la position du logo du header.
 */
export function useHeaderScrollReveal(
  headerRef: RefObject<HTMLElement | null>,
  groupRefs: RefObject<(HTMLElement | null)[]>,
  { enabled = true, resetKey }: Options = {}
) {
  const isHiddenRef = useRef(false);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let threshold = DEFAULT_THRESHOLD;

    const computeThreshold = () => {
      const hero = document.querySelector("[data-hero]");
      threshold = hero
        ? Math.max(
            DEFAULT_THRESHOLD,
            hero.getBoundingClientRect().height - window.innerHeight
          )
        : DEFAULT_THRESHOLD;
    };

    computeThreshold();

    const getGroups = () =>
      (groupRefs.current || []).filter(Boolean) as HTMLElement[];

    const hide = () => {
      if (isHiddenRef.current) return;
      isHiddenRef.current = true;

      // Pas d'opacity sur le header : en mix-blend-mode difference, un fond noir
      // semi-transparent donne un blend inconsistant selon le fond traversé.
      gsap.to(header, {
        yPercent: -100,
        duration: 0.6,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => {
          // Réarme les groupes pour la prochaine réapparition
          if (isHiddenRef.current) {
            gsap.set(getGroups(), { y: GROUP_OFFSET, opacity: 0 });
          }
        },
      });
    };

    const show = () => {
      if (!isHiddenRef.current) return;
      isHiddenRef.current = false;

      const tl = gsap.timeline();

      // power3.out plutôt qu'expo.out : même dynamique au départ, mais une
      // décélération bien plus longue — c'est ce qui donne le glissé.
      tl.to(header, {
        yPercent: 0,
        duration: 0.95,
        ease: "power3.out",
        overwrite: true,
      }).to(
        getGroups(),
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          overwrite: true,
        },
        "-=0.72"
      );
    };

    // Point d'ancrage depuis lequel on mesure la distance parcourue dans la
    // direction courante ; réinitialisé à chaque inversion.
    let anchorY = 0;
    let lastDirection = 0;

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        // Preloader en cours : il anime déjà l'opacité de ces mêmes éléments
        if (document.documentElement.classList.contains("is-first-visit")) return;

        const y = self.scroll();

        if (!enabledRef.current) {
          show();
          anchorY = y;
          return;
        }

        // Zone haute (ou hero) : header verrouillé visible, sans consommer de delta
        if (y <= threshold) {
          show();
          anchorY = y;
          lastDirection = 0;
          return;
        }

        if (self.direction !== lastDirection) {
          lastDirection = self.direction;
          anchorY = y;
          return;
        }

        // Il faut un mouvement franc et continu pour basculer
        if (Math.abs(y - anchorY) < DIRECTION_DELTA) return;

        if (self.direction === 1) hide();
        else show();

        anchorY = y;
      },
    });

    // Le header masqué reste atteignable au clavier — le révéler au focus
    const handleFocusIn = () => show();
    header.addEventListener("focusin", handleFocusIn);

    const handleResize = () => computeThreshold();
    window.addEventListener("resize", handleResize);

    // SmoothScroll déclenche un refresh après chaque navigation : c'est le
    // moment fiable pour remesurer, une fois le DOM de la page en place.
    ScrollTrigger.addEventListener("refresh", computeThreshold);

    return () => {
      st.kill();
      header.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.removeEventListener("refresh", computeThreshold);
      isHiddenRef.current = false;
    };
  }, [headerRef, groupRefs, resetKey]);

  // Menu ouvert (ou toute désactivation) : on rend la main immédiatement
  useEffect(() => {
    if (enabled || !headerRef.current) return;

    isHiddenRef.current = false;
    gsap.set(headerRef.current, { yPercent: 0 });
    gsap.set((groupRefs.current || []).filter(Boolean) as HTMLElement[], {
      y: 0,
      opacity: 1,
    });
  }, [enabled, headerRef, groupRefs]);
}
