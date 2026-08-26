"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSiteStore } from "@/lib/store";
import { chapters, type Chapter } from "@/lib/chapters";

const THEME_STORAGE_KEY = "theme";

export function ThemeShift() {
  const setActiveSection = useSiteStore((state) => state.setActiveSection);
  const theme = useSiteStore((state) => state.theme);

  // The store's initial `theme` value is already read from localStorage at
  // creation time (see src/lib/store.ts), matching what the pre-hydration
  // inline script in layout.tsx applied to the DOM — so this effect's first
  // run just confirms that state, with no separate alignment step needed.
  //
  // Deliberately keyed on `theme` alone (not `activeSection`, read fresh via
  // getState() instead) — this should only fire on an actual toggle. Including
  // activeSection here would also fire on every normal chapter-scroll
  // transition, cutting the smooth animated crossfade below short with an
  // instant snap to the same color.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore (private browsing / storage disabled)
    }

    // Re-sync --accent instantly to the current chapter under the new theme —
    // otherwise toggling mid-chapter would keep showing the old theme's accent
    // color until the next chapter-boundary scroll re-triggers the tween.
    const activeSection = useSiteStore.getState().activeSection;
    const chapter = chapters.find((c) => c.id === activeSection) ?? chapters[0];
    const targetColor = getComputedStyle(document.documentElement)
      .getPropertyValue(chapter.accentVar)
      .trim();
    gsap.set(document.documentElement, { "--accent": targetColor });
  }, [theme]);

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
