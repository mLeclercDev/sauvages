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
  sector?: string;
}

interface ClientsScrollClientProps {
  clients: ClientItem[];
  label?: string;
  title?: string;
}

const BG_GREY = "#A2A2A2";
const BG_DEFAULT = "#f6f6f6";

const ClientsScrollClient: React.FC<ClientsScrollClientProps> = ({
  clients,
  label,
  title,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const competenciesRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const prevIndexRef = useRef<number>(-1);
  const zIndexCounter = useRef<number>(10);

  const activateClient = (index: number) => {
    if (prevIndexRef.current === index) return;
    const prev = prevIndexRef.current;
    setActiveIndex(index);
    prevIndexRef.current = index;

    const el = imageRefs.current[index];
    if (el) {
      gsap.killTweensOf(el);
      zIndexCounter.current += 1;
      gsap.set(el, { zIndex: zIndexCounter.current });
      gsap.fromTo(el, { scale: 0 }, {
        scale: 1,
        duration: 0.6,
        ease: "expo.out",
        onComplete: () => {
          if (prev !== -1 && prev !== prevIndexRef.current) {
            const prevEl = imageRefs.current[prev];
            if (prevEl) gsap.set(prevEl, { scale: 0, zIndex: 1 });
          }
        },
      });
    }

    competenciesRefs.current.forEach((compEl, i) => {
      if (!compEl) return;
      gsap.killTweensOf(compEl);
      gsap.to(compEl, { opacity: i === index ? 1 : 0, duration: 0.4, ease: "power2.inOut" });
    });
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const firstName = nameRefs.current[0];
    const lastName = nameRefs.current[clients.length - 1];
    const imageEl = imageAreaRef.current;

    if (!firstName || !lastName || !imageEl) return;

    // Init images and competencies — all hidden until scroll activates them
    imageRefs.current.forEach((el) => { if (el) gsap.set(el, { scale: 0, zIndex: 1 }); });
    competenciesRefs.current.forEach((el) => { if (el) gsap.set(el, { opacity: 0 }); });

    // Center the image container on its anchor point so the pin lands at 55vh center
    gsap.set(imageEl, { yPercent: -50, opacity: 0 });

    // Pin the image container from first client entering to last client becoming active
    const pinTrigger = ScrollTrigger.create({
      trigger: firstName,
      start: "top 55%",
      endTrigger: lastName,
      end: "top 55%",
      pin: imageEl,
      pinSpacing: false,
    });

    // Background color
    const revertBg = () =>
      gsap.to(document.body, {
        backgroundColor: BG_DEFAULT,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => { gsap.set(document.body, { clearProps: "backgroundColor" }); },
      });

    const showImage = () => gsap.to(imageEl, { opacity: 1, duration: 0.4, ease: "power2.inOut" });
    const hideImage = () => {
      gsap.to(imageEl, { opacity: 0, duration: 0.4, ease: "power2.inOut" });
      prevIndexRef.current = -1;
    };

    const bgTrigger = ScrollTrigger.create({
      trigger: firstName,
      start: "top 55%",
      endTrigger: lastName,
      end: "bottom 45%",
      onEnter: () => {
        gsap.to(document.body, { backgroundColor: BG_GREY, duration: 0.5, ease: "power2.inOut" });
        showImage();
      },
      onLeave: hideImage,
      onEnterBack: () => {
        gsap.to(document.body, { backgroundColor: BG_GREY, duration: 0.5, ease: "power2.inOut" });
        showImage();
      },
      onLeaveBack: () => {
        revertBg();
        hideImage();
      },
    });

    // Scroll listener for active client detection
    const threshold = window.innerHeight * 0.55;

    const onScroll = () => {
      let activeIdx = 0;
      nameRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= threshold) activeIdx = i;
      });
      activateClient(activeIdx);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      pinTrigger.kill();
      bgTrigger.kill();
      window.removeEventListener("scroll", onScroll);
      gsap.set(document.body, { clearProps: "backgroundColor" });
    };
  }, [clients]);

  return (
    <section className={`${styles.section} pt-top pb-bottom`}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.left}>
            {label && <span className="label">{label}</span>}
            {title && <h2 className={styles.sectionTitle}>{title}</h2>}
          </div>

          <div ref={imageAreaRef} className={styles.imageArea}>
            {clients.map((client, index) => {
              const url = getStrapiMedia(client.logo, undefined);
              return (
                <div
                  key={client.id}
                  ref={(el) => { imageRefs.current[index] = el; }}
                  className={styles.imageItem}
                >
                  {url ? (
                    <Image src={url} alt={client.name} fill className="fit-cover" unoptimized />
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <span>{client.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.right}>
            <div className={styles.clientList}>
              {clients.map((client, index) => (
                <div
                  key={client.id}
                  className={`${styles.clientRow} ${activeIndex === index ? styles.active : ""}`}
                >
                  <span
                    ref={(el) => { nameRefs.current[index] = el; }}
                    className={styles.clientName}
                  >
                    {client.name}
                  </span>
                  <p
                    ref={(el) => { competenciesRefs.current[index] = el; }}
                    className={styles.competenciesItem}
                  >
                    {client.sector}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsScrollClient;
