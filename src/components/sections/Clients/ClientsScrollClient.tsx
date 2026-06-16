"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStrapiMedia } from "@/utils/strapi";
import styles from "./ClientsScroll.module.scss";

export interface ClientItem {
  id: string | number;
  name: string;
  logo?: any;
  competencies?: string[];
}

interface ClientsScrollClientProps {
  clients: ClientItem[];
  label?: string;
  title?: string;
}

const ClientsScrollClient: React.FC<ClientsScrollClientProps> = ({
  clients,
  label = "NOS CLIENTS",
  title = "Ils nous ont fait confiance",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const competenciesRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef<number>(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Initialize: first image visible, rest hidden
    imageRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { scale: i === 0 ? 1 : 0 });
    });
  }, [clients]);

  const activateClient = (index: number) => {
    const prev = prevIndexRef.current;
    if (prev === index) return;

    setActiveIndex(index);
    prevIndexRef.current = index;

    // Swap images — same pattern as ProjectsTable
    const newEl = imageRefs.current[index];
    const prevEl = imageRefs.current[prev];

    if (newEl) {
      gsap.killTweensOf(newEl);
      gsap.fromTo(
        newEl,
        { scale: 0 },
        { scale: 1, duration: 0.6, ease: "expo.out" }
      );
    }
    if (prevEl) {
      gsap.killTweensOf(prevEl);
      gsap.to(prevEl, { scale: 0, duration: 0.4, ease: "power2.inOut" });
    }

    // Animate competencies out → in
    if (competenciesRef.current) {
      gsap.killTweensOf(competenciesRef.current);
      gsap.fromTo(
        competenciesRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggers = rowRefs.current.map((row, index) => {
      if (!row) return null;
      return ScrollTrigger.create({
        trigger: row,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: () => activateClient(index),
        onEnterBack: () => activateClient(index),
      });
    });

    return () => {
      triggers.forEach((t) => t?.kill());
    };
  }, [clients]);

  const currentCompetencies = clients[activeIndex]?.competencies || [];

  return (
    <section className={`${styles.section} pt-top pb-bottom`}>
      <div className="container">
        <div className={styles.layout}>
          {/* Left: sticky title */}
          <div className={styles.left}>
            <span className="label">{label}</span>
            <h2 className={styles.sectionTitle}>{title}</h2>
          </div>

          <div className={styles.imageArea}>
            <div className={styles.imageStack}>
              {clients.map((client, index) => {
                const url = getStrapiMedia(client.logo, undefined);
                return (
                  <div
                    key={client.id}
                    ref={(el) => {
                      imageRefs.current[index] = el;
                    }}
                    className={styles.imageItem}
                  >
                    {url ? (
                      <Image
                        src={url}
                        alt={client.name}
                        fill
                        className="fit-cover"
                        unoptimized
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        <span>{client.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: image + list + competencies */}
          <div className={styles.right}>
            {/* Sticky image */} {/* Spacer to allow scrolling */}
            {/* Scrollable client list */}
            <div className={styles.clientList}>
              {clients.map((client, index) => (
                <div
                  key={client.id}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className={`${styles.clientRow} ${activeIndex === index ? styles.active : ""}`}
                >
                  <span className={styles.clientName}>{client.name}</span>
                </div>
              ))}
            </div>
            {/* Sticky competencies */}
            <div className={styles.competenciesArea}>
              <p ref={competenciesRef} className={styles.competenciesList}>
                {currentCompetencies.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsScrollClient;
