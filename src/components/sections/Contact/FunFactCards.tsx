"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { FunFact } from "@/lib/keystatic/content";
import { FoxIcon } from "@/components/ui/FoxIcon";
import { buildFunFactCardsReveal, flipCard } from "./FunFactCards.animations";

interface SlotState {
  flipped: boolean;
  factIndex: number | null;
}

// Module-level (not defined inside the component) so the lint rule against
// impure calls "during render" doesn't flag Math.random — this is a plain
// helper only ever invoked from the click handler, never during render.
function pickRandomFact(length: number, excludeIndex: number | null): number {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  while (next === excludeIndex) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

// A small fanned stack of face-down cards, tucked in Contact's corner —
// click one and it flips (3D) to reveal a random fun fact pulled from
// Keystatic. Click again to flip it back; clicking a face-down card again
// after that draws a fresh (different) fact. Reuses the exact card-shell
// styling already established for Projects' cover images, so it reads as
// "the same kind of card" the rest of the site already uses.
export function FunFactCards({ facts }: { facts: FunFact[] }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flipperRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const foxGroupRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();

  const slotCount = Math.min(3, facts.length);
  const [slots, setSlots] = useState<SlotState[]>(() =>
    Array.from({ length: slotCount }, () => ({ flipped: false, factIndex: null })),
  );

  useGSAP(
    () => {
      if (!stackRef.current) return;
      const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      if (!cards.length) return;
      return buildFunFactCardsReveal(
        { stack: stackRef.current, cards, foxGroup: foxGroupRef.current },
        reducedMotion,
      );
    },
    { scope: stackRef, dependencies: [reducedMotion, slotCount], revertOnUpdate: true },
  );

  if (slotCount === 0) return null;

  const handleClick = (slotIndex: number) => {
    const flipper = flipperRefs.current[slotIndex];
    if (!flipper) return;
    const slot = slots[slotIndex];
    const goingToFront = !slot.flipped;
    flipCard(flipper, goingToFront, reducedMotion);
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        flipped: goingToFront,
        factIndex: goingToFront ? pickRandomFact(facts.length, slot.factIndex) : slot.factIndex,
      };
      return next;
    });
  };

  return (
    <div className="relative hidden sm:block">
      {/* Hovers back and forth above the stack — see FunFactCards.animations.ts
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
        Draw a card
      </span>
      <div ref={stackRef} className="flex">
        {slots.map((slot, i) => {
          const fact = slot.factIndex !== null ? facts[slot.factIndex] : null;
          return (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="relative h-[144px] w-[102px] [perspective:900px]"
              style={{ marginLeft: i === 0 ? 0 : -34 }}
            >
              <button
                ref={(el) => {
                  flipperRefs.current[i] = el;
                }}
                type="button"
                onClick={() => handleClick(i)}
                aria-label={fact ? `${fact.label} — click to flip back` : "Draw a fun fact"}
                data-cursor="hover"
                className="relative block h-full w-full [transform-style:preserve-3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                {/* Back face — the card's resting design */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border border-fg/10 bg-bg-elevated shadow-[8px_24px_45px_-10px_rgba(0,0,0,0.55)] transition-colors duration-300 hover:border-accent/40 [backface-visibility:hidden]">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-accent/20 blur-xl"
                  />
                  <span className="font-display text-xl text-fg-muted/30">AK</span>
                </div>

                {/* Front face — the revealed fun fact */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-fg/10 bg-bg-elevated p-3 text-center shadow-[8px_24px_45px_-10px_rgba(0,0,0,0.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  {fact && (
                    <>
                      <span className="font-mono text-[8px] uppercase tracking-widest text-accent">
                        {fact.label}
                      </span>
                      <span className="text-2xl leading-none">{fact.emoji}</span>
                      <span className="text-[10px] leading-snug text-fg-muted">{fact.text}</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
