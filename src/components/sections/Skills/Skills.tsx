"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { SkillGroup } from "@/lib/keystatic/content";
import { buildSkillsScrub } from "./Skills.animations";
import { cn } from "@/lib/utils";

export function Skills({ groups: skills }: { groups: SkillGroup[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;
      return buildSkillsScrub(
        { section: sectionRef.current, track: trackRef.current },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative overflow-x-auto",
        // The JS-driven pin+scrub is skipped under reduced motion, so the desktop
        // "pinned viewport" layout must fall back to native horizontal scroll too —
        // otherwise panels beyond the first would be clipped by overflow-hidden with
        // no way to reach them.
        !reducedMotion && "md:h-screen md:overflow-hidden",
      )}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex gap-16 px-6 py-24 sm:px-10",
          !reducedMotion && "md:h-full md:items-center md:py-0",
        )}
      >
        {skills.map((group) => (
          <div key={group.category} className="flex w-[70vw] flex-shrink-0 flex-col gap-6 sm:w-[38vw] md:w-[26vw]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-fg-muted">
              {group.category}
            </h3>
            <ul className="flex flex-col gap-3">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-3 font-display text-2xl text-fg sm:text-3xl"
                >
                  <span>{item.name}</span>
                  {item.level && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                      {item.level}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
