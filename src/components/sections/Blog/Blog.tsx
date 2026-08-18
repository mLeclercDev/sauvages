import React from "react";
import { fetchAPI, getStrapiMedia } from "@/utils/strapi";
import BlogListing from "./BlogListing";
import Button from "@/components/ui/Button/Button";
import styles from "./Blog.module.scss";

interface BlogProps {
  data?: any;
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const Blog: React.FC<BlogProps> = async ({ data, pt = "lg", pb = "lg" }) => {
  if (!data) return null;

  let articles = [];

  try {
    const articlesData = await fetchAPI(
      "/articles",
      {
        populate: ["Image", "Type"],
        sort: ["updatedAt:desc"],
        pagination: { limit: 3 },
        status: "published",
      },
      {}
    );

    articles = (articlesData?.data || []).map((article: any) => {
      const attrs = article.attributes || article;
      return {
        ...article,
        attributes: {
          ...attrs,
          title: attrs.Titre || attrs.title,
          image: attrs.Image || attrs.image,
          slug: attrs.slug || article.documentId || article.id?.toString(),
          resume: attrs.Resume,
          type: attrs.Type?.Nom,
        },
      };
    });
  } catch (error) {
    console.error("Failed to fetch blog articles:", error);
  }

  const sectionTitle = data?.Titre?.Texte;
  const sectionDesc = data?.Description;
  const bouton = data?.Bouton ?? null;

  return (
    <section className={`${styles.blog} pt-${pt} pb-${pb}`}>
      <div className="container">
        {(sectionTitle || sectionDesc || bouton) && (
          <div className={styles.header}>
            {sectionTitle && <h2 className={styles.title}>{sectionTitle}</h2>}
            <div className={styles.headerContent}>
              {sectionDesc && (
                <p className={styles.description}>{sectionDesc}</p>
              )}
              {bouton && (
                <Button
                  label={bouton.Texte}
                  href={bouton.Url}
                  target={bouton.Blank ? "_blank" : undefined}
                  icon={getStrapiMedia(bouton.Icone) ? <img src={getStrapiMedia(bouton.Icone)!} alt="" /> : undefined}
                  className={styles.linkDesktop}
                />
              )}
            </div>
          </div>
        )}

        {articles.length > 0 && <BlogListing articles={articles} />}

        {bouton && articles.length > 0 && (
          <Button
            label={bouton.Texte}
            href={bouton.Url}
            target={bouton.Blank ? "_blank" : undefined}
            icon={getStrapiMedia(bouton.Icone) ? <img src={getStrapiMedia(bouton.Icone)!} alt="" /> : undefined}
            className={styles.linkResponsive}
          />
        )}
      </div>
    </section>
  );
};

export default Blog;
