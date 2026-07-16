"use client";

import React from "react";
import Image from "next/image";
import styles from "./ExpertiseHero.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface ExpertiseHeroProps {
  data?: any;
}

const ExpertiseHero: React.FC<ExpertiseHeroProps> = ({ data }) => {
  const expertises = data?.Item?.map((item: any, index: number) => ({
    number: (index + 1).toString(),
    title: item.Texte,
    anchor: item.Ancre || item.Texte?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  })) || [];

  const imageUrl = getStrapiMedia(data?.Image, undefined);

  return (
    <section className={styles.expertiseHero}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.imageColumn}>
            {imageUrl && (
              <div className={styles.imageWrapper}>
                <Image
                  src={imageUrl}
                  alt={data?.Image?.alternativeText || ""}
                  fill
                  className="fit-cover"
                  priority
                  unoptimized={true}
                />
              </div>
            )}
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.textWrapper}>
              <div>
                {data?.Titre && (
                  <h1 className={`${styles.title} h2`}>{data.Titre}</h1>
                )}
                {data?.Description && (
                  <p className={styles.description}>{data.Description}</p>
                )}
              </div>

              <ul className={styles.expertisesList}>
                {expertises.map((item: any) => (
                  <li key={item.number}>
                    <a href={`#${item.anchor}`} className={styles.listItem}>
                      <span className={styles.number}>{item.number}</span>{" "}
                      <span className={styles.text} data-text={item.title}>
                        <span className={styles.textInner}>{item.title}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseHero;
