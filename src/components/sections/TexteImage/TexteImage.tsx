import React from "react";
import Image from "next/image";
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
  if (!data) return null;

  const titre = data.Titre;
  const texte: any[] = data.Texte || [];
  const imageUrl = getStrapiMedia(data.Image, undefined);

  const hasContent = titre?.Texte || texte.length > 0;
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
