"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSiteStore } from "@/lib/store";
import type { SiteMeta } from "@/lib/keystatic/content";
import { SocialLinks } from "@/components/ui/SocialLinks";
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
        !subtextRef.current
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
        !subtextRef.current
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
      className="relative flex h-screen w-full items-end overflow-hidden bg-bg"
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
      <div className="relative z-10 flex w-full flex-col gap-8 px-6 pb-16 sm:px-10 sm:pb-24">
        <h1
          ref={headlineRef}
          className="max-w-5xl text-balance font-display text-[13vw] font-medium leading-[0.92] tracking-tight text-fg sm:text-[9vw]"
        >
          {site.tagline}
        </h1>
        <div ref={subtextRef} className="flex flex-col gap-6">
          <p className="max-w-lg font-sans text-base text-fg-muted sm:text-lg">
            {site.subline}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-4">
              <p className="font-sans text-sm text-fg-muted sm:text-base">
                {site.name} — {site.role}
              </p>
              <SocialLinks socials={site.socials} />
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-fg-muted">
                <a
                  href="#projects"
                  data-cursor="link"
                  className="transition-colors hover:text-accent"
                >
                  See the work ↓
                </a>
                <span className="text-fg-muted/30">/</span>
                <a
                  href="#contact"
                  data-cursor="link"
                  className="transition-colors hover:text-accent"
                >
                  Say hello ↓
                </a>
              </div>
              <a
                href="#formation"
                data-cursor="link"
                className="font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-accent"
              >
                Scroll to continue
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
