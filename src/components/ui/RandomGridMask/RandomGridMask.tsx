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
  isHovered?: boolean;
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

const COLORS = [
  "#96e91e",
  "#efff9b",
  "#f22d19",
  "#fea3e0",
  "#d8d0ff",
  "#0f0fca",
];

const RandomGridMask: React.FC<RandomGridMaskProps> = ({
  src,
  alt,
  className = "",
  cols = 10,
  triggerStart = "top 100%",
  triggerEnd = "bottom 60%",
  scrub = 1.5,
  isHovered = false,
  disableScrollReveal = false,
}) => {
  const maskId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<(SVGRectElement | null)[]>([]);
  const coloredCellsRef = useRef<(SVGRectElement | null)[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const hoverTimeline = useRef<gsap.core.Timeline | null>(null);
  const frozenIndicesRef = useRef<Set<number>>(new Set());
  const lastMousePos = useRef({ x: 0, y: 0 });

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

  // Handle Mouse Move for Fragment Shuffling
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isHovered || cells.length === 0) return;

    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 25) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      const domCells = cellsRef.current.filter(
        (el) => el !== null
      ) as SVGRectElement[];
      const colorCells = coloredCellsRef.current.filter(
        (el) => el !== null
      ) as SVGRectElement[];

      const currentFrozen = Array.from(frozenIndicesRef.current);
      if (currentFrozen.length === 0) return;

      const toUnfreeze = gsap.utils.shuffle(currentFrozen).slice(0, 1);
      const allIndices = Array.from({ length: domCells.length }, (_, i) => i);
      const availableIndices = allIndices.filter(
        (i) => !frozenIndicesRef.current.has(i)
      );
      const toFreeze = gsap.utils.shuffle(availableIndices).slice(0, 1);

      toUnfreeze.forEach((idx) => {
        frozenIndicesRef.current.delete(idx);
        gsap.to(domCells[idx], {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.to(colorCells[idx], {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      toFreeze.forEach((idx) => {
        frozenIndicesRef.current.add(idx);
        gsap.to(domCells[idx], {
          opacity: 0.4,
          duration: 0.4,
          ease: "power2.out",
        });
        gsap.to(colorCells[idx], {
          opacity: 0.7,
          duration: 0.4,
          ease: "power2.out",
        });
      });
    }
  };

  // Handle Hover Animation: Seamless Reveal to Fragmented State with Monochromatic Random Color
  useEffect(() => {
    if (cells.length === 0 || !wrapperRef.current) return;

    const domCells = cellsRef.current.filter(
      (el) => el !== null
    ) as SVGRectElement[];
    const colorCells = coloredCellsRef.current.filter(
      (el) => el !== null
    ) as SVGRectElement[];

    if (isHovered) {
      if (hoverTimeline.current) {
        hoverTimeline.current.kill();
      }

      // Select a new random color for this specific hover event
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      gsap.set(colorCells, { fill: newColor });

      const totalCells = domCells.length;
      const shuffledIndices = gsap.utils.shuffle(
        Array.from({ length: totalCells }, (_, i) => i)
      );
      const initialFrozen = shuffledIndices.slice(
        0,
        Math.floor(totalCells * 0.4)
      );
      frozenIndicesRef.current = new Set(initialFrozen);

      const tl = gsap.timeline();
      hoverTimeline.current = tl;

      gsap.set(domCells, { opacity: 0 });
      gsap.set(colorCells, { opacity: 0 });

      tl.to(domCells, {
        opacity: (i) => (frozenIndicesRef.current.has(i) ? 0.4 : 1),
        duration: 0.6,
        stagger: {
          each: 0.006,
          from: "random",
        },
        ease: "expo.out",
      });

      tl.to(
        colorCells,
        {
          opacity: (i) => (frozenIndicesRef.current.has(i) ? 0.7 : 0),
          duration: 0.6,
          stagger: {
            each: 0.006,
            from: "random",
          },
          ease: "expo.out",
        },
        0
      );
    } else {
      if (hoverTimeline.current) {
        hoverTimeline.current.kill();
      }
      gsap.killTweensOf(domCells);
      gsap.killTweensOf(colorCells);

      gsap.to(domCells, {
        opacity: 1,
        duration: 0.4,
        stagger: { each: 0.005, from: "random" },
        ease: "power2.out",
      });
      gsap.to(colorCells, {
        opacity: 0,
        duration: 0.4,
        stagger: { each: 0.005, from: "random" },
        ease: "power2.out",
      });

      frozenIndicesRef.current = new Set();
    }

    return () => {
      if (hoverTimeline.current) hoverTimeline.current.kill();
      gsap.killTweensOf(domCells);
      gsap.killTweensOf(colorCells);
    };
  }, [cells, isHovered]);

  return (
    <div
      className={`${styles.maskWrapper} ${className}`}
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
    >
      <svg
        className={styles.svgMask}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid slice"
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

        <g>
          {cells.map((cell, idx) => (
            <rect
              key={`bg-rect-${cell.id}`}
              ref={(el) => {
                coloredCellsRef.current[idx] = el;
              }}
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              fill="white" // Initial fill, will be updated by GSAP on hover
              shapeRendering="crispEdges"
              style={{ opacity: 0 }}
            />
          ))}
        </g>

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
