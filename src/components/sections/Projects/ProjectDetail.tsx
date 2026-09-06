"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { marked } from "marked";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./ProjectDetail.module.scss";

interface ProjectDetailProps {
  project: any;
  otherProjects: any[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const leftContentRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const accordionBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accordionHeaderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconOpenRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const iconClosedRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const expertisesBodyRef = useRef<HTMLDivElement>(null);
  const expertisesHeaderRef = useRef<HTMLDivElement>(null);
  const expertisesIconOpenRef = useRef<HTMLSpanElement>(null);
  const expertisesIconClosedRef = useRef<HTMLSpanElement>(null);

  const scrubTriggerRef = useRef<ScrollTrigger | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isClickAnimating = useRef(false);

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

  const rawDescription = attrs.description || attrs.Description;
  const hasDescription = typeof rawDescription === "string"
    ? rawDescription.trim().length > 0
    : Array.isArray(rawDescription) && rawDescription.length > 0;

  const renderInline = (c: any, i: number) => {
    if (c.type === "linebreak") return <br key={i} />;

    const fmt = c.format || 0;

    // Text node without Lexical formatting but with literal markdown (e.g. **bold**)
    if (fmt === 0 && !c.bold && !c.italic && !c.code && !c.underline) {
      const text: string = c.text || "";
      if (/\*/.test(text)) {
        const normalized = text
          .replace(/\*\*([^*\n]+?) (\*\*)/g, "**$1** ")
          .replace(/\*([^*\n]+?) (\*)/g, "*$1* ");
        const html = marked.parseInline(normalized) as string;
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      }
    }

    let node: React.ReactNode = c.text;
    if (fmt & 16 || c.code) node = <code key={i}>{node}</code>;
    if (fmt & 1 || c.bold) node = <strong key={i}>{node}</strong>;
    if (fmt & 2 || c.italic) node = <em key={i}>{node}</em>;
    if (fmt & 8 || c.underline) node = <u key={i}>{node}</u>;
    return <React.Fragment key={i}>{node}</React.Fragment>;
  };

  const renderDescription = (content: any) => {
    if (typeof content === "string") {
      const processed = content
        // Fix trailing space before closing delimiter (common CMS typo)
        .replace(/\*\*([^*\n<>]+?) (\*\*)/g, "**$1** ")
        .replace(/\*([^*\n<>]+?) (\*)/g, "*$1* ")
        // Convert inline markdown to HTML directly (marked skips markdown inside HTML tags)
        .replace(/\*\*([^*<>]+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*<>]+?)\*/g, "<em>$1</em>");
      return <div className={styles.markdownContent} dangerouslySetInnerHTML={{ __html: processed }} />;
    }
    if (Array.isArray(content)) {
      return content.map((block: any, i: number) => {
        if (block.type === "paragraph") {
          const isEmpty = !block.children?.some((c: any) => c.text || c.type === "linebreak");
          if (isEmpty) return <br key={i} />;
          return <p key={i}>{block.children?.map(renderInline)}</p>;
        }
        if (block.type === "heading") {
          const Tag = `h${block.level}` as keyof React.JSX.IntrinsicElements;
          return <Tag key={i}>{block.children?.map(renderInline)}</Tag>;
        }
        return null;
      });
    }
    return null;
  };

  const handleAccordionClick = useCallback((idx: number) => {
    const st = scrubTriggerRef.current;
    const tl = tlRef.current;
    if (!st || !tl || window.innerWidth < 1024) return;

    const totalDuration = tl.duration();
    const targetProgress =
      idx === 0
        ? 0
        : Math.min(((idx - 1) * 2 + 1.8) / totalDuration, 1);

    const targetScrollY = st.start + targetProgress * (st.end - st.start);

    isClickAnimating.current = true;

    gsap.to(tl, {
      progress: targetProgress,
      duration: 0.8,
      ease: "power2.inOut",
      overwrite: true,
    });

    gsap.to(window, {
      scrollTo: { y: targetScrollY, autoKill: false },
      duration: 0.8,
      ease: "power2.inOut",
      overwrite: true,
      onComplete: () => {
        isClickAnimating.current = false;
      },
    });
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
                  .to(body, { height: 0, opacity: 0, duration: 1, ease: "power1.inOut" }, startTime + 0.5)
                  .to(next, { height: "auto", opacity: 1, duration: 1, ease: "power1.inOut" }, startTime + 0.7)
                  .to(allHeaders[i], { opacity: 0.4, duration: 0.6, ease: "power1.inOut" }, startTime + 0.5)
                  .to(allIconsOpen[i], { opacity: 0, duration: 0.4, ease: "power1.inOut" }, startTime + 0.5)
                  .to(allIconsClosed[i], { opacity: 1, duration: 0.4, ease: "power1.inOut" }, startTime + 0.5)
                  .to(allHeaders[i + 1], { opacity: 1, duration: 0.6, ease: "power1.inOut" }, startTime + 0.7)
                  .to(allIconsOpen[i + 1], { opacity: 1, duration: 0.4, ease: "power1.inOut" }, startTime + 0.7)
                  .to(allIconsClosed[i + 1], { opacity: 0, duration: 0.4, ease: "power1.inOut" }, startTime + 0.7);
              }
            });

            tlRef.current = tl;

            const scrubST = ScrollTrigger.create({
              trigger: layoutRef.current,
              start: "top top+=100",
              end: "bottom bottom",
              scrub: 2,
              onUpdate: (self) => {
                if (!isClickAnimating.current) {
                  tl.progress(self.progress);
                }
              },
            });

            scrubTriggerRef.current = scrubST;
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
      scrubTriggerRef.current = null;
      tlRef.current = null;
      mm.revert();
    };
  }, [project, sections.length, expertises.length, hasDescription]);


  const descriptionOffset = hasDescription ? 1 : 0;
  const expertisesIdx = sections.length + descriptionOffset;

  return (
    <div className={styles.projectDetail}>
      <div className="container">
        <div className={styles.layout} ref={layoutRef}>

          {/* ── Left Column ── */}
          <div className={styles.leftCol}>
            <div className={styles.leftContent} ref={leftContentRef}>

              <div className={styles.projectHeader}>
                <div className={`${styles.clientLabel} label`}>{clientName}</div>
                <h1 className={styles.title}>{attrs.title}</h1>
                {attrs.sector && (
                  <div className={`${styles.sector} label`}>{attrs.sector}</div>
                )}
              </div>

              {(sections.length > 0 || expertises.length > 0 || hasDescription) && (
                <div className={styles.accordions}>

                  {hasDescription && (
                    <div className={styles.accordionItem}>
                      <div
                        className={styles.accordionHeader}
                        ref={(el) => { accordionHeaderRefs.current[0] = el; }}
                        onClick={() => handleAccordionClick(0)}
                      >
                        <span className={styles.accordionIcon}>
                          <span
                            className={styles.iconOpen}
                            ref={(el) => { iconOpenRefs.current[0] = el; }}
                          >+</span>
                          <span
                            className={styles.iconClosed}
                            ref={(el) => { iconClosedRefs.current[0] = el; }}
                          >—</span>
                        </span>
                        Description
                      </div>
                      <div
                        className={styles.accordionBody}
                        ref={(el) => { accordionBodyRefs.current[0] = el; }}
                      >
                        <div className={styles.accordionContent}>
                          {renderDescription(rawDescription)}
                        </div>
                      </div>
                    </div>
                  )}

                  {sections.map((section: any, idx: number) => {
                    const refIdx = idx + descriptionOffset;
                    return (
                    <div key={refIdx} className={styles.accordionItem}>
                      <div
                        className={styles.accordionHeader}
                        ref={(el) => { accordionHeaderRefs.current[refIdx] = el; }}
                        onClick={() => handleAccordionClick(refIdx)}
                      >
                        <span className={styles.accordionIcon}>
                          <span
                            className={styles.iconOpen}
                            ref={(el) => { iconOpenRefs.current[refIdx] = el; }}
                          >+</span>
                          <span
                            className={styles.iconClosed}
                            ref={(el) => { iconClosedRefs.current[refIdx] = el; }}
                          >—</span>
                        </span>
                        {section.title}
                      </div>
                      <div
                        className={styles.accordionBody}
                        ref={(el) => { accordionBodyRefs.current[refIdx] = el; }}
                      >
                        {section.description && (
                          <div
                            className={styles.accordionContent}
                            dangerouslySetInnerHTML={{ __html: section.description }}
                          />
                        )}
                      </div>
                    </div>
                    );
                  })}

                  {expertises.length > 0 && (
                    <div className={styles.accordionItem}>
                      <div
                        className={styles.accordionHeader}
                        ref={expertisesHeaderRef}
                        onClick={() => handleAccordionClick(expertisesIdx)}
                      >
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

          {/* ── Right Column — images & videos ── */}
          <div className={styles.rightCol}>
            <div className={styles.gallery} ref={galleryRef}>
              {sections.length > 0 || attrs.Galerie?.length > 0 ? (
                <>
                  {sections.map((section: any, idx: number) => {
                    const raw = section.image?.data || section.image || [];
                    const medias = Array.isArray(raw) ? raw : [raw];
                    if (medias.length === 0) return null;
                    const isDouble = medias.length >= 2;
                    return (
                      <div
                        key={idx}
                        className={`${styles.sectionImages} ${isDouble ? styles.sectionImagesDouble : ""}`}
                      >
                        {medias.map((media: any, mediaIdx: number) => {
                          const url = getStrapiMedia(media);
                          if (!url) return null;
                          const mime: string = media.mime || media.attributes?.mime || "";
                          const isVideo = mime.startsWith("video/");
                          const itemClass = isDouble ? styles.galleryItemDouble : styles.galleryItemSingle;
                          return (
                            <div key={mediaIdx} className={`${styles.galleryItem} ${itemClass}`}>
                              {isVideo ? (
                                <video
                                  src={url}
                                  className={styles.image}
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                  onLoadedData={() => ScrollTrigger.refresh()}
                                />
                              ) : (
                                <Image
                                  src={url}
                                  alt={`${section.title || attrs.title} — ${mediaIdx + 1}`}
                                  width={1200}
                                  height={1600}
                                  className={styles.image}
                                  onLoad={() => ScrollTrigger.refresh()}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {Array.isArray(attrs.Galerie) && attrs.Galerie.map((block: any, idx: number) => {
                    const isDouble = block.Disposition === "double";
                    const images: any[] = block.Images || [];
                    if (images.length === 0) return null;
                    const itemClass = isDouble ? styles.galleryItemDouble : styles.galleryItemSingle;
                    return (
                      <div
                        key={`galerie-${idx}`}
                        className={`${styles.sectionImages} ${isDouble ? styles.sectionImagesDouble : ""}`}
                      >
                        {images.map((media: any, mediaIdx: number) => {
                          const url = getStrapiMedia(media);
                          if (!url) return null;
                          const mime: string = media.mime || "";
                          const isVideo = mime.startsWith("video/") || /\.(mp4|webm|ogg)$/i.test(url);
                          return (
                            <div key={mediaIdx} className={`${styles.galleryItem} ${itemClass}`}>
                              {isVideo ? (
                                <video
                                  src={url}
                                  className={styles.image}
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                  onLoadedData={() => ScrollTrigger.refresh()}
                                />
                              ) : (
                                <Image
                                  src={url}
                                  alt={`Galerie — ${mediaIdx + 1}`}
                                  width={1200}
                                  height={1600}
                                  className={styles.image}
                                  onLoad={() => ScrollTrigger.refresh()}
                                />
                              )}
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
