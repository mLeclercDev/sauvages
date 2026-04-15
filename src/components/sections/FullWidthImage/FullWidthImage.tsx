"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./FullWidthImage.module.scss";

interface FullWidthImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

const FullWidthImage: React.FC<FullWidthImageProps> = ({ 
  src, 
  alt, 
  priority = false,
  pt = "lg",
  pb = "lg"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (containerRef.current && imageRef.current) {
      // Parallax effect: image moves 20% of its height over the full scroll of the section
      gsap.fromTo(
        imageRef.current,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section className={`${styles.fullWidthImage} pt-${pt} pb-${pb}`}>
      <div className="container">
        <div ref={containerRef} className={styles.imageWrapper}>
          <Image
            ref={imageRef}
            src={src}
            alt={alt}
            fill
            priority={priority}
            unoptimized={true}
            className="fit-cover"
            sizes="100vw"
          />
        </div>
      </div>
    </section>
  );
};

export default FullWidthImage;
