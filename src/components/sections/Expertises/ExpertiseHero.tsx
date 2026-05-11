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
    anchor: item.Ancre || item.Texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  })) || [
    { number: "1", title: "Stratégie", anchor: "strategie" },
    { number: "2", title: "Création", anchor: "creation" },
    { number: "3", title: "Activation", anchor: "activation" },
  ];

  const imageUrl = getStrapiMedia(data?.Image, undefined);

  return (
    <section className={styles.expertiseHero}>
      <div className="container">
        <h1 className={styles.title}>{data?.Titre || "EXPERTISES"}</h1>

        <div className={styles.grid}>
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <Image
                src={imageUrl || "/images/agence-hero.png"}
                alt={data?.Image?.alternativeText || "Expertises Hero"}
                fill
                className="fit-cover"
                priority
                unoptimized={true}
              />
            </div>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.textWrapper}>
              <p className={styles.description}>
                {data?.Description || "créative, unie pour créer de l'émotion depuis 20 ans. De la stratégie à la création."}
              </p>

              <ul className={styles.expertisesList}>
                {expertises.map((item: any) => (
                  <li key={item.number}>
                    <a
                      href={`#${item.anchor}`}
                      className={styles.listItem}
                    >
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
