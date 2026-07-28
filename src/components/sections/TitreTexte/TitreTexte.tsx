import React from "react";
import Image from "next/image";
import styles from "./TitreTexte.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface TitreTexteProps {
  data?: any;
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

export default function TitreTexte({ data, pt = "lg", pb = "lg" }: TitreTexteProps) {
  if (!data) return null;

  const titre = data.Titre;
  const texte: any[] = data.Texte || [];

  if (!titre?.Texte && texte.length === 0) return null;

  const Tag = (titre?.HN || "h2") as keyof React.JSX.IntrinsicElements;

  const paragraphs = texte
    .map((block: any) => block.children?.map((c: any) => c.text).join(""))
    .filter(Boolean);

  const image = data.Image || null;
  const imageUrl = getStrapiMedia(image);
  const hasImage = !!imageUrl;

  return (
    <section className={`${styles.titreTexte} pt-${pt} pb-${pb}`}>
      <div className="container">
        <div className={`${styles.inner} ${hasImage ? styles.innerWithImage : ""}`}>
          {titre?.Texte && (
            <Tag className={styles.title}>{titre.Texte}</Tag>
          )}
          {hasImage && (
            <div className={styles.imageWrapper}>
              <Image
                src={imageUrl}
                alt={image.alternativeText || ""}
                width={image.width || 800}
                height={image.height || 600}
                className={styles.image}
              />
            </div>
          )}
          {paragraphs.length > 0 && (
            <div className={styles.body}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
