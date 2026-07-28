"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./BlogArticle.module.scss";

interface BlogArticleProps {
  title: string;
  category?: string;
  date: string;
  readTime?: string;
  heroImage: string;
  intro?: string;
  contentHtml?: string;
}

const BlogArticle: React.FC<BlogArticleProps> = ({
  title,
  category = "BLOG",
  date,
  readTime,
  intro,
  contentHtml = "",
}) => {
  return (
    <section className={styles.blogArticle}>
      <div className="container">
        <div className={styles.contentGrid}>
          <div className={styles.metaColumn}>
            <span className="label">{category}</span>
            <h1 className={`${styles.title} h3`}>{title}</h1>
            <div className={styles.metaInfo}>
              <time className={styles.date}>{date}</time>
              {readTime && (
                <span className={styles.readTime}>[{readTime}]</span>
              )}
            </div>
          </div>

          <div className={styles.bodyColumn}>
            {intro && (
              <div
                className={styles.intro}
                dangerouslySetInnerHTML={{ __html: intro }}
              />
            )}

            {contentHtml && (
              <div
                className={styles.richText}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogArticle;
