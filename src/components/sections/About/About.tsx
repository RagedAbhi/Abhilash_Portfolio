"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { buildAboutScrub } from "./About.animations";

interface AboutProps {
  beats: string[];
}

// Each beat sits in a different slice of a 12-column grid rather than a single
// stacked column — an asymmetric, staggered composition so the section reads
// as a designed page rather than a wall of paragraphs.
const layoutClasses = [
  "md:col-start-1 md:col-span-7",
  "md:col-start-6 md:col-span-7",
  "md:col-start-2 md:col-span-7",
  "md:col-start-5 md:col-span-8",
];

export function About({ beats: aboutBeats }: AboutProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const beats = beatRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      if (!beats.length) return;
      buildAboutScrub(beats, reducedMotion);
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-screen flex-col justify-center overflow-x-hidden px-6 py-20 sm:px-10"
    >
      <span className="mb-10 block font-mono text-base uppercase tracking-widest text-accent sm:text-xl">
        02 — About
      </span>
      <div className="relative mx-auto w-full max-w-6xl">
        {/* Marked for TimelineBridge, which measures this box's edges to draw
            the single line that runs through here and into Experience below —
            no line is drawn by this component itself. */}
        <div data-timeline-node="formation" className="relative">
          <div className="grid grid-cols-1 gap-y-10 sm:pl-10 md:grid-cols-12 md:gap-x-8 md:gap-y-14">
            {aboutBeats.map((beat, index) => (
              <div
                key={beat}
                ref={(el) => {
                  beatRefs.current[index] = el;
                }}
                className={cn("flex gap-4 sm:gap-6", layoutClasses[index % layoutClasses.length])}
              >
                <span className="shrink-0 pt-0.5 font-mono text-xs text-accent sm:pt-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-display text-lg leading-snug text-fg sm:text-2xl">{beat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
