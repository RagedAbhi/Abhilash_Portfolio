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
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-12">
        <div className="relative min-w-0 flex-1">
          <span className="mb-8 block font-mono text-xs uppercase tracking-widest text-fg-muted">
            02 — Formation
          </span>
          <div className="relative min-h-[260px] max-w-2xl sm:min-h-[200px]">
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

        <div
          ref={parallaxRef}
          aria-hidden
          className="pointer-events-none relative hidden h-[82vh] flex-shrink-0 sm:block"
          style={{ width: "26vw" }}
        >
          <div className="absolute inset-0 scale-125 rounded-full bg-accent/20 blur-[100px]" />
          {portrait.src && (
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="26vw"
              className="object-contain object-bottom"
            />
          )}
        </div>
      </div>
    </div>
  );
}
