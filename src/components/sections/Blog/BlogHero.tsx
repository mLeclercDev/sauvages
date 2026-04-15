"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./BlogHero.module.scss";

interface BlogHeroProps {
  title: string;
  description: string;
}

const BlogHero: React.FC<BlogHeroProps> = ({ title, description }) => {
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!descriptionRef.current) return;

    const words = descriptionRef.current.querySelectorAll(`.${styles.word}`);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: descriptionRef.current,
        start: "top 85%", // Start a bit earlier for hero
        end: "bottom 40%",
        scrub: true,
        markers: false,
      },
    });

    // Dummy object to track progress
    const state = { count: 0 };

    tl.to(state, {
      count: words.length,
      ease: "none",
      duration: 1,
      onUpdate: () => {
        const activeCount = Math.ceil(state.count);
        words.forEach((word, i) => {
          const hasActive = word.classList.contains(styles.active);
          if (i < activeCount) {
            if (!hasActive) word.classList.add(styles.active);
          } else {
            if (hasActive) word.classList.remove(styles.active);
          }
        });
      },
    });

    return () => {
      tl.kill();
    };
  }, []);

  const renderWords = (text: string) => {
    return text.split(" ").map((word, index) => (
      <span key={index} className={styles.word}>
        {word}{" "}
      </span>
    ));
  };

  return (
    <section className={styles.blogHero}>
      <div className="container">
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description} ref={descriptionRef}>
          {renderWords(description)}
        </p>
      </div>
    </section>
  );
};

export default BlogHero;
