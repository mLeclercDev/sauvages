"use client";

import React, { useRef, useEffect } from "react";
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
}

const StaffCard = ({
  member,
}: {
  member: StaffMember;
  index: number;
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={member.imageUrl}
          alt={member.name}
          fill
          className="fit-cover"
          unoptimized={true}
        />
        {member.videoUrl && (
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

    return {
      name: item.Nom,
      baseline: item.Description,
      imageUrl: getStrapiMedia(item.Image, undefined) || "/images/staff-1.avif",
      videoUrl: isVideo ? (mediaUrl || undefined) : undefined,
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
            <StaffCard key={index} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgenceStaff;
