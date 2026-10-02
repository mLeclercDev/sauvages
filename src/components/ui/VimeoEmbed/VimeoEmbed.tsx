"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useVimeoCoverSize } from "@/hooks/useVimeoCoverSize";
import { getVimeoThumbnail } from "@/utils/vimeo";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isInView, setIsInView] = useState(priority || !pauseWhenOffscreen);
  const [isReady, setIsReady] = useState(false);
  // Vimeo's background mode letterboxes instead of cropping when the iframe's
  // box doesn't match the video's own ratio — this computes a cover-fit size.
  const coverSize = useVimeoCoverSize(wrapperRef, iframeRef, mode === "background" && isReady);
  // In background mode, stay hidden behind the fallback until the cover size
  // is known — otherwise the letterboxed iframe flashes before it snaps to size.
  const visuallyReady = mode === "background" ? isReady && coverSize !== null : isReady;

  // Miniature Vimeo auto-récupérée (API oEmbed), utilisée seulement si aucune
  // image n'est fournie manuellement via `fallbackImageUrl` (ex: champ Strapi).
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null);

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

  useEffect(() => {
    if (fallbackImageUrl) return;
    let cancelled = false;
    getVimeoThumbnail(vimeoId, vimeoHash).then((url) => {
      if (!cancelled) setAutoThumbnail(url);
    });
    return () => {
      cancelled = true;
    };
  }, [vimeoId, vimeoHash, fallbackImageUrl]);
  const effectiveFallbackUrl = fallbackImageUrl || autoThumbnail;

  // Certains appareils (mode économie d'énergie/données, bloqueurs de
  // tracking) empêchent l'autoplay même muet. On détecte l'échec et on
  // affiche un bouton play visible plutôt qu'un fond vide/figé.
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (mode !== "background" || !isReady || !iframeRef.current) return;
    let cancelled = false;
    let player: import("@vimeo/player").default | null = null;

    const timer = setTimeout(() => {
      if (!cancelled && !isPlaying) setAutoplayFailed(true);
    }, 1800);

    import("@vimeo/player").then(({ default: Player }) => {
      if (cancelled || !iframeRef.current) return;
      player = new Player(iframeRef.current);
      player.on("play", () => {
        if (cancelled) return;
        setIsPlaying(true);
        setAutoplayFailed(false);
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      player?.off("play");
    };
  }, [mode, isReady, isPlaying]);

  const handleManualPlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!iframeRef.current) return;
    const { default: Player } = await import("@vimeo/player");
    const player = new Player(iframeRef.current);
    try {
      await player.play();
      setIsPlaying(true);
      setAutoplayFailed(false);
    } catch {
      // Toujours bloqué malgré le geste utilisateur — on laisse le bouton visible.
    }
  };

  const src = isInView ? buildVimeoUrl(vimeoId, vimeoHash, mode) : undefined;

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${className || ""}`}>
      {effectiveFallbackUrl && (
        <Image
          src={effectiveFallbackUrl}
          alt={alt}
          fill
          sizes="100vw"
          className={`${styles.fallback} ${visuallyReady ? styles.hidden : ""}`}
        />
      )}
      {src && (
        <iframe
          key={src}
          ref={iframeRef}
          src={src}
          className={`${styles.iframe} ${visuallyReady ? styles.ready : ""} ${mode === "background" ? styles.noPointerEvents : ""}`}
          style={
            mode === "background" && coverSize
              ? {
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  right: "auto",
                  bottom: "auto",
                  width: coverSize.width,
                  height: coverSize.height,
                  transform: "translate(-50%, -50%)",
                }
              : undefined
          }
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
      {mode === "background" && autoplayFailed && !isPlaying && (
        <button
          type="button"
          className={styles.playButton}
          onClick={handleManualPlay}
          aria-label="Lancer la vidéo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.5)" />
            <path d="M9.5 7.5v9l7-4.5-7-4.5z" fill="#fff" />
          </svg>
        </button>
      )}
    </div>
  );
}
