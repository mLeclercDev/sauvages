"use client";

import React, { useMemo, useState } from "react";
import BlogFilters from "./BlogFilters";
import BlogListing from "./BlogListing";
import styles from "./BlogPageContent.module.scss";

interface BlogPageContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  articles: any[];
}

const BlogPageContent: React.FC<BlogPageContentProps> = ({ articles }) => {
  const [activeType, setActiveType] = useState<string>("all");

  const types = useMemo(() => {
    const countMap = new Map<string, number>();
    articles.forEach((article) => {
      const attrs = article.attributes || article;
      const type = attrs.type;
      if (type) countMap.set(type, (countMap.get(type) || 0) + 1);
    });
    return Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (activeType === "all") return articles;
    return articles.filter((article) => {
      const attrs = article.attributes || article;
      return attrs.type === activeType;
    });
  }, [articles, activeType]);

  return (
    <>
      <BlogFilters
        types={types}
        totalCount={articles.length}
        activeType={activeType}
        onTypeChange={setActiveType}
      />

      <section className={styles.blogList}>
        <div className="container">
          <BlogListing articles={filteredArticles} />
        </div>
      </section>
    </>
  );
};

export default BlogPageContent;
