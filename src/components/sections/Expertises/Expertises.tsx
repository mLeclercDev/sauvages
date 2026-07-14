"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Expertises.module.scss";
import Button from "@/components/ui/Button/Button";
import { getStrapiMedia } from "@/utils/strapi";

gsap.registerPlugin(ScrollTrigger);

interface ExpertisesProps {
  showHeader?: boolean;
  isScrollAnimated?: boolean;
  data?: any;
}

const arrowIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="16"
    viewBox="0 0 18 16"
    fill="none"
  >
    <path
      d="M17.0397 0.75V7.356C17.0397 8.10914 16.4466 8.71964 15.7102 8.71964C12.8697 8.71964 6.05885 8.71964 1.03967 8.71964M1.03967 8.71964C3.16413 6.50673 4.35522 5.26596 6.47967 3.05303M1.03967 8.71964C3.16413 10.9327 6.47967 14.3864 6.47967 14.3864"
      stroke="#060606"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
  </svg>
);

const Expertises: React.FC<ExpertisesProps> = ({
  showHeader = true,
  isScrollAnimated = true,
  data,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const getButtonHref = (button: any) => button?.URL || button?.Url || button?.url;
  const getButtonTarget = (button: any) => (button?.Blank ? "_blank" : undefined);

  const defaultExpertises = [
    {
      title: "Identité de marque",
      description: "Nous créons des univers visuels forts et cohérents qui racontent votre histoire et captivent votre audience.",
      subItems: ["Logotype & Charte graphique", "Positionnement de marque", "Naming & Signature"],
      hasButton: true,
    },
    {
      title: "Stratégie Digitale",
      description: "Nous concevons des expériences numériques performantes centrées sur l'utilisateur et vos objectifs business.",
      subItems: ["Site Web & E-commerce", "UI / UX Design", "SEO & Performance"],
      hasButton: true,
    },
    {
      title: "Content Marketing",
      description: "Nous produisons des contenus créatifs et engageants pour faire rayonner votre expertise sur tous vos canaux.",
      subItems: ["Social Media", "Production Vidéo & Photo", "Rédaction web"],
      hasButton: true,
    }
  ];

  // Mapping des données Strapi avec fallbacks
  const expertiseItems =
    data?.Item?.length > 0
      ? data.Item.map((item: any) => ({
          title: item.Name,
          image: item.Image || null,
          description:
            item.Description?.map((block: any) =>
              block.children?.map((c: any) => c.text).join("")
            ).join("\n") || "",
          subItems:
            item.Listes?.map((block: any) =>
              block.children?.map((c: any) => c.text).join("")
            ) || [],
          hasButton: item.PresenceBouton,
          button: item.Bouton,
        }))
      : defaultExpertises;

  useEffect(() => {
    if (!isScrollAnimated || expertiseItems.length < 2) return;

    const section = sectionRef.current;
    const list = listRef.current;
    const bodies = itemBodyRefs.current.filter((b) => b !== null);

    if (!section || !list || bodies.length < 2) return;

    // Set initial states: first item open, others collapsed
    gsap.set(bodies[0], { height: "auto", opacity: 1, y: 0 });
    for (let i = 1; i < bodies.length; i++) {
      gsap.set(bodies[i], { height: 0, opacity: 0, y: -30 });
    }

    const tl = gsap.timeline({ paused: true });

    // Transition dynamique selon le nombre d'éléments
    bodies.forEach((body, i) => {
      if (i < bodies.length - 1) {
        const nextBody = bodies[i + 1];
        const startTime = i * 2;

        tl.to(
          body,
          { height: 0, opacity: 0, y: 30, duration: 1, ease: "power1.inOut" },
          startTime + 0.5
        ).to(
          nextBody,
          {
            height: "auto",
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power1.inOut",
          },
          startTime + 0.7
        );
      }
    });

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: `(min-width: 768px)`,
        isMobile: `(max-width: 767px)`,
      },
      (context) => {
        const { isDesktop } = context.conditions as any;

        ScrollTrigger.create({
          trigger: list,
          markers: false,
          start: isDesktop ? "top 50px" : "top 100px",
          end: isDesktop
            ? `+=${window.innerHeight * bodies.length}`
            : `+=${window.innerHeight * (bodies.length - 1)}`,
          pin: true,
          pinSpacing: true,
          scrub: 2,
          onUpdate: (self) => {
            tl.progress(self.progress);
          },
        });
      }
    );

    return () => {
      mm.revert();
      tl.kill();
    };
  }, [isScrollAnimated, expertiseItems.length]);

  if (expertiseItems.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`${styles.expertises} pt-top pb-bottom`}
    >
      <div className="container">
        {showHeader && (
          <div className={styles.header}>
            <h2 className={styles.sectionTitle}>
              {data?.Titre?.Texte || data?.Titre || (
                <>
                  Nos
                  <br /> expertises
                </>
              )}
            </h2>

            <Button
              className={styles.buttonDesktop}
              label={data?.Bouton?.Texte || "en savoir plus"}
              variant="outline"
              icon={arrowIcon}
              href={getButtonHref(data?.Bouton)}
              target={getButtonTarget(data?.Bouton)}
            />
          </div>
        )}

        <div ref={listRef} className={styles.list}>
          {expertiseItems.map((item: any, index: number) => (
            <div
              key={index}
              id={item.title
                ?.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")}
              className={`${styles.item} ${
                !isScrollAnimated ? styles.isStatic : ""
              }`}
            >
              <div className={styles.itemHeader}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemIndex}>{index + 1}.</span>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                </div>
              </div>

              <div
                ref={(el) => {
                  itemBodyRefs.current[index] = el;
                }}
                className={styles.itemBody}
                style={!isScrollAnimated ? { height: "auto", opacity: 1 } : {}}
              >
                <div className={styles.itemBodyInner}>
                  {getStrapiMedia(item.image, "large") && (
                    <div className={styles.itemImage}>
                      <Image
                        src={getStrapiMedia(item.image, "large")!}
                        alt={item.title}
                        fill
                        class="fit-cover"
                        sizes="(max-width: 768px) 100vw, 240px"
                      />
                    </div>
                  )}
                  <div className={styles.itemContent}>
                    <div className={styles.description}>
                      <div className={styles.descriptionContent}>
                        {item.description
                          .split("\n")
                          .map((p: string, i: number) => (
                            <p key={i}>{p}</p>
                          ))}
                      </div>
                      {(!showHeader || item.hasButton) && (
                        <Button
                          label={
                            item.button?.Texte ||
                            data?.Bouton?.Texte ||
                            "en savoir plus"
                          }
                          variant="outline"
                          icon={arrowIcon}
                          href={
                            getButtonHref(item.button) ||
                            getButtonHref(data?.Bouton)
                          }
                          target={
                            getButtonTarget(item.button) ||
                            getButtonTarget(data?.Bouton)
                          }
                        />
                      )}
                    </div>
                    <ul className={styles.subItems}>
                      {item.subItems.map((sub: string, i: number) => (
                        <li key={i}>{sub}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isScrollAnimated && (
            <Button
              className={styles.buttonMobile}
              label={data?.Bouton?.Texte || "en savoir plus"}
              variant="outline"
              icon={arrowIcon}
              href={getButtonHref(data?.Bouton)}
              target={getButtonTarget(data?.Bouton)}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Expertises;
