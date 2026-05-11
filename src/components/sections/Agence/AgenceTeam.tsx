"use client";

import React from "react";
import RandomGridMask from "@/components/ui/RandomGridMask/RandomGridMask";
import styles from "./AgenceTeam.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface AgenceTeamProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  data?: any;
}

const AgenceTeam: React.FC<AgenceTeamProps> = ({ pt = "lg", pb = "lg", data }) => {
  const TitleTag = (data?.Titre?.HN || "h2") as keyof React.JSX.IntrinsicElements;

  return (
    <section className={`${styles.agenceTeam} pt-${pt} pb-${pb}`}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.imageWrapper}>
            <RandomGridMask
              src={getStrapiMedia(data?.Image, undefined) || "/images/agence-team.png"}
              alt={data?.Image?.alternativeText || "L'équipe Sauvages"}
              cols={12}
              triggerStart="top 100%"
              triggerEnd="top 30%"
              scrub={1}
              unoptimized={true}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.header}>
              <TitleTag className={styles.title}>{data?.Titre?.Texte || "L'équipe"}</TitleTag>
              <h3 className={styles.subtitle}>
                {data?.Catchline}
              </h3>
            </div>

            <div className={styles.list}>
              {data?.EquipePresentationItem?.map((item: any, index: number) => (
                <div key={item.id || index} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemIndex}>{index + 1}</span>
                    <h4 className={styles.itemTitle}>{item.Nom}</h4>
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
        </div>
      </div>
    </section>
  );
};

export default AgenceTeam;
