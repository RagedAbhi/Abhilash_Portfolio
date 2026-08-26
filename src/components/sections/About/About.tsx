"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { MediaAsset } from "@/lib/keystatic/content";
import { buildAboutScrub } from "./About.animations";

interface AboutProps {
  beats: string[];
  portrait: MediaAsset;
}

export function About({ beats: aboutBeats, portrait }: AboutProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || !parallaxRef.current) return;
      const beats = beatRefs.current.filter((el): el is HTMLParagraphElement => Boolean(el));
      if (!beats.length) return;
      buildAboutScrub(
        { section: sectionRef.current, beats, parallax: parallaxRef.current },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div ref={sectionRef} className="relative flex h-screen items-center overflow-hidden px-6 sm:px-10">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="relative z-10 flex min-h-[260px] max-w-2xl flex-col justify-center sm:min-h-[200px]">
          <span className="mb-8 block font-mono text-xs uppercase tracking-widest text-fg-muted">
            02 — Formation
          </span>
          <div className="relative">
            {aboutBeats.map((beat, index) => (
              <p
                key={beat}
                ref={(el) => {
                  beatRefs.current[index] = el;
                }}
                className="absolute inset-0 font-display text-2xl leading-snug text-fg sm:text-4xl"
              >
                {beat}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Positioned relative to the full-width section (not the max-w-6xl text
          column) and anchored past the section's own right edge, so it bleeds off
          the right side of the screen instead of staying boxed inside the content
          column — clipped by the section's own overflow-hidden. */}
      <div
        ref={parallaxRef}
        aria-hidden
        className="pointer-events-none absolute bottom-0 hidden h-[94vh] sm:block"
        style={{ width: "48vw", right: "-6vw" }}
      >
        <div className="absolute inset-0 scale-125 rounded-full bg-accent/20 blur-[100px]" />
        {portrait.src && (
          <>
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="48vw"
              className="object-contain object-bottom grayscale"
            />
            {/* Duotone tint: a solid accent-colored layer, masked to the portrait's
                own alpha shape so only the visible photo (not the transparent PNG
                padding) is colorized, blended over the grayscale image above via
                mix-blend-color. Uses the live --accent variable directly (not a
                static filter) so it stays in sync with the site's existing
                per-chapter/per-theme accent system instead of a hardcoded hue.
                Opacity kept low so the tint reads as a faded wash, not a flat color. */}
            <div
              className="absolute inset-0 bg-accent opacity-40 mix-blend-color"
              style={{
                WebkitMaskImage: `url(${portrait.src})`,
                maskImage: `url(${portrait.src})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "bottom",
                maskPosition: "bottom",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
