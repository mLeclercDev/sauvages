"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./VimeoEmbed.module.scss";

interface VimeoEmbedProps {
  vimeoId: string;
  vimeoHash?: string;
  /** "background": muted/autoplay/loop/no controls, thumbnail-style.
   *  "content": controls visible, standard player. */
  mode: "background" | "content";
  fallbackImageUrl?: string | null;
  alt: string;
  className?: string;
  /** Unmount the iframe when out of viewport (background mode only). Default true. */
  pauseWhenOffscreen?: boolean;
  onReady?: () => void;
  /** Skip lazy loading and viewport gating — for above-the-fold embeds like the Hero. */
  priority?: boolean;
}

function buildVimeoUrl(
  vimeoId: string,
  vimeoHash: string | undefined,
  mode: "background" | "content"
) {
  const params = new URLSearchParams();
  if (vimeoHash) params.set("h", vimeoHash);

  if (mode === "background") {
    params.set("muted", "1");
    params.set("autoplay", "1");
    params.set("autopause", "0");
    params.set("controls", "0");
    params.set("loop", "1");
    params.set("background", "1");
    params.set("quality", "auto");
    params.set("app_id", "122963");
    params.set("max_quality", "720p");
  } else {
    params.set("dnt", "1");
    params.set("title", "0");
    params.set("byline", "0");
    params.set("portrait", "0");
  }

  return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
}

export default function VimeoEmbed({
  vimeoId,
  vimeoHash,
  mode,
  fallbackImageUrl,
  alt,
  className,
  pauseWhenOffscreen = true,
  onReady,
  priority = false,
}: VimeoEmbedProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(priority || !pauseWhenOffscreen);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (priority || !pauseWhenOffscreen) return;
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (!entry.isIntersecting) setIsReady(false);
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, pauseWhenOffscreen]);

  const src = isInView ? buildVimeoUrl(vimeoId, vimeoHash, mode) : undefined;

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className || ""}`}>
      {fallbackImageUrl && (
        <Image
          src={fallbackImageUrl}
          alt={alt}
          fill
          sizes="100vw"
          className={`${styles.fallback} ${isReady ? styles.hidden : ""}`}
        />
      )}
      {src && (
        <iframe
          key={src}
          src={src}
          className={`${styles.iframe} ${isReady ? styles.ready : ""}`}
          loading={priority ? undefined : "lazy"}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          title={alt}
          onLoad={() => {
            setIsReady(true);
            onReady?.();
          }}
        />
      )}
    </div>
  );
}
