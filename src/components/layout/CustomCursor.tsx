"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useSiteStore, type CursorVariant } from "@/lib/store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface VariantStyle {
  dotScale: number;
  ringScale: number;
  ringOpacity: number;
  label: string | null;
}

const variantStyles: Record<CursorVariant, VariantStyle> = {
  default: { dotScale: 1, ringScale: 0.2, ringOpacity: 0.2, label: null },
  link: { dotScale: 0.4, ringScale: 0.55, ringOpacity: 1, label: null },
  view: { dotScale: 0, ringScale: 1, ringOpacity: 1, label: "View" },
  drag: { dotScale: 0, ringScale: 1, ringOpacity: 1, label: "Drag" },
};

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
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

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    // xPercent/yPercent self-center the elements on the cursor point; GSAP composes
    // these with x/y/scale into one transform, so a plain CSS translate class here
    // would get clobbered the moment a tween first touches the transform.
    gsap.set(dot, { xPercent: -50, yPercent: -50, scale: variantStyles.default.dotScale });
    gsap.set(ring, {
      xPercent: -50,
      yPercent: -50,
      scale: variantStyles.default.ringScale,
      opacity: variantStyles.default.ringOpacity,
    });

    const moveDotX = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3" });
    const moveRingX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    const onMove = (event: PointerEvent) => {
      moveDotX(event.clientX);
      moveDotY(event.clientY);
      moveRingX(event.clientX);
      moveRingY(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement)?.closest("[data-cursor]");
      const variant = target?.getAttribute("data-cursor");
      setCursorVariant(
        variant === "link" || variant === "view" || variant === "drag" ? variant : "default",
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
    if (!enabled || !dotRef.current || !ringRef.current) return;
    const style = variantStyles[cursorVariant];

    gsap.to(dotRef.current, { scale: style.dotScale, duration: 0.25, ease: "power3.out" });
    gsap.to(ringRef.current, {
      scale: style.ringScale,
      opacity: style.ringOpacity,
      duration: 0.25,
      ease: "power3.out",
    });
    if (labelRef.current) {
      if (style.label) labelRef.current.textContent = style.label;
      gsap.to(labelRef.current, { autoAlpha: style.label ? 1 : 0, duration: 0.2 });
    }
  }, [cursorVariant, enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] mix-blend-difference"
    >
      <div
        ref={ringRef}
        className={cn(
          "absolute left-0 top-0 rounded-full border transition-colors duration-200",
          cursorVariant === "link" ? "border-fg bg-transparent" : "border-transparent bg-fg",
        )}
        style={{ width: 64, height: 64 }}
      >
        <span
          ref={labelRef}
          className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-bg opacity-0"
        />
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 rounded-full bg-fg"
        style={{ width: 8, height: 8 }}
      />
    </div>
  );
}
