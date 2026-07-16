"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ExpertiseDetailsSingle.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface ExpertiseDetailsSingleProps {
  data?: any;
}

const toPlainText = (blocks: any[] = []) =>
  blocks
    .map((block) =>
      Array.isArray(block?.children)
        ? block.children.map((child: any) => child?.text || "").join("")
        : ""
    )
    .filter(Boolean);

const getTitleText = (title: any) => {
  if (typeof title === "string") return title;
  if (typeof title === "object") return title?.Texte || title?.texte || "";
  return "";
};

const ExpertiseDetailsSingle: React.FC<ExpertiseDetailsSingleProps> = ({ data }) => {
  const statementRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const statementText = toPlainText(data?.Description || []).join(" ");
  const textParagraphs = toPlainText(data?.Texte || []);
  const listItems = toPlainText(data?.Listes || []);
  const imageUrl = getStrapiMedia(data?.Image, undefined);

  const headerTitleData = data?.Titre;
  const headerTitleText = getTitleText(headerTitleData);
  const rawTitleTag =
    (typeof headerTitleData === "object" &&
      (headerTitleData?.HN || headerTitleData?.hn)) ||
    "h2";
  const allowedTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
  const titleTag: (typeof allowedTags)[number] =
    typeof rawTitleTag === "string" && allowedTags.includes(rawTitleTag as any)
      ? (rawTitleTag as (typeof allowedTags)[number])
      : "h2";
  const secondaryTitle = getTitleText(data?.Titre2);

  const renderHeaderTitle = () => {
    if (!headerTitleText) return null;

    if (titleTag === "h1") return <h1 className={styles.sectionTitle}>{headerTitleText}</h1>;
    if (titleTag === "h3") return <h3 className={styles.sectionTitle}>{headerTitleText}</h3>;
    if (titleTag === "h4") return <h4 className={styles.sectionTitle}>{headerTitleText}</h4>;
    if (titleTag === "h5") return <h5 className={styles.sectionTitle}>{headerTitleText}</h5>;
    if (titleTag === "h6") return <h6 className={styles.sectionTitle}>{headerTitleText}</h6>;
    return <h2 className={styles.sectionTitle}>{headerTitleText}</h2>;
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const contexts: gsap.Context[] = [];

    if (statementRef.current) {
      const textContext = gsap.context(() => {
        const words = statementRef.current?.querySelectorAll(`.${styles.word}`);
        if (!words || words.length === 0) return;

        const state = { count: 0 };

        gsap.to(state, {
          count: words.length,
          ease: "none",
          scrollTrigger: {
            trigger: statementRef.current,
            start: "top 85%",
            end: "bottom 45%",
            scrub: true,
          },
          onUpdate: () => {
            const activeCount = Math.ceil(state.count);
            words.forEach((word, index) => {
              word.classList.toggle(styles.active, index < activeCount);
            });
          },
        });
      }, statementRef);
      contexts.push(textContext);
    }

    if (imageRef.current) {
      const imageContext = gsap.context(() => {
        const image = imageRef.current?.querySelector("img");
        if (!image) return;

        gsap.to(image, {
          y: "16%",
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }, imageRef);
      contexts.push(imageContext);
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

  return (
    <section className={`${styles.expertiseDetailsSingle} pb-bottom`}>
      <div className="container">
        {renderHeaderTitle()}

        {statementText && (
          <p className={styles.statement} ref={statementRef}>
            {renderWords(statementText)}
          </p>
        )}

        <div className={styles.grid}>
          {imageUrl && (
            <div className={styles.imageCol}>
              <div className={styles.imageWrapper} ref={imageRef}>
                <Image
                  src={imageUrl}
                  alt={data?.Image?.alternativeText || ""}
                  fill
                  className="fit-cover"
                  unoptimized={true}
                />
              </div>
            </div>
          )}

          <div className={styles.contentCol}>
            {secondaryTitle && <h3 className={`${styles.title} h3`}>{secondaryTitle}</h3>}

            <div className={styles.texts}>
              {textParagraphs.map((paragraph: string, index: number) => (
                <p key={`text-${index}`}>{paragraph}</p>
              ))}
            </div>

            {data?.Label && <h3 className={styles.label}>{data.Label}</h3>}

            {listItems.length > 0 && (
              <ul className={styles.list}>
                {listItems.map((item: string, index: number) => (
                  <li key={`item-${index}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseDetailsSingle;
