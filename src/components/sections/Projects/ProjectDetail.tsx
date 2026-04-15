"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import ProjectItem from "@/components/ui/ProjectItem/ProjectItem";
import RelatedProjects from "./RelatedProjects";
import styles from "./ProjectDetail.module.scss";

interface ProjectDetailProps {
  project: any;
  otherProjects: any[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  otherProjects,
}) => {
  const leftContentRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  const attrs = project.attributes || project;
  const explicitGallery = attrs.gallery?.data || [];
  const sections = attrs.sections || [];

  const clientName =
    attrs.client?.data?.attributes?.name || attrs.client?.name || "Client";

  // Use dynamic expertises if available, else hardcoded
  const rawExpertises = attrs.expertise?.data || [];
  const expertises = rawExpertises.length > 0 
    ? rawExpertises.map((exp: any) => exp.attributes?.titre || exp.titre)
    : [
        "STRATÉGIE DE COMMUNICATION",
        "PLATEFORME DE MARQUE",
        "ARCHITECTURE DE MARQUE (ACCOMPAGNEMENT RFP)",
        "CONCEPTION-RÉDACTION",
        "NAMING DE MARQUE",
        "SIGNATURE DE MARQUE",
        "STORYTELLING",
        "MANIFESTE DE MARQUE",
        "CHARTE ÉDITORIALE",
      ];

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      if (!leftContentRef.current || !layoutRef.current) return;

      // Make sure images are loaded before calculating heights, or use a refresh
      const leftHeight = leftContentRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      if (leftHeight < windowHeight - 100) {
        // CONTENT FITS IN VIEWPORT
        // We pin it to the top with an offset
        ScrollTrigger.create({
          trigger: layoutRef.current,
          pin: leftContentRef.current,
          start: "top top+=100",
          end: "bottom bottom",
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      } else {
        // CONTENT IS TALLER THAN VIEWPORT
        // We let it scroll naturally, then pin it to the bottom
        // so its bottom edge stays visible until the end of the section
        ScrollTrigger.create({
          trigger: layoutRef.current,
          pin: leftContentRef.current,
          start: "bottom bottom",
          end: "bottom bottom",
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      }
    });

    // Refresh after a small delay to account for dynamic content loading
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      clearTimeout(timer);
      mm.revert();
    };
  }, [project, explicitGallery.length, sections.length]);

  return (
    <div className={styles.projectDetail}>
      <div className="container">
        <div className={styles.layout} ref={layoutRef}>
          {/* Left Column (Sticky Container) */}
          <div className={styles.leftCol}>
            <div className={styles.leftContent} ref={leftContentRef}>
              <div className={`${styles.label} label`}>{clientName}</div>
              <h1 className={styles.title}>{attrs.title}</h1>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: attrs.description }}
              />

              <div className={styles.expertisesWrapper}>
                <div className={styles.expertisesHeader}>
                  EXPERTISES <span>+</span>
                </div>
                <ul className={styles.expertisesList}>
                  {expertises.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column (Scrolling Media) */}
          <div className={styles.rightCol}>
            <div className={styles.gallery}>
              {sections.length > 0 ? (
                sections.map((section: any, idx: number) => {
                  const sectionImagesArray = section.image?.data || [];
                  const images = Array.isArray(sectionImagesArray)
                    ? sectionImagesArray
                    : [sectionImagesArray];

                  return (
                    <div key={idx} className={styles.sectionBlock}>
                      {(section.title || section.description) && (
                        <div className={styles.sectionText}>
                          {section.title && (
                            <h2 className={styles.sectionTitle}>
                              {section.title}
                            </h2>
                          )}
                          {section.description && (
                            <div
                              className={styles.sectionDescription}
                              dangerouslySetInnerHTML={{
                                __html: section.description,
                              }}
                            />
                          )}
                        </div>
                      )}

                      {images.map((img: any, imgIdx: number) => {
                        const url = getStrapiMedia(img);
                        if (!url) return null;
                        return (
                          <div
                            key={`${idx}-${imgIdx}`}
                            className={styles.galleryItem}
                          >
                            <Image
                              src={url}
                              alt={`${section.title || attrs.title} - image ${
                                imgIdx + 1
                              }`}
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
              ) : explicitGallery.length > 0 ? (
                explicitGallery.map((img: any, idx: number) => {
                  const url = getStrapiMedia(img);
                  if (!url) return null;
                  return (
                    <div key={idx} className={styles.galleryItem}>
                      <Image
                        src={url}
                        alt={`${attrs.title} - image ${idx + 1}`}
                        width={1200}
                        height={1600}
                        className={styles.image}
                        onLoad={() => ScrollTrigger.refresh()}
                      />
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
