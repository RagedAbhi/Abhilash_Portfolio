"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { SkillGroup } from "@/lib/keystatic/content";
import { buildSkillsReveal, buildSkillsFoxGuide } from "./Skills.animations";
import { FoxIcon } from "@/components/ui/FoxIcon";

export function Skills({ groups: skills }: { groups: SkillGroup[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barWrapRef = useRef<HTMLDivElement>(null);
  const foxGroupRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;
      buildSkillsReveal(sectionRef.current, trackRef.current, reducedMotion);
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current || !barWrapRef.current || !foxGroupRef.current) return;
      return buildSkillsFoxGuide(
        {
          section: sectionRef.current,
          track: trackRef.current,
          barWrap: barWrapRef.current,
          foxGroup: foxGroupRef.current,
        },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  // Click-and-drag scrolling for mouse users (touch/trackpad already scroll
  // natively). Pointer capture is deferred until actual movement is detected
  // (not on pointerdown) so it never interferes with clicking anything inside
  // the track — the same fix Projects' gallery needed.
  const drag = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false, pointerId: 0 });

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
      pointerId: event.pointerId,
    };
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    const delta = event.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(delta) > 4) {
      drag.current.moved = true;
      track.setPointerCapture(drag.current.pointerId);
    }
    if (drag.current.moved) {
      track.scrollLeft = drag.current.startScrollLeft - delta;
    }
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const track = trackRef.current;
    drag.current.active = false;
    if (track && drag.current.moved) track.releasePointerCapture(event.pointerId);
  };

  return (
    <div ref={sectionRef} className="relative overflow-x-hidden px-6 py-24 sm:px-10">
      <span className="mb-16 block font-mono text-base uppercase tracking-widest text-fg sm:text-xl">
        Skills
      </span>

      <div ref={barWrapRef} aria-hidden className="relative mb-6 hidden h-12 sm:block">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-fg/10" />
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width="100%" height="100%">
          <g ref={foxGroupRef} style={{ color: "var(--accent)" }}>
            <FoxIcon />
          </g>
        </svg>
      </div>

      <div
        ref={trackRef}
        data-cursor="drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="flex cursor-grab select-none gap-10 overflow-x-auto pb-4 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {skills.map((group) => (
          <div key={group.category} className="flex w-[260px] flex-shrink-0 flex-col gap-6 sm:w-[300px]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-fg-muted">
              {group.category}
            </h3>
            <ul className="flex flex-col gap-3">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className="border-b border-fg/5 pb-3 font-display text-2xl text-fg sm:text-3xl"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
