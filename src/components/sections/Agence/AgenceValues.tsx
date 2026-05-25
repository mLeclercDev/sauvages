"use client";

import React from "react";
import Image from "next/image";
import styles from "./AgenceValues.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface AgenceValuesProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  data?: any;
}

const AgenceValues: React.FC<AgenceValuesProps> = ({
  pt = "lg",
  pb = "lg",
  data,
}) => {
  const TitleTag = (data?.Titre?.HN || "h2") as keyof React.JSX.IntrinsicElements;

  return (
    <section className={`${styles.agenceValues} pt-${pt} pb-${pb}`}>
      <div className="container">
        <TitleTag className={styles.title}>{data?.Titre?.Texte || "L'agence"}</TitleTag>
        <div className={styles.grid}>
          <div className={styles.content}>
            <div className={styles.list}>
              {data?.Item?.map((item: any, index: number) => (
                <div key={item.id || index} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemIndex}>{index + 1}.</span>
                    <h3 className={styles.itemTitle}>{item.Titre}</h3>
                  </div>
                  <div className={styles.itemDescription}>
                    {item.Description?.map((p: any, pIndex: number) => (
                      <p key={pIndex}>
                        {p.children?.map((c: any) => c.text).join("")}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.imageWrapper}>
            <Image
              src={getStrapiMedia(data?.Image, undefined) || "/images/agence-values.png"}
              alt={data?.Image?.alternativeText || "L'agence Sauvages"}
              fill
              className="fit-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgenceValues;
