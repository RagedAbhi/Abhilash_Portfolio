"use client";

import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LenisContext } from "@/hooks/useLenis";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });
    // Lenis is an imperative external resource: it must be created here (client-only,
    // needs cleanup on unmount) and exposed reactively so descendants can react once
    // it exists — the textbook justified case for a setState call inside an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const unsubscribeScroll = instance.on("scroll", ScrollTrigger.update);

    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        instance.resize();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(onTick);
      unsubscribeScroll();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
