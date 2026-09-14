"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Geometry {
  top: number;
  height: number;
  width: number;
  jogY: number;
  d: string;
}

// The single timeline line that runs through both Formation (About) and Proof
// (Experience): straight down the Formation margin, one clean bend, straight
// down the Proof centerline. Drawn as one continuous path — rendered here,
// not as separate line elements in either section — so there's no seam where
// two differently-rendered lines would otherwise meet.
export function TimelineBridge() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const measure = () => {
      const formation = document.querySelector('[data-timeline-node="formation"]');
      const proof = document.querySelector('[data-timeline-node="proof"]');
      if (!formation || !proof) {
        setGeometry(null);
        return;
      }
      const formationRect = formation.getBoundingClientRect();
      const proofRect = proof.getBoundingClientRect();
      if (formationRect.width === 0 || proofRect.width === 0) {
        setGeometry(null);
        return;
      }

      const fromX = formationRect.left;
      const toX = proofRect.left + proofRect.width / 2;
      const top = formationRect.top + window.scrollY;
      const formationBottom = formationRect.bottom + window.scrollY - top;
      const proofBottom = Math.max(formationBottom, proofRect.bottom + window.scrollY - top);
      // Clear the last beat's text before jogging across, rather than cutting
      // the corner right at its bottom edge.
      const jogY = Math.min(formationBottom + 48, proofBottom);

      // Sized to just clear the line's own two x-positions — not the full
      // viewport width (100vw/w-screen includes the scrollbar gutter on many
      // browsers, which was pushing the whole page into horizontal overflow).
      const width = Math.max(fromX, toX) + 40;

      // Straight down, one right-angle jog over to the Proof centerline, straight
      // down again — no diagonal.
      setGeometry({
        top,
        height: proofBottom,
        width,
        jogY,
        d: `M ${fromX} 0 L ${fromX} ${jogY} L ${toX} ${jogY} L ${toX} ${proofBottom}`,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    // Layout settles a beat after fonts/images resolve — re-measure once more.
    const settle = window.setTimeout(measure, 1000);

    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(settle);
    };
  }, []);

  useGSAP(
    () => {
      if (!geometry || !pathRef.current || !svgRef.current) return;
      const path = pathRef.current;
      const length = path.getTotalLength();

      if (reducedMotion) {
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
        return;
      }

      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: svgRef.current,
          start: "top 85%",
          end: "bottom 70%",
          scrub: true,
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === svgRef.current) trigger.kill();
        });
      };
    },
    { dependencies: [geometry, reducedMotion], revertOnUpdate: true },
  );

  if (!geometry) return null;

  const { top, height, width, jogY, d } = geometry;
  // Hold each chapter's own color for most of its run and swap quickly right
  // around the jog, instead of blending gradually over the whole line. Stop
  // offsets are always fractions of the gradient vector (0-1), even with
  // gradientUnits="userSpaceOnUse" — they don't take raw pixel values.
  const TRANSITION_SPAN = 40;
  const transitionStart = Math.max(0, jogY - TRANSITION_SPAN) / height;
  const transitionEnd = Math.min(height, jogY + TRANSITION_SPAN) / height;

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute left-0 hidden sm:block"
      style={{ top, height, width }}
    >
      <defs>
        <linearGradient
          id="timeline-bridge-gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={height}
        >
          <stop offset={0} stopColor="var(--accent-formation)" />
          <stop offset={transitionStart} stopColor="var(--accent-formation)" />
          <stop offset={transitionEnd} stopColor="var(--accent-proof)" />
          <stop offset={1} stopColor="var(--accent-proof)" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="url(#timeline-bridge-gradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
