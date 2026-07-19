"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import styles from "./TexteImage.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface TexteImageProps {
  data?: any;
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  imagePosition?: "left" | "right";
}

export default function TexteImage({
  data,
  pt = "lg",
  pb = "lg",
  imagePosition = "left",
}: TexteImageProps) {
  const [activeOption, setActiveOption] = useState<number>(-1);
  const prevOptionRef = useRef<number>(-1);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);

  const options: any[] = data?.Options || [];

  useEffect(() => {
    bodyRefs.current.forEach((el) => {
      if (el) gsap.set(el, { height: 0 });
    });
  }, [options.length]);

  useEffect(() => {
    const prev = prevOptionRef.current;
    const next = activeOption;
    if (prev === next) return;

    if (prev >= 0 && bodyRefs.current[prev]) {
      gsap.to(bodyRefs.current[prev], {
        height: 0,
        duration: 0.38,
        ease: "power2.inOut",
        overwrite: true,
      });
    }

    if (next >= 0 && bodyRefs.current[next]) {
      gsap.to(bodyRefs.current[next], {
        height: "auto",
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });
    }

    prevOptionRef.current = next;
  }, [activeOption]);

  const toggleOption = (idx: number) => {
    setActiveOption((prev) => (prev === idx ? -1 : idx));
  };

  if (!data) return null;

  const titre = data.Titre;
  const texte: any[] = data.Texte || [];
  const imageUrl = getStrapiMedia(data.Image, undefined);

  const hasContent = titre?.Texte || texte.length > 0 || options.length > 0;
  if (!hasContent && !imageUrl) return null;

  const Tag = (titre?.HN || "h2") as keyof React.JSX.IntrinsicElements;

  const paragraphs = texte
    .map((block: any) => block.children?.map((c: any) => c.text).join(""))
    .filter(Boolean);

  return (
    <section
      className={`${styles.texteImage} ${imagePosition === "right" ? styles.imageRight : ""} pt-${pt} pb-${pb}`}
    >
      <div className="container">
        <div className={styles.grid}>
          {imageUrl && (
            <div className={styles.imageWrapper}>
              <Image
                src={imageUrl}
                alt={data.Image?.alternativeText || titre?.Texte || ""}
                fill
                className="fit-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
                unoptimized={true}
              />
            </div>
          )}

          {hasContent && (
            <div className={styles.content}>
              {titre?.Texte && (
                <Tag className={styles.title}>{titre.Texte}</Tag>
              )}
              {paragraphs.length > 0 && (
                <div className={styles.body}>
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {options.length > 0 && (
                <div className={styles.options}>
                  {options.map((option: any, idx: number) => {
                    const isOpen = activeOption === idx;
                    const descParagraphs = (option.Description || [])
                      .map((block: any) =>
                        block.children?.map((c: any) => c.text).join("")
                      )
                      .filter(Boolean);
                    return (
                      <div
                        key={option.id || idx}
                        className={`${styles.accordionItem} ${isOpen ? styles.open : ""}`}
                      >
                        <button
                          className={styles.accordionHeader}
                          onClick={() => toggleOption(idx)}
                        >
                          <span className={styles.accordionIcon}>
                            {isOpen ? "—" : "+"}
                          </span>
                          {option.Titre}
                        </button>
                        <div
                          className={styles.accordionBody}
                          ref={(el) => {
                            bodyRefs.current[idx] = el;
                          }}
                        >
                          {descParagraphs.length > 0 && (
                            <div className={styles.accordionContent}>
                              {descParagraphs.map((p: string, i: number) => (
                                <p key={i}>{p}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
