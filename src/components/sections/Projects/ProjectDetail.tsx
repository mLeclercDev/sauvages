"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accordionBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const expertisesBodyRef = useRef<HTMLDivElement>(null);
  const prevSectionRef = useRef<number>(0);
  const [activeSection, setActiveSection] = useState<number>(0);

  const attrs = project.attributes || project;
  const sections = attrs.sections || [];
  // Index reserved for the expertises accordion
  const EXPERTISES_IDX = sections.length;

  const clientName =
    attrs.client?.data?.attributes?.name || attrs.client?.name || "Client";

  const rawExpertises = attrs.expertise?.data || attrs.expertise || [];
  const expertises = rawExpertises
    .map(
      (exp: any) =>
        exp.attributes?.titre || exp.attributes?.name || exp.titre || exp.name
    )
    .filter(Boolean);

  // Set initial heights once refs are populated
  useEffect(() => {
    accordionBodyRefs.current.forEach((el, idx) => {
      if (!el) return;
      gsap.set(el, { height: idx === 0 ? "auto" : 0 });
    });
    if (expertisesBodyRef.current) {
      gsap.set(expertisesBodyRef.current, { height: 0 });
    }
  }, [sections.length]);

  // Animate open/close on activeSection change
  useEffect(() => {
    const prev = prevSectionRef.current;
    const next = activeSection;
    if (prev === next) return;

    // Close previous
    if (prev >= 0) {
      const closeEl =
        prev === EXPERTISES_IDX
          ? expertisesBodyRef.current
          : accordionBodyRefs.current[prev];
      if (closeEl) {
        gsap.to(closeEl, {
          height: 0,
          duration: 0.38,
          ease: "power2.inOut",
          overwrite: true,
        });
      }
    }

    // Open next
    if (next >= 0) {
      const openEl =
        next === EXPERTISES_IDX
          ? expertisesBodyRef.current
          : accordionBodyRefs.current[next];
      if (openEl) {
        gsap.to(openEl, {
          height: "auto",
          duration: 0.45,
          ease: "power2.out",
          overwrite: true,
          onComplete: () => ScrollTrigger.refresh(),
        });
      }
    }

    prevSectionRef.current = next;
  }, [activeSection, EXPERTISES_IDX]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!leftContentRef.current || !layoutRef.current) return;

    const triggers: ScrollTrigger[] = [];

    if (window.innerWidth >= 1024) {
      // Pin left column for the full height of the layout
      triggers.push(
        ScrollTrigger.create({
          trigger: layoutRef.current,
          pin: leftContentRef.current,
          start: "top top+=100",
          end: "bottom bottom",
          pinSpacing: false,
          invalidateOnRefresh: true,
        })
      );

      // Section scroll → accordion sync
      sectionRefs.current.forEach((el, idx) => {
        if (!el) return;
        const isLast = idx === sections.length - 1 && expertises.length > 0;
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: () => setActiveSection(idx),
            onEnterBack: () => setActiveSection(idx),
            // Last section scrolled past → open expertises
            ...(isLast ? { onLeave: () => setActiveSection(EXPERTISES_IDX) } : {}),
          })
        );
      });
    }

    const timer = setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      clearTimeout(timer);
      triggers.forEach((t) => t.kill());
    };
  }, [project, sections.length, EXPERTISES_IDX]);

  const toggleSection = (idx: number) => {
    setActiveSection((prev) => (prev === idx ? -1 : idx));
  };

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

              {/* All accordions: sections + expertises */}
              {(sections.length > 0 || expertises.length > 0) && (
                <div className={styles.accordions}>

                  {sections.map((section: any, idx: number) => {
                    const isOpen = activeSection === idx;
                    return (
                      <div
                        key={idx}
                        className={`${styles.accordionItem} ${isOpen ? styles.open : ""}`}
                      >
                        <button
                          className={styles.accordionHeader}
                          onClick={() => toggleSection(idx)}
                        >
                          <span className={styles.accordionIcon}>
                            {isOpen ? "—" : "+"}
                          </span>
                          {section.title}
                        </button>
                        <div
                          className={styles.accordionBody}
                          ref={(el) => { accordionBodyRefs.current[idx] = el; }}
                        >
                          {section.description && (
                            <div
                              className={styles.accordionContent}
                              dangerouslySetInnerHTML={{
                                __html: section.description,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {expertises.length > 0 && (
                    <div
                      className={`${styles.accordionItem} ${activeSection === EXPERTISES_IDX ? styles.open : ""}`}
                    >
                      <button
                        className={styles.accordionHeader}
                        onClick={() => toggleSection(EXPERTISES_IDX)}
                      >
                        <span className={styles.accordionIcon}>
                          {activeSection === EXPERTISES_IDX ? "—" : "+"}
                        </span>
                        Expertises
                      </button>
                      <div className={styles.accordionBody} ref={expertisesBodyRef}>
                        <ul className={styles.expertisesList}>
                          {expertises.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
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
                <>
                  {sections.map((section: any, idx: number) => {
                    const raw = section.image?.data || section.image || [];
                    const images = Array.isArray(raw) ? raw : [raw];
                    if (images.length === 0) return null;
                    return (
                      <div
                        key={idx}
                        className={styles.sectionImages}
                        ref={(el) => {
                          sectionRefs.current[idx] = el;
                        }}
                      >
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
                  })}
                </>
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
