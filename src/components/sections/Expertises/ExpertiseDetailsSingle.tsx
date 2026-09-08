import React from "react";
import Image from "next/image";
import styles from "./ExpertiseDetailsSingle.module.scss";
import { getStrapiMedia } from "@/utils/strapi";
import { renderStrapiBlocks } from "@/utils/strapiRichText";

interface ExpertiseDetailsSingleProps {
  data?: any;
}

const ExpertiseDetailsSingle: React.FC<ExpertiseDetailsSingleProps> = ({ data }) => {
  if (!data) return null;

  const imageUrl = getStrapiMedia(data?.Image);

  return (
    <section className={`${styles.expertiseDetailsSingle} pt-top pb-bottom`}>
      <div className="container">
        <div className={styles.grid}>
          {imageUrl && (
            <div className={styles.imageCol}>
              <div className={styles.imageWrapper}>
                <Image
                  src={imageUrl}
                  alt={data?.Image?.alternativeText || ""}
                  fill
                  className="fit-cover"
                  quality={85}
                />
              </div>
            </div>
          )}
          <div className={styles.contentCol}>
            {data?.Intro && (
              <p className={styles.intro}>{data.Intro}</p>
            )}
            {Array.isArray(data?.Description) && data.Description.length > 0 && (
              <div className={styles.richtext}>
                {renderStrapiBlocks(data.Description)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseDetailsSingle;
