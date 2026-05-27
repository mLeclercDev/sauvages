"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Contact.module.scss";
import { getStrapiMedia } from "@/utils/strapi";
import Button from "@/components/ui/Button/Button";
import { useContactPanel } from "@/context/ContactPanelContext";

interface ContactProps {
  data?: any;
}

const Contact: React.FC<ContactProps> = ({ data }) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const { openPanel } = useContactPanel();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (imageRef.current) {
      const ctx = gsap.context(() => {
        const image = imageRef.current?.querySelector("img");
        if (!image) return;

        gsap.fromTo(
          image,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }, imageRef);

      return () => ctx.revert();
    }
  }, []);

  const hero = data?.HeroContact || data || {};
  const imageUrl = getStrapiMedia(hero?.Image, undefined);
  const title = hero?.Titre || "CONTACT";
  const btn1 = hero?.TexteBouton1 || "RÉSERVER UN APPEL";
  const btn2 = hero?.TexteBouton2 || "COMMENT ON PEUT VOUS AIDER ?";

  const icon1Url = getStrapiMedia(hero?.IconBouton1, undefined);
  const icon1Node = icon1Url ? (
    <Image src={icon1Url} alt="" width={hero?.IconBouton1?.width ?? 18} height={hero?.IconBouton1?.height ?? 18} unoptimized />
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const icon2Url = getStrapiMedia(hero?.IconBouton2, undefined);
  const icon2Node = icon2Url ? (
    <Image src={icon2Url} alt="" width={hero?.IconBouton2?.width ?? 18} height={hero?.IconBouton2?.height ?? 18} unoptimized />
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <line x1="5" y1="19" x2="19" y2="5" />
      <polyline points="5 5 19 5 19 19" />
    </svg>
  );

  return (
    <section className={styles.contactSection}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.leftCol}>
            <h2 className={styles.title}>{title}</h2>
            
            <div className={styles.imageWrapper} ref={imageRef}>
              <Image
                src={imageUrl || "/images/intro-homepage.avif"} // Placeholder par défaut
                alt={hero?.Image?.alternativeText || "Contact"}
                fill
                className="fit-cover"
                unoptimized={true}
              />
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.buttonGroup}>
              <Button
                label={btn1}
                variant="outline"
                onClick={() => {
                  console.log("Open Calendly"); // À définir
                }}
                icon={icon1Node}
              />
              <Button
                label={btn2}
                variant="outline"
                onClick={() => {
                  openPanel("projet");
                }}
                icon={icon2Node}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
