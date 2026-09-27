"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useSiteStore, type CursorVariant } from "@/lib/store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface VariantStyle {
  scale: number;
  accent: boolean;
}

// A single small dot, no trailing ring — the dot itself is the only cursor
// feedback; hovering something interactive just grows/tints it. Everything
// else (link/button/card hover states) is left to the element itself, which
// already has its own hover styling across the site.
const variantStyles: Record<CursorVariant, VariantStyle> = {
  default: { scale: 1, accent: false },
  link: { scale: 1.6, accent: false },
  accent: { scale: 1.6, accent: true },
  drag: { scale: 2.2, accent: true },
};

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const cursorVariant = useSiteStore((state) => state.cursorVariant);
  const setCursorVariant = useSiteStore((state) => state.setCursorVariant);
  const reducedMotion = useReducedMotion();
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const enabled = !isCoarsePointer && !reducedMotion;

  // Hide the native cursor only while our custom one is actually rendering, so
  // touch/reduced-motion visitors (who get null below) keep the real cursor.
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("cursor-hidden");
    return () => {
      document.documentElement.classList.remove("cursor-hidden");
    };
  }, [enabled]);

  // useLayoutEffect (not useEffect) so the dot is centered and scaled down to
  // its resting size before the browser paints — otherwise it renders for one
  // frame at its raw, unstyled size (8px, pinned to the page's top-left
  // corner) before this ever runs, which shows up as a stray dot in that corner.
  useLayoutEffect(() => {
    if (!enabled || !dotRef.current) return;
    gsap.set(dotRef.current, { xPercent: -50, yPercent: -50, scale: variantStyles.default.scale });
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !dotRef.current) return;
    const dot = dotRef.current;

    const moveDotX = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3" });

    const onMove = (event: PointerEvent) => {
      moveDotX(event.clientX);
      moveDotY(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement)?.closest("[data-cursor]");
      const variant = target?.getAttribute("data-cursor");
      setCursorVariant(
        variant === "link" || variant === "accent" || variant === "drag" ? variant : "default",
      );
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, [enabled, setCursorVariant]);

  useEffect(() => {
    if (!enabled || !dotRef.current) return;
    gsap.to(dotRef.current, {
      scale: variantStyles[cursorVariant].scale,
      duration: 0.25,
      ease: "power3.out",
    });
  }, [cursorVariant, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[90] rounded-full transition-colors duration-200",
        variantStyles[cursorVariant].accent ? "bg-accent" : "bg-fg",
      )}
      style={{ width: 8, height: 8 }}
    />
  );
}
