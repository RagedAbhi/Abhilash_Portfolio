"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ExperienceEntry } from "@/lib/keystatic/content";
import { buildExperienceScrub } from "./Experience.animations";

function formatRange(start: string, end: string) {
  return `${start} — ${end === "present" ? "Present" : end}`;
}

export function Experience({ entries: experience }: { entries: ExperienceEntry[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || !pathRef.current) return;
      const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      if (!cards.length) return;
      buildExperienceScrub(
        { section: sectionRef.current, path: pathRef.current, cards },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div ref={sectionRef} className="relative px-6 py-32 sm:px-10">
      <span className="mb-16 block font-mono text-xs uppercase tracking-widest text-fg-muted">
        03 — Proof
      </span>
      <div className="relative mx-auto max-w-4xl">
        <svg
          aria-hidden
          className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 overflow-visible sm:block"
          viewBox="0 0 2 1000"
          preserveAspectRatio="none"
        >
          <path
            ref={pathRef}
            d="M1,0 L1,1000"
            stroke="var(--accent)"
            strokeWidth="2"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="flex flex-col gap-20">
          {experience.map((entry, index) => (
            <div
              key={entry.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`relative sm:w-[45%] ${
                index % 2 === 0 ? "sm:mr-auto sm:pr-12 sm:text-right" : "sm:ml-auto sm:pl-12"
              }`}
            >
              <span className="block font-mono text-xs uppercase tracking-widest text-fg-muted">
                {formatRange(entry.startDate, entry.endDate)}
              </span>
              <h3 className="mt-3 font-display text-2xl text-fg sm:text-3xl">
                {entry.role} <span className="text-fg-muted">— {entry.company}</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted sm:text-base">
                {entry.summary}
              </p>
              <ul
                className={`mt-4 flex flex-col gap-1.5 text-sm text-fg-muted ${
                  index % 2 === 0 ? "sm:items-end" : ""
                }`}
              >
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
