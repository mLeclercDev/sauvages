"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AgenceTeam.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

gsap.registerPlugin(ScrollTrigger);

interface AgenceTeamProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  data?: any;
}

const renderDescription = (blocks?: any[]) => {
  return blocks?.map((block: any, index: number) => (
    <p key={index}>{block.children?.map((c: any) => c.text).join("")}</p>
  ));
};

const AgenceTeam: React.FC<AgenceTeamProps> = ({ pt = "lg", pb = "lg", data }) => {
  const TitleTag = (data?.Titre?.HN || "h2") as keyof React.JSX.IntrinsicElements;
  const items: any[] = data?.EquipePresentationItem || [];
  const imageItems = items.length > 0 ? items : [{ Image: null, Nom: undefined }];

  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const images = imageRefs.current.filter(Boolean) as HTMLDivElement[];
    const bodies = bodyRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!sectionRef.current || !listRef.current || images.length < 2 || bodies.length < 2) {
      return;
    }

    const itemEls = listRef.current.querySelectorAll<HTMLDivElement>(`.${styles.item}`);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        gsap.set(images[0], { scale: 1, zIndex: 1 });
        for (let i = 1; i < images.length; i++) {
          gsap.set(images[i], { scale: 0, zIndex: i + 1 });
        }

        gsap.set(bodies[0], { height: "auto", opacity: 1 });
        for (let i = 1; i < bodies.length; i++) {
          gsap.set(bodies[i], { height: 0, opacity: 0 });
        }

        const tl = gsap.timeline({ paused: true });

        for (let i = 0; i < bodies.length - 1; i++) {
          const startTime = i * 2;

          tl.to(bodies[i], { height: 0, opacity: 0, duration: 1, ease: "power1.inOut" }, startTime + 0.5)
            .to(bodies[i + 1], { height: "auto", opacity: 1, duration: 1, ease: "power1.inOut" }, startTime + 0.7)
            .to(images[i], { scale: 0, duration: 0.6, ease: "power2.inOut" }, startTime + 0.5)
            .to(images[i + 1], { scale: 1, duration: 0.6, ease: "expo.out" }, startTime + 0.5);
        }

        const st = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (bodies.length - 1)}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            tl.progress(self.progress);

            const activeIndex = Math.min(
              bodies.length - 1,
              Math.round(self.progress * (bodies.length - 1))
            );

            itemEls.forEach((el, idx) => {
              el.classList.toggle(styles.itemActive, idx === activeIndex);
            });
          },
        });

        return () => {
          tl.kill();
          st.kill();
        };
      });
    });

    return () => ctx.revert();
  }, [items.length]);

  return (
    <section ref={sectionRef} className={`${styles.agenceTeam} pt-${pt} pb-${pb}`}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.imageWrapper}>
            {imageItems.map((item: any, index: number) => (
              <div
                key={item.id || index}
                ref={(el) => {
                  imageRefs.current[index] = el;
                }}
                className={styles.imageItem}
              >
                <Image
                  src={getStrapiMedia(item?.Image, undefined) || "/images/agence-team.png"}
                  alt={item?.Image?.alternativeText || item?.Nom || "L'équipe Sauvages"}
                  fill
                  className="fit-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={true}
                />
              </div>
            ))}
          </div>

          <div className={styles.content}>
            <div className={styles.header}>
              <TitleTag className={styles.title}>{data?.Titre?.Texte || "L'équipe"}</TitleTag>
              <h3 className={styles.subtitle}>
                {data?.Catchline}
              </h3>
            </div>

            <div className={styles.list} ref={listRef}>
              {items.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  className={`${styles.item} ${index === 0 ? styles.itemActive : ""}`}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.itemIndex}>{index + 1}</span>
                    <h4 className={styles.itemTitle}>{item.Nom}</h4>
                  </div>
                  <div
                    ref={(el) => {
                      bodyRefs.current[index] = el;
                    }}
                    className={styles.itemBody}
                  >
                    <div className={styles.itemBodyInner}>
                      <div className={styles.itemDescription}>
                        {renderDescription(item.Description)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgenceTeam;
