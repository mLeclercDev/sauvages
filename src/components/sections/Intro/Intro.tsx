"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RandomGridMask from "@/components/ui/RandomGridMask/RandomGridMask";
import styles from "./Intro.module.scss";
import Button from "@/components/ui/Button/Button";

import { getStrapiMedia } from "@/utils/strapi";

interface IntroProps {
  data?: any;
}

const Intro: React.FC<IntroProps> = ({ data }) => {
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;

    const words = headlineRef.current.querySelectorAll(`.${styles.word}`);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headlineRef.current,
        start: "top 100%",
        end: "bottom 50%",
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

    return () => {
      tl.kill();
    };
  }, [data]);

  // Reconstruction du texte et du SVG depuis le format Blocks de Strapi
  const fullContent = data?.Texte?.map((p: any) => p.children?.map((c: any) => c.text).join("")).join("") || "";
  
  // On sépare le texte là où se trouve le SVG
  const svgMatch = fullContent.match(/<svg[\s\S]*?<\/svg>/);
  const svgString = svgMatch ? svgMatch[0] : "";
  const parts = svgString ? fullContent.split(svgString) : [fullContent, ""];
  const textBefore = parts[0] || "";
  const textAfter = parts[1] || "";

  const renderWords = (text: string) => {
    return text.split(" ").filter(w => w.trim() !== "").map((word, index) => (
      <span key={index} className={styles.word}>
        {word}{" "}
      </span>
    ));
  };

  return (
    <section className={`${styles.intro} pt-top pb-bottom`}>
      <div className="container">
        <div className={styles.contentCluster}>
          <span className="label">{data?.Label || "L'AGENCE"}</span>
          <div className={styles.headline} ref={headlineRef}>
            {renderWords(textBefore)}
            {svgString && (
              <span 
                className={styles.word} 
                dangerouslySetInnerHTML={{ __html: svgString }} 
              />
            )}
            {renderWords(textAfter)}
          </div>
        </div>

        <Button
          label={data?.Bouton?.Texte || "découvrir l'agence"}
          href={data?.Bouton?.Url || "/agence"}
          target={data?.Bouton?.Blank ? "_blank" : undefined}
          variant="outline"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="16"
              viewBox="0 0 18 16"
              fill="none"
            >
              <path
                d="M17.0397 0.75V7.356C17.0397 8.10914 16.4466 8.71964 15.7102 8.71964C12.8697 8.71964 6.05885 8.71964 1.03967 8.71964M1.03967 8.71964C3.16413 6.50673 4.35522 5.26596 6.47967 3.05303M1.03967 8.71964C3.16413 10.9327 6.47967 14.3864 6.47967 14.3864"
                stroke="#060606"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          }
        />

        <div className={styles.imageWrapper}>
          <RandomGridMask
            src={getStrapiMedia(data?.Image, undefined) || "/images/intro-homepage.avif"}
            alt="Sauvages Creative Agency"
            cols={14}
            triggerStart="top 100%"
            triggerEnd="bottom 60%"
            scrub={1.5}
          />
        </div>
      </div>
    </section>
  );
};

export default Intro;
