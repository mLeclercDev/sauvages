"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./AgenceHero.module.scss";

interface AgenceHeroProps {
  data?: any;
  identiteData?: any;
}

const AgenceHero: React.FC<AgenceHeroProps> = ({ data, identiteData }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

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
    });

    return () => ctx.revert();
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
        {data?.Label && <p className="label">{data.Label}</p>}
        <h1 className={styles.title} ref={titleRef}>
          {renderWords(fullText)}
        </h1>
        {identiteData?.Item?.length > 0 && (
          <div className={styles.identiteGrid}>
            {identiteData?.Texte?.length > 0 && (
              <div className={styles.identiteDefinition}>
                {identiteData.Texte.map((block: any, i: number) => (
                  <p key={i} className="label sm">
                    {block.children?.map((c: any) => c.text).join("")}
                  </p>
                ))}
              </div>
            )}
            {identiteData.Item.map((item: any, i: number) => (
              <div key={item.id || i} className={styles.identiteItem}>
                <p className="label sm">{item.Label}</p>
                <div className={styles.identiteContent}>
                  {item.Texte?.map((block: any, j: number) => {
                    const text = block.children?.map((c: any) => c.text).join("");
                    return text ? <p key={j}>{text}</p> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {getStrapiMedia(data?.Image, undefined) && (
          <div className={styles.imageWrapper} ref={imageRef}>
            <Image
              src={getStrapiMedia(data?.Image, undefined)!}
              alt={data?.Image?.alternativeText || ""}
              fill
              priority
              unoptimized={true}
              className="fit-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default AgenceHero;
