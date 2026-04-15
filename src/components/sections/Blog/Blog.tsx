import React from "react";
import { fetchAPI } from "@/utils/strapi";
import Link from "next/link";
import BlogListing from "./BlogListing";
import styles from "./Blog.module.scss";

interface BlogProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  headerData?: any;
}

const Blog: React.FC<BlogProps> = async ({ pt = "lg", pb = "lg", headerData: manualHeaderData }) => {
  let articles = [];
  let headerData = manualHeaderData;

  try {
    // 1. Récupération des articles
    const articlesData = await fetchAPI("/articles", {
      populate: {
        Image: {
          populate: "*",
        },
      },
      sort: ["publishedAt:desc"],
      pagination: {
        limit: 5,
      },
    }, {}, "local");
    
    // Normalisation identique à celle de la page Blog
    articles = (articlesData?.data || []).map((article: any) => {
      const attrs = article.attributes || article;
      return {
        ...article,
        attributes: {
          ...attrs,
          title: attrs.Titre || attrs.title,
          image: attrs.Image || attrs.image,
          slug: attrs.slug || article.documentId || article.id.toString(),
        }
      };
    });

    // 2. Récupération des infos de la section si non fournies
    if (!headerData) {
      const sectionResponse = await fetchAPI("/blog-section", { populate: "*" }, {}, "local");
      headerData = sectionResponse?.data?.attributes || sectionResponse?.data || null;
    }

  } catch (error) {
    console.error("Failed to fetch blog section data:", error);
  }

  if (articles.length === 0) return null;

  // Accès aux données avec gestion des fallbacks et du format Titre.Texte
  const sectionTitle = headerData?.Titre?.Texte || headerData?.title || "Vie d’agence";
  const sectionDesc = headerData?.Description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const linkText = headerData?.TexteDuLien || "Tout voir";
  const linkUrl = headerData?.URL || "/blog";

  return (
    <section className={`${styles.blog} pt-${pt} pb-${pb}`}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>{sectionTitle}</h2>
          <div className={styles.headerContent}>
            <p className={styles.description}>{sectionDesc}</p>
            <Link
              href={linkUrl}
              className={`${styles.link} ${styles.linkDesktop}`}
            >
              {linkText}
            </Link>
          </div>
        </div>

        <BlogListing articles={articles} />
        
        <Link
          href={linkUrl}
          className={`${styles.link} ${styles.linkResponsive}`}
        >
          {linkText}
        </Link>
      </div>
    </section>
  );
};

export default Blog;
