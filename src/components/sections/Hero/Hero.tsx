"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSiteStore } from "@/lib/store";
import type { SiteMeta } from "@/lib/keystatic/content";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ArrowDownIcon } from "@/components/ui/icons";
import {
  setHeroInitialState,
  playHeroEntrance,
  buildHeroExitScrub,
  buildHeroAmbientBackground,
} from "./Hero.animations";

interface HeroProps {
  site: SiteMeta;
}

export function Hero({ site }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const glowWrapperRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const portraitInnerRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();
  const loadingComplete = useSiteStore((state) => state.loadingComplete);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !backgroundRef.current ||
        !glowWrapperRef.current ||
        !glowRef.current ||
        !headlineRef.current ||
        !subtextRef.current ||
        !portraitRef.current ||
        !portraitInnerRef.current ||
        !scrollCueRef.current
      ) {
        return;
      }
      const refs = {
        section: sectionRef.current,
        background: backgroundRef.current,
        glowWrapper: glowWrapperRef.current,
        glow: glowRef.current,
        headline: headlineRef.current,
        subtext: subtextRef.current,
        portrait: portraitRef.current,
        portraitInner: portraitInnerRef.current,
        scrollCue: scrollCueRef.current,
      };
      setHeroInitialState(refs, reducedMotion);
      buildHeroExitScrub(refs, reducedMotion);
      return buildHeroAmbientBackground(refs, reducedMotion);
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (!loadingComplete) return;
      if (
        !sectionRef.current ||
        !backgroundRef.current ||
        !glowWrapperRef.current ||
        !glowRef.current ||
        !headlineRef.current ||
        !subtextRef.current ||
        !portraitRef.current ||
        !portraitInnerRef.current ||
        !scrollCueRef.current
      ) {
        return;
      }
      const refs = {
        section: sectionRef.current,
        background: backgroundRef.current,
        glowWrapper: glowWrapperRef.current,
        glow: glowRef.current,
        headline: headlineRef.current,
        subtext: subtextRef.current,
        portrait: portraitRef.current,
        portraitInner: portraitInnerRef.current,
        scrollCue: scrollCueRef.current,
      };
      const { revert } = playHeroEntrance(refs, reducedMotion);
      return revert;
    },
    { scope: sectionRef, dependencies: [loadingComplete, reducedMotion], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      id="arrival"
      className="relative flex h-screen w-full items-center overflow-hidden bg-bg"
    >
      <div
        ref={backgroundRef}
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--bg-elevated),_var(--bg)_65%)]"
      >
        <div
          ref={glowWrapperRef}
          className="absolute"
          style={{ top: "-10vw", right: "-10vw", width: "56vw", height: "56vw" }}
        >
          <div
            ref={glowRef}
            data-hero-glow
            className="absolute inset-0 rounded-full bg-accent/10 blur-[200px]"
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-col gap-6 px-6 sm:px-10">
        <h1
          ref={headlineRef}
          className="max-w-2xl text-balance font-display text-[14vw] font-medium leading-[0.92] tracking-tight text-fg sm:text-[8vw]"
        >
          {site.name}
        </h1>
        <div ref={subtextRef} className="flex max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-sm uppercase tracking-widest text-fg-muted sm:text-base">
              {site.role}
            </p>
            {site.subline && (
              <p className="max-w-lg text-lg leading-snug text-fg/80 sm:text-xl">{site.subline}</p>
            )}
          </div>
          <SocialLinks socials={site.socials} />
        </div>
      </div>

      <a
        ref={scrollCueRef}
        href="#formation"
        data-cursor="link"
        className="group absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2 sm:bottom-10"
      >
        <span
          data-scroll-label
          className="font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors group-hover:text-accent"
        >
          Scroll to continue
        </span>
        <span data-scroll-arrow className="block">
          <ArrowDownIcon className="h-4 w-4 text-fg-muted transition-colors group-hover:text-accent" />
        </span>
      </a>

      {/* Positioned relative to the section and anchored past its own right edge,
          so it bleeds off the right side of the screen instead of staying boxed
          inside the content column — clipped by the section's own overflow-hidden. */}
      {/* Static measurement target for TimelineBridge's panda hand-off — a
          never-transformed twin of the portrait box's own static geometry,
          since portraitRef itself is a live GSAP target (parallax, entrance,
          exit) whose rendered rect moves and can't be used for measurement. */}
      <div
        data-timeline-node="portrait"
        aria-hidden
        className="pointer-events-none absolute bottom-0 hidden h-[92vh] sm:block"
        style={{ width: "48vw", right: "-6vw" }}
      />

      <div
        ref={portraitRef}
        data-hero-portrait
        aria-hidden
        className="pointer-events-none absolute bottom-0 hidden h-[92vh] sm:block"
        style={{ width: "48vw", right: "-6vw" }}
      >
        {/* Load-entrance target only — see portraitInner in Hero.animations.ts.
            The outer box above stays reserved for TimelineBridge's scroll flight. */}
        <div ref={portraitInnerRef} className="absolute inset-0">
          <div className="absolute inset-0 scale-150 rounded-full bg-accent/35 blur-[110px]" />
          {site.portrait.src && (
            <Image
              src={site.portrait.src}
              alt={site.portrait.alt}
              fill
              sizes="48vw"
              className="object-contain object-bottom"
            />
          )}
        </div>
      </div>
    </section>
  );
}
