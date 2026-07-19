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
  heroImage,
  intro,
  contentHtml = "",
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!heroRef.current) return;

    const img = heroRef.current.querySelector("img");
    if (!img) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { y: "-10%" },
        {
          y: "10%",
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.blogArticle}>
      <div className="container">
        <div className={styles.heroWrapper}>
          <div className={styles.heroImage} ref={heroRef}>
            <Image
              src={heroImage}
              alt={title}
              fill
              className="fit-cover"
              priority
              unoptimized={true}
            />
          </div>
        </div>

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
