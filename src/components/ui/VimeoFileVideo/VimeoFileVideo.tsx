"use client";

import React, { useEffect, useRef, useState } from "react";
import { getVimeoThumbnail } from "@/utils/vimeo";
import styles from "./VimeoFileVideo.module.scss";

interface VimeoFileVideoProps {
  src: string;
  vimeoId: string;
  posterUrl?: string | null;
  className?: string;
  onReady?: () => void;
}

/**
 * Boucle décorative en <video> native sur un lien de fichier Vimeo permanent.
 * Contrairement à l'iframe, une <video> native peut être relancée par la page
 * dès que le navigateur l'autorise (premier tap, retour à l'écran).
 */
export default function VimeoFileVideo({
  src,
  vimeoId,
  posterUrl,
  className,
  onReady,
}: VimeoFileVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoPoster, setAutoPoster] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (posterUrl) return;
    let cancelled = false;
    getVimeoThumbnail(vimeoId).then((url) => {
      if (!cancelled) setAutoPoster(url);
    });
    return () => {
      cancelled = true;
    };
  }, [vimeoId, posterUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // iOS exige que la vidéo soit muette au niveau de l'élément pour l'autoplay.
    video.muted = true;
    video.defaultMuted = true;

    let inView = false;
    const tryPlay = () => {
      if (!inView) return;
      video
        .play()
        .then(() => setBlocked(false))
        .catch(() => setBlocked(true));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) tryPlay();
        else video.pause();
      },
      { rootMargin: "200px" }
    );
    observer.observe(video);

    // Un tap n'importe où sur la page autorise la lecture sur les appareils
    // qui bloquent l'autoplay (ex : mode économie d'énergie sur iPhone).
    const onInteraction = () => tryPlay();
    document.addEventListener("touchend", onInteraction, { passive: true });
    document.addEventListener("click", onInteraction);

    return () => {
      observer.disconnect();
      document.removeEventListener("touchend", onInteraction);
      document.removeEventListener("click", onInteraction);
    };
  }, [src]);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    videoRef.current
      ?.play()
      .then(() => setBlocked(false))
      .catch(() => {});
  };

  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      <video
        ref={videoRef}
        src={src}
        poster={posterUrl || autoPoster || undefined}
        className={styles.video}
        muted
        loop
        playsInline
        preload="metadata"
        onPlaying={() => setBlocked(false)}
        onLoadedData={() => onReady?.()}
      />
      {blocked && (
        <button
          type="button"
          className={styles.playButton}
          onClick={handlePlay}
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
