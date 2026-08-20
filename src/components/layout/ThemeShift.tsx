"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSiteStore } from "@/lib/store";
import { chapters, type Chapter } from "@/lib/chapters";

export function ThemeShift() {
  const setActiveSection = useSiteStore((state) => state.setActiveSection);

  useEffect(() => {
    const activate = (chapter: Chapter) => {
      setActiveSection(chapter.id);
      const targetColor = getComputedStyle(document.documentElement)
        .getPropertyValue(chapter.accentVar)
        .trim();
      gsap.to(document.documentElement, {
        "--accent": targetColor,
        duration: 0.6,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };

    const triggers = chapters
      .map((chapter) => {
        const el = document.getElementById(chapter.id);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: () => activate(chapter),
          onEnterBack: () => activate(chapter),
        });
      })
      .filter(Boolean);

    return () => {
      triggers.forEach((trigger) => trigger?.kill());
    };
  }, [setActiveSection]);

  return null;
}
