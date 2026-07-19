"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./BlogArticle.module.scss";

interface ContentSection {
  id: number;
  title?: string;
  description: string;
  image?: string;
}

interface BlogArticleProps {
  title: string;
  category?: string;
  date: string;
  readTime?: string;
  heroImage: string;
  intro?: string;
  sections?: ContentSection[];
}

const BlogArticle: React.FC<BlogArticleProps> = ({
  title,
  category = "BLOG",
  date,
  readTime,
  heroImage,
  intro,
  sections = [],
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

            <div className={styles.content}>
              {sections.length > 0 ? (
                sections.map((section) => (
                  <div key={section.id} className={styles.sectionWrap}>
                    {section.title && (
                      <h3 className={styles.sectionTitle}>{section.title}</h3>
                    )}
                    {section.description && (
                      <div
                        className={styles.sectionDescription}
                        dangerouslySetInnerHTML={{
                          __html: section.description,
                        }}
                      />
                    )}
                    {section.image && (
                      <div className={styles.inlineImageWrapper}>
                        <Image
                          src={section.image}
                          alt={section.title || "Section image"}
                          width={1040}
                          height={500}
                          className=""
                          unoptimized={true}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>Aucun contenu disponible pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogArticle;
