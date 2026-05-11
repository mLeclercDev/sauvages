"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./LogoSlider.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface LogoSliderClientProps {
  pt?: string;
  pb?: string;
  data?: any;
}

const LogoSliderClient: React.FC<LogoSliderClientProps> = ({ 
  pt = "lg", 
  pb = "lg",
  data
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Fallback logos as SVGs if none provided by Strapi
  const placeholderLogos = Array.from({ length: 10 }, (_, i) => ({
    id: `placeholder-${i}`,
    name: `Client ${i + 1}`,
    content: (
      <svg
        width="120"
        height="40"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="120" height="40" rx="4" fill="#f0f0f0" />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="#060606"
          fontSize="14"
          fontWeight="bold"
          fontFamily="sans-serif"
          style={{ textTransform: "uppercase" }}
        >
          LOGO {i + 1}
        </text>
      </svg>
    ),
  }));

  // Map Strapi logos if they exist
  const strapiLogos = data?.Logos?.map((logo: any, i: number) => ({
    id: logo.documentId || logo.id,
    name: logo.name,
    url: getStrapiMedia(logo, undefined),
  })) || [];

  const finalLogos = strapiLogos.length > 0 ? strapiLogos : placeholderLogos;
  
  // Duplicate for seamless loop
  const duplicatedLogos = [...finalLogos, ...finalLogos];

  useEffect(() => {
    if (!marqueeRef.current || !windowRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const marquee = marqueeRef.current!;

      // Continuous scroll loop
      gsap.to(marquee, {
        xPercent: -50,
        repeat: -1,
        duration: 30,
        ease: "none",
      });

      // Entry reveal animation with stagger
      const innerLogos = gsap.utils.toArray(`.${styles.logoInner}`, marquee);

      gsap.fromTo(
        innerLogos,
        { yPercent: 110 },
        {
          yPercent: 0,
          stagger: 0.1,
          duration: 1.15,
          ease: "expo.out",
          scrollTrigger: {
            trigger: marquee,
            start: "top 95%",
            once: true,
          },
        }
      );
    }, windowRef);

    return () => ctx.revert();
  }, [finalLogos]);

  const handleMouseEnter = () => {
    gsap.to(marqueeRef.current, { timeScale: 0.2, duration: 0.5 });
  };

  const handleMouseLeave = () => {
    gsap.to(marqueeRef.current, { timeScale: 1, duration: 0.5 });
  };

  return (
    <section
      ref={windowRef}
      className={`${styles.logoSlider} pt-${pt} pb-${pb}`}
    >
      <div className="container">
        <div className={styles.header}>
          <span className="label">{data?.Label || "NOS CLIENTS"}</span>
          <h2 className={styles.title}>{data?.Titre?.Texte || "Ils nous ont fait confiance"}</h2>
        </div>
      </div>

      <div className={styles.marqueeContainer}>
        <div
          ref={marqueeRef}
          className={styles.marquee}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {duplicatedLogos.map((logo, index) => (
            <div key={`${logo.id}-${index}`} className={styles.logoItem}>
              <div className={styles.logoInner}>
                {logo.url ? (
                  <Image 
                    src={logo.url} 
                    alt={logo.name || "Client logo"} 
                    width={150} 
                    height={60} 
                    className={styles.imageLogo}
                    unoptimized={true}
                  />
                ) : (
                  logo.content
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoSliderClient;
