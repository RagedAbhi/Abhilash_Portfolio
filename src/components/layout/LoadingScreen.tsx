"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/hooks/useLenis";
import { useSiteStore } from "@/lib/store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buildSplitReveal } from "@/lib/animations/splitReveal";
import { ease } from "@/lib/animations/easing";

const SESSION_KEY = "portfolio-intro-played";

export function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();
  const setLoadingComplete = useSiteStore((state) => state.setLoadingComplete);
  const [dismissed, setDismissed] = useState(false);

  // Lock scroll for as long as this is visible, independent of exactly when the
  // Lenis instance becomes available relative to this component's own mount.
  useEffect(() => {
    if (!lenis || dismissed) return;
    lenis.stop();
    return () => {
      lenis.start();
    };
  }, [lenis, dismissed]);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const alreadyPlayed = sessionStorage.getItem(SESSION_KEY);
      if (alreadyPlayed) {
        setLoadingComplete(true);
        setDismissed(true);
        return;
      }

      const counter = { value: 0 };

      const finish = () => {
        setLoadingComplete(true);
        gsap.to(containerRef.current, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.7,
          ease: ease.exit,
          onComplete: () => {
            sessionStorage.setItem(SESSION_KEY, "1");
            setDismissed(true);
          },
        });
      };

      if (reducedMotion || !nameRef.current) {
        finish();
        return;
      }

      gsap.set(containerRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(barRef.current, { scaleX: 0 });

      const { timeline: nameTl, revert: revertName } = buildSplitReveal(nameRef.current, {
        type: "chars",
        stagger: 0.025,
        duration: 0.9,
        easeName: ease.entrance,
        yPercent: 100,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          revertName();
          finish();
        },
      });
      tl.add(nameTl, 0);
      tl.to(
        counter,
        {
          value: 100,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(counter.value));
            }
            gsap.set(barRef.current, { scaleX: counter.value / 100 });
          },
        },
        0,
      );
    },
    { scope: containerRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  if (dismissed) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-between bg-bg px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="flex w-full items-end justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">
          Loading
        </span>
        <span className="font-mono text-sm text-fg">
          <span ref={countRef}>0</span>%
        </span>
      </div>
      <div
        ref={nameRef}
        className="font-display text-[12vw] font-medium leading-none tracking-tight text-fg sm:text-[6vw]"
      >
        AK
      </div>
      <div className="w-full overflow-hidden">
        <div ref={barRef} className="h-px w-full origin-left bg-accent" />
      </div>
    </div>
  );
}
