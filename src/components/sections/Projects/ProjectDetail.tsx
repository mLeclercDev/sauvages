"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./ProjectDetail.module.scss";

interface ProjectDetailProps {
  project: any;
  otherProjects: any[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const leftContentRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  const accordionBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accordionHeaderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconOpenRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const iconClosedRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const expertisesBodyRef = useRef<HTMLDivElement>(null);
  const expertisesHeaderRef = useRef<HTMLDivElement>(null);
  const expertisesIconOpenRef = useRef<HTMLSpanElement>(null);
  const expertisesIconClosedRef = useRef<HTMLSpanElement>(null);

  const attrs = project.attributes || project;
  const sections = attrs.sections || [];

  const clientName =
    attrs.client?.data?.attributes?.name || attrs.client?.name || "Client";

  const rawExpertises = attrs.expertise?.data || attrs.expertise || [];
  const expertises = rawExpertises
    .map(
      (exp: any) =>
        exp.attributes?.titre || exp.attributes?.name || exp.titre || exp.name
    )
    .filter(Boolean);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!leftContentRef.current || !layoutRef.current) return;

    const bodies = accordionBodyRefs.current.filter((b) => b !== null) as HTMLDivElement[];
    const headers = accordionHeaderRefs.current.filter((h) => h !== null) as HTMLDivElement[];
    const iconsOpen = iconOpenRefs.current.filter((i) => i !== null) as HTMLSpanElement[];
    const iconsClosed = iconClosedRefs.current.filter((i) => i !== null) as HTMLSpanElement[];

    const hasExpertises = expertises.length > 0 && expertisesBodyRef.current;

    const allBodies = hasExpertises ? [...bodies, expertisesBodyRef.current as HTMLDivElement] : bodies;
    const allHeaders = hasExpertises ? [...headers, expertisesHeaderRef.current as HTMLDivElement] : headers;
    const allIconsOpen = hasExpertises ? [...iconsOpen, expertisesIconOpenRef.current as HTMLSpanElement] : iconsOpen;
    const allIconsClosed = hasExpertises ? [...iconsClosed, expertisesIconClosedRef.current as HTMLSpanElement] : iconsClosed;

    const mm = gsap.matchMedia();

    mm.add(
      { isDesktop: "(min-width: 1024px)", isMobile: "(max-width: 1023px)" },
      (context) => {
        const { isDesktop } = context.conditions as any;

        if (isDesktop && allBodies.length > 0) {
          // Item 0 : ouvert, icône +, pleine opacité
          gsap.set(allBodies[0], { height: "auto", opacity: 1 });
          if (allIconsOpen[0]) gsap.set(allIconsOpen[0], { opacity: 1 });
          if (allIconsClosed[0]) gsap.set(allIconsClosed[0], { opacity: 0 });

          // Autres items : fermés, icône —, opacité réduite
          allBodies.slice(1).forEach((_, idx) => {
            const i = idx + 1;
            gsap.set(allBodies[i], { height: 0, opacity: 0 });
            if (allHeaders[i]) gsap.set(allHeaders[i], { opacity: 0.4 });
            if (allIconsOpen[i]) gsap.set(allIconsOpen[i], { opacity: 0 });
            if (allIconsClosed[i]) gsap.set(allIconsClosed[i], { opacity: 1 });
          });

          // Pin colonne gauche
          ScrollTrigger.create({
            trigger: layoutRef.current,
            pin: leftContentRef.current,
            start: "top top+=100",
            end: "bottom bottom",
            pinSpacing: false,
            invalidateOnRefresh: true,
          });

          if (allBodies.length > 1) {
            const tl = gsap.timeline({ paused: true });

            allBodies.forEach((body, i) => {
              if (i < allBodies.length - 1) {
                const next = allBodies[i + 1];
                const startTime = i * 2;

                tl
                  // Corps : ferme i, ouvre i+1
                  .to(body, { height: 0, opacity: 0, duration: 1, ease: "power1.inOut" }, startTime + 0.5)
                  .to(next, { height: "auto", opacity: 1, duration: 1, ease: "power1.inOut" }, startTime + 0.7)
                  // Header i : réduit l'opacité, passe à —
                  .to(allHeaders[i], { opacity: 0.4, duration: 0.6, ease: "power1.inOut" }, startTime + 0.5)
                  .to(allIconsOpen[i], { opacity: 0, duration: 0.4, ease: "power1.inOut" }, startTime + 0.5)
                  .to(allIconsClosed[i], { opacity: 1, duration: 0.4, ease: "power1.inOut" }, startTime + 0.5)
                  // Header i+1 : restaure l'opacité, passe à +
                  .to(allHeaders[i + 1], { opacity: 1, duration: 0.6, ease: "power1.inOut" }, startTime + 0.7)
                  .to(allIconsOpen[i + 1], { opacity: 1, duration: 0.4, ease: "power1.inOut" }, startTime + 0.7)
                  .to(allIconsClosed[i + 1], { opacity: 0, duration: 0.4, ease: "power1.inOut" }, startTime + 0.7);
              }
            });

            ScrollTrigger.create({
              trigger: layoutRef.current,
              start: "top top+=100",
              end: "bottom bottom",
              scrub: 2,
              onUpdate: (self) => {
                tl.progress(self.progress);
              },
            });
          }
        } else {
          // Mobile : tout ouvert, icône + partout
          allBodies.forEach((body) => gsap.set(body, { height: "auto", opacity: 1 }));
          allIconsOpen.forEach((icon) => gsap.set(icon, { opacity: 1 }));
          allIconsClosed.forEach((icon) => gsap.set(icon, { opacity: 0 }));
        }
      }
    );

    const timer = setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      clearTimeout(timer);
      mm.revert();
    };
  }, [project, sections.length, expertises.length]);

  return (
    <div className={styles.projectDetail}>
      <div className="container">
        <div className={styles.layout} ref={layoutRef}>

          {/* ── Left Column ── */}
          <div className={styles.leftCol}>
            <div className={styles.leftContent} ref={leftContentRef}>

              <div className={`${styles.clientLabel} label`}>{clientName}</div>
              <h1 className={styles.title}>{attrs.title}</h1>
              {attrs.sector && (
                <div className={`${styles.sector} label`}>{attrs.sector}</div>
              )}

              {(sections.length > 0 || expertises.length > 0) && (
                <div className={styles.accordions}>

                  {sections.map((section: any, idx: number) => (
                    <div key={idx} className={styles.accordionItem}>
                      <div
                        className={styles.accordionHeader}
                        ref={(el) => { accordionHeaderRefs.current[idx] = el; }}
                      >
                        <span className={styles.accordionIcon}>
                          <span
                            className={styles.iconOpen}
                            ref={(el) => { iconOpenRefs.current[idx] = el; }}
                          >+</span>
                          <span
                            className={styles.iconClosed}
                            ref={(el) => { iconClosedRefs.current[idx] = el; }}
                          >—</span>
                        </span>
                        {section.title}
                      </div>
                      <div
                        className={styles.accordionBody}
                        ref={(el) => { accordionBodyRefs.current[idx] = el; }}
                      >
                        {section.description && (
                          <div
                            className={styles.accordionContent}
                            dangerouslySetInnerHTML={{ __html: section.description }}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {expertises.length > 0 && (
                    <div className={styles.accordionItem}>
                      <div className={styles.accordionHeader} ref={expertisesHeaderRef}>
                        <span className={styles.accordionIcon}>
                          <span className={styles.iconOpen} ref={expertisesIconOpenRef}>+</span>
                          <span className={styles.iconClosed} ref={expertisesIconClosedRef}>—</span>
                        </span>
                        Expertises
                      </div>
                      <div className={styles.accordionBody} ref={expertisesBodyRef}>
                        <ul className={styles.expertisesList}>
                          {expertises.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* ── Right Column — images only ── */}
          <div className={styles.rightCol}>
            <div className={styles.gallery}>
              {sections.length > 0 ? (
                sections.map((section: any, idx: number) => {
                  const raw = section.image?.data || section.image || [];
                  const images = Array.isArray(raw) ? raw : [raw];
                  if (images.length === 0) return null;
                  return (
                    <div key={idx} className={styles.sectionImages}>
                      {images.map((img: any, imgIdx: number) => {
                        const url = getStrapiMedia(img);
                        if (!url) return null;
                        return (
                          <div key={imgIdx} className={styles.galleryItem}>
                            <Image
                              src={url}
                              alt={`${section.title || attrs.title} — ${imgIdx + 1}`}
                              width={1200}
                              height={1600}
                              className={styles.image}
                              onLoad={() => ScrollTrigger.refresh()}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className={styles.placeholderGallery}>
                  <div className={styles.mockBox} />
                  <div className={styles.mockBoxSmall} />
                  <div className={styles.mockBoxSmall} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
