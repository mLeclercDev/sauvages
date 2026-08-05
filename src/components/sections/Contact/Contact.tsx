"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getCalApi } from "@calcom/embed-react";
import styles from "./Contact.module.scss";
import { getStrapiMedia } from "@/utils/strapi";
import Button from "@/components/ui/Button/Button";
import { useContactPanel } from "@/context/ContactPanelContext";
import { ContactData, HeroContact } from "@/services/contact";

interface ContactProps {
  data?: ContactData | null;
}

const Contact: React.FC<ContactProps> = ({ data }) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const { openPanel } = useContactPanel();

  const hero: HeroContact | undefined = data?.HeroContact;

  let calLink = "agence-sauvages/conversation-rapide";
  let calNamespace = "conversation-rapide";
  if (hero?.LienCalendrier) {
    try {
      calLink = new URL(hero.LienCalendrier).pathname.slice(1);
      calNamespace = calLink.split("/").pop() || calNamespace;
    } catch {}
  }

  useEffect(() => {
    (async () => {
      const cal = await getCalApi({
        namespace: calNamespace,
        embedJsUrl: "https://cal.eu/embed.js",
      });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

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

  const imageUrl = getStrapiMedia(hero?.Image, undefined);
  const title = hero?.Titre;
  const btn1 = hero?.TexteBouton1;
  const btn2 = hero?.TexteBouton2;

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
            <div className={styles.imageWrapper} ref={imageRef}>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={hero?.Image?.alternativeText || ""}
                  fill
                  className="fit-cover"
                  unoptimized={true}
                />
              )}
            </div>
          </div>

          <div className={styles.rightCol}>
            {title && <h1 className={`${styles.title}`}>{title}</h1>}
            {hero?.Description && hero.Description.length > 0 && (
              <div className={styles.description}>
                {hero.Description.map((block, i) => {
                  if (block.type !== "paragraph") return null;
                  const text = block.children.map((c) => c.text).join("");
                  return text ? <p key={i}>{text}</p> : null;
                })}
              </div>
            )}
            <div className={styles.buttonGroup}>
              {btn1 && (
                <Button
                  label={btn1}
                  variant="outline"
                  icon={icon1Node}
                  data-cal-namespace={calNamespace}
                  data-cal-link={calLink}
                  data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                />
              )}
              {btn2 && (
                <Button
                  label={btn2}
                  variant="outline"
                  onClick={() => {
                    openPanel("projet");
                  }}
                  icon={icon2Node}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
