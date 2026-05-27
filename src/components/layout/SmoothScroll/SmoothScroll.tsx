"use client";

import Lenis from "lenis";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Connect Lenis to ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Use GSAP ticker to drive Lenis (RAF loop)
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ResizeObserver to handle dynamic height changes (images, etc)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    // Smooth anchor scroll handler
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.hash &&
        anchor.origin === window.location.origin &&
        anchor.pathname === window.location.pathname
      ) {
        e.preventDefault();
        lenis.scrollTo(anchor.hash, {
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      resizeObserver.disconnect();
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    if (lenisRef.current) {
      // Reset scroll position to top on navigation
      lenisRef.current.scrollTo(0, { immediate: true });

      // Delay resize to allow Next.js to swap and paint the new DOM
      const timer = setTimeout(() => {
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return <>{children}</>;
}
