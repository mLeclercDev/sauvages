"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AgenceCta.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface AgenceCtaProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  data?: any;
}

const pencilFallback = (
  <svg
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
);

const AgenceCta: React.FC<AgenceCtaProps> = ({
  pt = "lg",
  pb = "xl",
  data,
}) => {
  const sectionRef = useRef<HTMLElement>(null);

  const texte =
    data?.Texte?.map((p: any) =>
      p.children?.map((c: any) => c.text).join("")
    ).join(" ") || "";

  const bouton = data?.Bouton;
  const href = bouton?.Url || bouton?.url || "/";
  const isBlank = bouton?.Blank;
  const linkText = bouton?.Texte || "formulaire de candidature spontanée";
  const iconUrl = getStrapiMedia(bouton?.Icone, undefined);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const revert = () =>
      gsap.to(document.body, {
        backgroundColor: "#f6f6f6",
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(document.body, { clearProps: "backgroundColor" });
        },
      });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () =>
          gsap.to(document.body, {
            backgroundColor: "#efff9b",
            duration: 0.6,
            ease: "power2.out",
          }),
        onLeave: revert,
        onEnterBack: () =>
          gsap.to(document.body, {
            backgroundColor: "#efff9b",
            duration: 0.6,
            ease: "power2.out",
          }),
        onLeaveBack: revert,
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      gsap.killTweensOf(document.body);
      gsap.set(document.body, { clearProps: "backgroundColor" });
    };
  }, []);

  if (!data || (!texte && !bouton)) return null;

  return (
    <section
      ref={sectionRef}
      className={`${styles.agenceCta} pt-${pt} pb-${pb}`}
    >
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

      <div className={`${styles.heading} h3`}>
        <span>
          {texte}{" "}
          <Link
            href={href}
            target={isBlank ? "_blank" : undefined}
            className={styles.link}
          >
            <span className={styles.linkText} data-text={linkText}>
              <span className={styles.textInner}>{linkText}</span>
            </span>
            <span className={styles.iconWrapper}>
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt=""
                  width={33}
                  height={36}
                  unoptimized
                  className={styles.pencilIcon}
                />
              ) : (
                <span className={styles.pencilIcon}>{pencilFallback}</span>
              )}
            </span>
          </Link>
        </span>
      </div>
    </section>
  );
};

export default AgenceCta;
