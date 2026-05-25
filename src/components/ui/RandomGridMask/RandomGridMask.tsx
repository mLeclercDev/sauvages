"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./RandomGridMask.module.scss";

interface RandomGridMaskProps {
  src: string;
  alt: string;
  className?: string;
  cols?: number;
  triggerStart?: string;
  triggerEnd?: string;
  scrub?: number | boolean;
  priority?: boolean;
  disableScrollReveal?: boolean;
  unoptimized?: boolean;
}

type Cell = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const RandomGridMask: React.FC<RandomGridMaskProps> = ({
  src,
  alt,
  className = "",
  cols = 10,
  triggerStart = "top 100%",
  triggerEnd = "bottom 60%",
  scrub = 1.5,
  disableScrollReveal = false,
}) => {
  const maskId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<(SVGRectElement | null)[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const updateLayout = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const width = rect.width;
      const height = rect.height;

      const rows = Math.round(cols * (height / width));
      const cellW = width / cols;
      const cellH = height / rows;

      const newCells: Cell[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          newCells.push({
            id: `${x}-${y}`,
            x: x * cellW,
            y: y * cellH,
            width: cellW + 0.5,
            height: cellH + 0.5,
          });
        }
      }
      setDimensions({ width, height });
      setCells(newCells);
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(updateLayout);
    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);

    return () => resizeObserver.disconnect();
  }, [cols]);

  useEffect(() => {
    if (cells.length === 0 || !wrapperRef.current) return;

    const domCells = cellsRef.current.filter(
      (el) => el !== null
    ) as SVGRectElement[];

    if (!disableScrollReveal) {
      const ordered = gsap.utils.shuffle([...domCells]);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: triggerStart,
          end: triggerEnd,
          scrub: scrub,
        },
      });

      gsap.set(ordered, { opacity: 0 });

      tl.to(ordered, {
        opacity: 1,
        stagger: { each: 0.02 },
        ease: "power1.inOut",
      });

      return () => {
        tl.kill();
      };
    } else {
      gsap.set(domCells, { opacity: 1 });
    }
  }, [cells, disableScrollReveal, triggerStart, triggerEnd, scrub]);

  return (
    <div
      className={`${styles.maskWrapper} ${className}`}
      ref={wrapperRef}
    >
      <svg
        className={styles.svgMask}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid slice"
        aria-label={alt}
      >
        <defs>
          <mask
            id={`mask-${maskId}`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={dimensions.width}
            height={dimensions.height}
          >
            <rect
              x="0"
              y="0"
              width={dimensions.width}
              height={dimensions.height}
              fill="black"
            />
            <g>
              {cells.map((cell, idx) => (
                <rect
                  key={`mask-rect-${cell.id}`}
                  ref={(el) => {
                    cellsRef.current[idx] = el;
                  }}
                  x={cell.x}
                  y={cell.y}
                  width={cell.width}
                  height={cell.height}
                  fill="white"
                  shapeRendering="crispEdges"
                  style={{ opacity: disableScrollReveal ? 1 : 0 }}
                />
              ))}
            </g>
          </mask>
        </defs>

        <image
          href={src}
          x="0"
          y="0"
          width={dimensions.width}
          height={dimensions.height}
          preserveAspectRatio="xMidYMid slice"
          mask={`url(#mask-${maskId})`}
        />
      </svg>
    </div>
  );
};

export default RandomGridMask;
