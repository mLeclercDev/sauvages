"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ExpertiseHeroSingle.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface ExpertiseHeroSingleProps {
  data?: any;
}

const ExpertiseHeroSingle: React.FC<ExpertiseHeroSingleProps> = ({ data }) => {
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const contexts: gsap.Context[] = [];

    if (descriptionRef.current) {
      const ctx = gsap.context(() => {
        const words = descriptionRef.current?.querySelectorAll(`.${styles.word}`);
        if (!words || words.length === 0) return;

        const state = { count: 0 };

        gsap.to(state, {
          count: words.length,
          ease: "none",
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 85%",
            end: "bottom 40%",
            scrub: true,
          },
          onUpdate: () => {
            const activeCount = Math.ceil(state.count);
            words.forEach((word, index) => {
              word.classList.toggle(styles.active, index < activeCount);
            });
          },
        });
      }, descriptionRef);
      contexts.push(ctx);
    }

    if (imageRef.current) {
      const ctx = gsap.context(() => {
        const image = imageRef.current?.querySelector("img");
        if (!image) return;

        gsap.to(image, {
          y: "20%",
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }, imageRef);
      contexts.push(ctx);
    }

    return () => {
      contexts.forEach((ctx) => ctx.revert());
    };
  }, [data]);

  const renderWords = (text: string) =>
    text
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word, index) => (
        <span key={`${word}-${index}`} className={styles.word}>
          {word}{" "}
        </span>
      ));

  const imageUrl = getStrapiMedia(data?.Image, undefined);

  return (
    <section className={styles.ExpertiseHeroSingle}>
      <div className="container">
        <h1 className={styles.title}>{data?.Titre || "CONSEIL"}</h1>

        <p className={styles.description} ref={descriptionRef}>
          {renderWords(
            data?.Description ||
              "Une vision strategique pour une prise de parole jamais en retard sur son temps."
          )}
        </p>

        <div className={styles.imageWrapper} ref={imageRef}>
          <Image
            src={imageUrl || "/images/agence-hero.png"}
            alt={data?.Image?.alternativeText || "Expertise hero"}
            fill
            className="fit-cover"
            priority
            unoptimized={true}
          />
        </div>
      </div>
    </section>
  );
};

export default ExpertiseHeroSingle;
