"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { FunFact } from "@/lib/keystatic/content";
import { FoxIcon } from "@/components/ui/FoxIcon";
import { buildFunFactsReveal } from "./FunFactCards.animations";
import { FunFactsTerminal } from "./FunFactsTerminal";

// A small "beyond the code" widget tucked in Contact's corner — a terminal
// window that types out a random fun fact on click — with the fox
// patrolling above it.
export function FunFactCards({ facts }: { facts: FunFact[] }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const foxGroupRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!stackRef.current || !contentRef.current) return;
      return buildFunFactsReveal(
        { stack: stackRef.current, content: contentRef.current, foxGroup: foxGroupRef.current },
        reducedMotion,
      );
    },
    { scope: stackRef, dependencies: [reducedMotion, facts.length], revertOnUpdate: true },
  );

  if (facts.length === 0) return null;

  return (
    <div ref={stackRef} className="relative hidden sm:block">
      {/* Hovers back and forth above the widget — see FunFactCards.animations.ts
          for the patrol/hover tweens; overflow-visible since the fox's own
          head/tail bleed past this small svg's own box at this scale. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-9 left-0 h-9 w-full overflow-visible"
      >
        <g ref={foxGroupRef} style={{ color: "var(--accent)" }}>
          <FoxIcon />
        </g>
      </svg>

      <span className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-fg-muted">
        Beyond the code
      </span>

      <div ref={contentRef}>
        <FunFactsTerminal facts={facts} reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}
