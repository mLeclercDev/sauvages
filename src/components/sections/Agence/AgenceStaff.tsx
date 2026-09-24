"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AgenceStaff.module.scss";
import { getStrapiMedia } from "@/utils/strapi";

interface StaffMember {
  name: string;
  baseline: string;
  imageUrl: string;
  videoUrl?: string;
  isAlphaWebm?: boolean;
}

// WebKit (Safari desktop + tous les navigateurs iOS) ne compose pas le canal
// alpha des vidéos WebM/VP9 : il affiche le plan RGB brut, rempli en noir
// aux endroits transparents. On détecte ce cas pour ne pas servir ces
// vidéos-là sur WebKit et garder la photo statique à la place.
const isWebKitAlphaUnsafe = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iP(hone|od|ad)/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isDesktopSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return isIOS || isDesktopSafari;
};

const StaffCard = ({
  member,
  supportsAlphaVideo,
}: {
  member: StaffMember;
  index: number;
  supportsAlphaVideo: boolean;
}) => {
  const showVideo =
    member.videoUrl && (!member.isAlphaWebm || supportsAlphaVideo);

  return (
    <div className={styles.card}>
      <div
        className={`${styles.imageContainer} ${showVideo ? styles.hasVideo : ""}`}
      >
        {member.imageUrl && (
          <Image
            src={member.imageUrl}
            alt={member.name}
            fill
            className="fit-cover"
            unoptimized={true}
          />
        )}
        {showVideo && (
          <video
            className={styles.hoverVideo}
            src={member.videoUrl}
            muted
            loop
            playsInline
            autoPlay
          />
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{member.name}</h3>
        <p className={styles.baseline}>{member.baseline}</p>
      </div>
    </div>
  );
};

interface AgenceStaffProps {
  pt?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  pb?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  data?: any;
}

const AgenceStaff: React.FC<AgenceStaffProps> = ({ pt = "lg", pb = "lg", data }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [supportsAlphaVideo, setSupportsAlphaVideo] = useState(true);

  useEffect(() => {
    // navigator n'existe pas côté serveur : on ne peut détecter WebKit
    // qu'après le montage, avant toute interaction utilisateur possible.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupportsAlphaVideo(!isWebKitAlphaUnsafe());
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      const cards = sectionRef.current.querySelectorAll(`.${styles.card}`);

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [data]);

  // Transformation des données Strapi en membres de l'équipe
  const members: StaffMember[] = data?.EquipeListingItem?.map((item: any) => {
    const mediaUrl = getStrapiMedia(item.Media, undefined);
    const isVideo = item.Media?.mime?.includes("video") || item.Media?.ext === ".mp4";
    const isAlphaWebm =
      item.Media?.mime?.includes("webm") || item.Media?.ext?.toLowerCase() === ".webm";

    return {
      name: item.Nom,
      baseline: item.Description,
      imageUrl: getStrapiMedia(item.Image, undefined) || "",
      videoUrl: isVideo ? (mediaUrl || undefined) : undefined,
      isAlphaWebm,
    };
  }) || [];

  return (
    <section
      ref={sectionRef}
      className={`${styles.agenceStaff} pt-${pt} pb-${pb}`}
    >
      <div className="container">
        <div className={styles.grid}>
          {members.map((member, index) => (
            <StaffCard
              key={index}
              member={member}
              index={index}
              supportsAlphaVideo={supportsAlphaVideo}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgenceStaff;
