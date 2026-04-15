"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AgenceHistory.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface AgenceHistoryProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  data?: any;
}

const AgenceHistory: React.FC<AgenceHistoryProps> = ({ 
  pt = "lg", 
  pb = "lg",
  data
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const TitleTag = (data?.Titre?.HN || "h2") as keyof JSX.IntrinsicElements;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!sectionRef.current) return;

    const floatingImages = sectionRef.current.querySelectorAll(
      `.${styles.floatingImage}`
    );

    const speeds = [-30, -20, -60, -80];

    floatingImages.forEach((img, index) => {
      gsap.to(img, {
        y: speeds[index % speeds.length],
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [data]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.agenceHistory} pt-${pt} pb-${pb}`}
    >
      <div className="container">
        <div className={styles.containerHistory}>
          <div className={styles.floatingImages}>
            {data?.Image?.map((img: any, index: number) => (
              <div key={img.id || index} className={styles.floatingImage}>
                <Image
                  src={getStrapiMedia(img, undefined, "local") || "/images/agence-history.png"}
                  alt={img.alternativeText || "Souvenir agence"}
                  width={250 - (index * 30)}
                  height={250 - (index * 30)}
                  unoptimized={true}
                  className="fit-cover"
                />
              </div>
            ))}
          </div>
          <div className={styles.content}>
            <p className={`${styles.label} label`}>{data?.Label || "Notre Histoire"}</p>
            <TitleTag className={`${styles.title} h3`}>
              {data?.Titre?.Texte || "On est là depuis 20 ans pour faire du bon travail."}
            </TitleTag>

            <div className={styles.historyContent}>
              {data?.Description?.map((p: any, idx: number) => (
                <p key={idx}>{p.children?.map((c: any) => c.text).join("")}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.recruitment}>
        <div className={styles.arrowIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="33"
            height="31"
            viewBox="0 0 33 31"
            fill="none"
          >
            <path
              d="M18.3264 1.5H28.6698C30.0045 1.5 31.0864 2.59895 31.0864 3.95455V15.8453C31.0864 17.201 30.0115 18.2999 28.6768 18.2999C23.5283 18.2999 11.1837 18.2999 2.08643 18.2999M2.08643 18.2999C5.937 14.3167 8.09585 12.0833 11.9464 8.1M2.08643 18.2999C5.937 22.2834 11.9464 28.5 11.9464 28.5"
              stroke="black"
              strokeWidth="3"
              strokeLinecap="square"
            />
          </svg>
        </div>
        <div className={`${styles.recruitmentHeading} h3`}>
          <span>
            {data?.Description2?.map((p: any) => p.children?.map((c: any) => c.text).join("")).join("")}
            {" "}
            <Link href="/candidature-spontanee" className={styles.link}>
              <span
                className={styles.linkText}
                data-text="formulaire de candidature spontanée"
              >
                <span className={styles.textInner}>
                  formulaire de candidature spontanée
                </span>
              </span>
              <span className={styles.iconWrapper}>
                <svg
                  className={styles.pencilIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  width="37"
                  height="41"
                  viewBox="0 0 37 41"
                  fill="none"
                >
                  <path
                    d="M20.1089 5.89324L29.2404 14.9271M2.23301 30.2258L3.25384 23.1906C3.30876 22.731 3.52327 22.3047 3.86054 21.9849L23.8733 2.13428C24.1306 1.87406 24.4513 1.68419 24.8042 1.58307C25.1572 1.48194 25.5306 1.47299 25.8881 1.55708C27.7345 2.04332 29.4133 3.0173 30.7458 4.37527C32.1238 5.69413 33.1144 7.35983 33.6116 9.19414C33.6883 9.5492 33.6751 9.91758 33.5732 10.2663C33.4713 10.6151 33.2838 10.9334 33.0277 11.1928L13.0169 31.0434C12.6719 31.3595 12.2417 31.5693 11.7787 31.6473L4.66188 32.6579C4.33037 32.7023 3.993 32.6698 3.6763 32.5629C3.35961 32.456 3.07224 32.2777 2.83681 32.042C2.60137 31.8062 2.4243 31.5195 2.31953 31.2044C2.21476 30.8892 2.18514 30.5543 2.23301 30.2258Z"
                    stroke="black"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
};

export default AgenceHistory;
