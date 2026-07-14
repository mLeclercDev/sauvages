"use client";

import React from "react";
import styles from "./AgenceIdentite.module.scss";

interface AgenceIdentiteProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  data?: any;
}

const renderTexte = (blocks?: any[], definition = false) => {
  return blocks?.map((block: any, index: number) => (
    <p key={index} className={definition ? "label sm" : undefined}>
      {block.children?.map((c: any) => c.text).join("")}
    </p>
  ));
};

const AgenceIdentite: React.FC<AgenceIdentiteProps> = ({
  pt = "lg",
  pb = "lg",
  data,
}) => {
  if (!data) return null;

  return (
    <section className={`${styles.agenceIdentite} pt-${pt} pb-${pb}`}>
      <div className="container">
        <div className={styles.grid}>
          <div className={`${styles.definition}`}>
            {renderTexte(data?.Texte, true)}
          </div>

          {data?.Item?.map((item: any, index: number) => (
            <div key={item.id || index} className={styles.item}>
              <p className={`${styles.label} label sm`}>{item.Label}</p>
              <div className={styles.itemContent}>
                {renderTexte(item.Texte)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgenceIdentite;
