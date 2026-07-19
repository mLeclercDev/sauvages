"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./TextRevealSection.module.scss";

interface TextRevealSectionProps {
  text?: string;
  label?: string;
  data?: any;
  showLabel?: boolean;
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const TextRevealSection: React.FC<TextRevealSectionProps> = ({
  text: textProp,
  label: labelProp,
  data,
  showLabel = true,
  pt = "lg",
  pb = "lg"
}) => {
  const rawTexte = data ? data.Texte : textProp;
  const text = Array.isArray(rawTexte)
    ? rawTexte
        .flatMap((block: any) => block.children?.map((c: any) => c.text) || [])
        .filter(Boolean)
        .join(" ")
    : rawTexte || "";
  const label = data ? data.Label : labelProp;

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll(`.${styles.word}`);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 32%",
            end: "bottom+=100 50%",
            scrub: true,
            markers: false,
          },
        });

        const state = { count: 0 };

        tl.to(state, {
          count: words.length,
          ease: "none",
          duration: 1,
          onUpdate: () => {
            const activeCount = Math.ceil(state.count);
            words.forEach((word, i) => {
              const hasActive = word.classList.contains(styles.active);
              if (i < activeCount) {
                if (!hasActive) word.classList.add(styles.active);
              } else {
                if (hasActive) word.classList.remove(styles.active);
              }
            });
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  if (!text) return null;

  const renderWords = (text: string) => {
    return text.split(" ").map((word, index) => (
      <span key={index} className={styles.word}>
        {word}{" "}
      </span>
    ));
  };

  return (
    <section className={`${styles.textReveal} pt-${pt} pb-${pb}`} ref={containerRef}>
      <div className="container">
        {label && showLabel && <span className={styles.label}>{label}</span>}
        <h2 className={styles.title} ref={titleRef}>
          {renderWords(text)}
        </h2>
      </div>
    </section>
  );
};

export default TextRevealSection;
