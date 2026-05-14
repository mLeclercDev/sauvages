import React from "react";
import { fetchAPI } from "@/utils/strapi";

export const revalidate = 60;

import BlogHero from "@/components/sections/Blog/BlogHero";
import BlogListing from "@/components/sections/Blog/BlogListing";
import styles from "./page.module.scss";

export const metadata = {
  title: "Blog | Sauvages",
  description:
    "L’espace où nous partageons des idées, des explorations au-delà du design, de la technologie et du business.",
};

export default async function BlogPage() {
  let articles = [];
  let blogInfo: any = null;

  try {
    // 1. Récupération des articles avec le bon populate (Image avec majuscule)
    const articlesData = await fetchAPI("/articles", {
      populate: {
        Image: {
          populate: "*",
        },
      },
      sort: ["publishedAt:desc"],
      pagination: {
        limit: 100,
      },
    }, {});
    
    // Normalisation des articles pour le composant BlogListing
    articles = (articlesData?.data || []).map((article: any) => {
      const attrs = article.attributes || article;
      return {
        ...article,
        attributes: {
          ...attrs,
          title: attrs.Titre || attrs.title, // Supporte les deux
          image: attrs.Image || attrs.image, // Supporte les deux
          slug: attrs.slug || article.documentId || article.id.toString(),
        }
      };
    });

    // 2. Récupération des infos générales du blog
    const blogResponse = await fetchAPI("/blog", { populate: "*" }, {});
    blogInfo = blogResponse?.data?.attributes || blogResponse?.data || null;

  } catch (error) {
    console.error("Failed to fetch blog data:", error);
  }

  const title = blogInfo?.Titre || "BLOG";
  const description = blogInfo?.Description?.map((p: any) => 
    p.children?.map((c: any) => c.text).join("")
  ).join(" ") || "";

  return (
    <main>
      <BlogHero title={title} description={description} />

      <section className={styles.blogList}>
        <div className="container">
          <BlogListing articles={articles} />
        </div>
      </section>
    </main>
  );
}
