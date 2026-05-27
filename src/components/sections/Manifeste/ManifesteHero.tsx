"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ManifesteHero.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface ManifesteHeroProps {
  data?: any;
}

const ManifesteHero: React.FC<ManifesteHeroProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (textRef.current) {
        const words = textRef.current.querySelectorAll(`.${styles.word}`);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: textRef.current,
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
        gsap.fromTo(
          imageRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [data]);

  const renderWords = (text: string) => {
    return text.split(" ").filter(w => w.trim() !== "").map((word, i) => (
      <span key={i} className={styles.word}>
        {word}{" "}
      </span>
    ));
  };

  const manifesteText = data?.Texte?.map((p: any) => p.children?.map((c: any) => c.text).join("")).join(" ") || "";

  return (
    <section className={`${styles.manifesteHero} pb-bottom`} ref={containerRef}>
      <div className="container">
        <div className={styles.header}>
          <span className="label">{data?.Label || "MANIFESTE"}</span>
          <div className={styles.statement}>
            <p ref={textRef}>{renderWords(manifesteText)}</p>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.valuesWrapper}>
            {data?.Item?.map((val: any, index: number) => (
              <div key={val.id || index} className={styles.valueItem}>
                <div className={styles.itemHeader}>
                  <div className={styles.number}>
                    <span>{index + 1}</span>
                  </div>
                  <div
                    className={styles.itemTitle}
                    dangerouslySetInnerHTML={{ __html: val.Titre }}
                  />
                </div>
                <div className={styles.itemContent}>
                  {val.Description?.map((p: any, pIdx: number) => (
                    <p key={pIdx}>{p.children?.map((c: any) => c.text).join("")}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.imageWrapper}>
            <div className={styles.imageInner}>
              <div ref={imageRef} className={styles.imageParallax}>
                <Image
                  src={getStrapiMedia(data?.Image, undefined) || "/images/agence-team.png"}
                  alt={data?.Image?.alternativeText || "L'équipe Sauvages"}
                  fill
                  priority
                  unoptimized={true}
                  className="fit-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManifesteHero;
