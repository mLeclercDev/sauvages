"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Vimeo's `background=1` mode letterboxes (like object-fit: contain) whenever
 * the iframe's box doesn't match the video's native aspect ratio — it never
 * crops to cover. This mirrors object-fit: cover by asking the Player SDK for
 * the video's real dimensions, then oversizing/centering the iframe itself.
 */
export function useVimeoCoverSize(
  wrapperRef: RefObject<HTMLElement | null>,
  iframeRef: RefObject<HTMLIFrameElement | null>,
  active: boolean
) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const videoRatioRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !wrapperRef.current || !iframeRef.current) {
      setSize(null);
      return;
    }

    let cancelled = false;
    let player: import("@vimeo/player").default | null = null;

    const recompute = () => {
      const ratio = videoRatioRef.current;
      const el = wrapperRef.current;
      if (!ratio || !el) return;
      const { width: cw, height: ch } = el.getBoundingClientRect();
      if (!cw || !ch) return;
      const containerRatio = cw / ch;
      setSize(
        containerRatio > ratio
          ? { width: cw, height: cw / ratio }
          : { width: ch * ratio, height: ch }
      );
    };

    import("@vimeo/player").then(({ default: Player }) => {
      if (cancelled || !iframeRef.current) return;
      player = new Player(iframeRef.current);
      Promise.all([player.getVideoWidth(), player.getVideoHeight()])
        .then(([w, h]) => {
          if (cancelled || !w || !h) return;
          videoRatioRef.current = w / h;
          recompute();
        })
        .catch(() => {});
    });

    const ro = new ResizeObserver(recompute);
    ro.observe(wrapperRef.current);

    return () => {
      cancelled = true;
      ro.disconnect();
      player?.destroy().catch(() => {});
    };
  }, [active, wrapperRef, iframeRef]);

  return size;
}
