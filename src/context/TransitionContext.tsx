"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface TransitionContextProps {
  transitionTo: (href: string) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
}

const TransitionContext = createContext<TransitionContextProps>({
  transitionTo: () => {},
  isAnimating: false,
  setIsAnimating: () => {},
});

export const TransitionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(false);

  const transitionTo = (href: string) => {
    // Prevent animation if we are already there
    if (href === pathname || href === pathname + "/") return;
    
    // We start the animation, the PageTransition component will listen
    // BUT we need a robust way to trigger GSAP in PageTransition.
    // The easiest is to trigger a custom event or let PageTransition handle its own state.
    // Let's dispatch a custom event that PageTransition listens to.
    const event = new CustomEvent("start-page-transition", {
      detail: { href },
    });
    window.dispatchEvent(event);
  };

  return (
    <TransitionContext.Provider
      value={{ transitionTo, isAnimating, setIsAnimating }}
    >
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransitionPage = () => useContext(TransitionContext);
