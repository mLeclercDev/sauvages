"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./AgenceHero.module.scss";

interface AgenceHeroProps {
  data?: any;
}

const AgenceHero: React.FC<AgenceHeroProps> = ({ data }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll(`.${styles.word}`);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 32%",
          end: "bottom+=100 50%",
          scrub: true,
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

    if (imageRef.current) {
      gsap.to(imageRef.current.querySelector("img"), {
        y: "20%",
        ease: "none",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [data]);

  // Extraction du texte depuis le format Blocks de Strapi
  const fullText = data?.Texte?.map((p: any) => p.children?.map((c: any) => c.text).join("")).join(" ") || "";

  const renderWords = (text: string) => {
    return text.split(" ").filter(w => w.trim() !== "").map((word, index) => (
      <span key={index} className={styles.word}>
        {word}{" "}
      </span>
    ));
  };

  return (
    <section className={styles.agenceHero}>
      <div className="container">
        <p className="label">{data?.Label || "L'AGENCE"}</p>
        <h1 className={styles.title} ref={titleRef}>
          {renderWords(fullText)}
        </h1>
        <div className={styles.imageWrapper} ref={imageRef}>
          <Image
            src={getStrapiMedia(data?.Image, undefined, "local") || "/images/agence-hero.png"}
            alt={data?.Image?.alternativeText || "L'agence Sauvages"}
            fill
            priority
            unoptimized={true}
            className="fit-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default AgenceHero;
