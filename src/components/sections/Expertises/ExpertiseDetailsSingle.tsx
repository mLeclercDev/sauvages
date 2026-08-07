import React from "react";
import Image from "next/image";
import styles from "./ExpertiseDetailsSingle.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface ExpertiseDetailsSingleProps {
  data?: any;
}

const renderInline = (c: any, i: number) => {
  if (c.type === "linebreak") return <br key={i} />;
  let node: React.ReactNode = c.text;
  const fmt = c.format || 0;
  if (fmt & 16 || c.code) node = <code key={i}>{node}</code>;
  if (fmt & 1 || c.bold) node = <strong key={i}>{node}</strong>;
  if (fmt & 2 || c.italic) node = <em key={i}>{node}</em>;
  if (fmt & 8 || c.underline) node = <u key={i}>{node}</u>;
  return <React.Fragment key={i}>{node}</React.Fragment>;
};

const renderRichText = (blocks: any[]): React.ReactNode => {
  if (!Array.isArray(blocks)) return null;
  return blocks.map((block: any, i: number) => {
    switch (block.type) {
      case "paragraph":
        return <p key={i}>{block.children?.map(renderInline)}</p>;
      case "heading": {
        const Tag = `h${block.level}` as keyof React.JSX.IntrinsicElements;
        return <Tag key={i}>{block.children?.map(renderInline)}</Tag>;
      }
      case "list": {
        const ListTag = block.format === "ordered" ? "ol" : "ul";
        return (
          <ListTag key={i}>
            {block.children?.map((item: any, j: number) => (
              <li key={j}>{item.children?.map(renderInline)}</li>
            ))}
          </ListTag>
        );
      }
      default:
        return null;
    }
  });
};

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
                {renderRichText(data.Description)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertiseDetailsSingle;
