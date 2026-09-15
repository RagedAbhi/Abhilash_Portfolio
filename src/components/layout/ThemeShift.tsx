"use client";

import { useEffect, useLayoutEffect } from "react";
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

  // useLayoutEffect (not useEffect) so the initial-chapter resolution below
  // applies before the browser paints — otherwise a hard refresh mid-page
  // would flash the default first-chapter accent for a frame before
  // snapping to the correct one.
  useLayoutEffect(() => {
    const activate = (chapter: Chapter, animate = true) => {
      setActiveSection(chapter.id);
      const targetColor = getComputedStyle(document.documentElement)
        .getPropertyValue(chapter.accentVar)
        .trim();
      if (animate) {
        gsap.to(document.documentElement, {
          "--accent": targetColor,
          duration: 0.6,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      } else {
        gsap.set(document.documentElement, { "--accent": targetColor });
      }
    };

    // "Projects" is a chapter of its own but its section lives nested inside
    // Proof's own DOM element (Experience/Skills/Projects all share
    // <section id="proof">), so the two chapters' scroll ranges overlap —
    // Proof's range spans the whole section, Projects' a sub-range near the
    // end of it. Resolved by checking each chapter element's own live
    // layout against the same "top 60% / bottom 60%" activation zone the
    // triggers below use, preferring the LAST chapter (in array order)
    // whose range currently contains that line — rather than trusting the
    // ScrollTriggers' own isActive flags, which don't hold up here: ANY
    // other component's ScrollTrigger being created elsewhere on the page
    // (TimelineBridge, ProjectsFoxBridge, Skills, a window resize, etc.)
    // triggers a global ScrollTrigger.refresh() that recalculates every
    // trigger's start/end and re-evaluates them all, and during that churn
    // it's possible for the wrong one (or none at all) to report isActive
    // for a moment — which would otherwise repeatedly snap the accent to
    // the wrong chapter regardless of actual scroll position. Recomputing
    // straight from getBoundingClientRect every time sidesteps that
    // internal-state staleness entirely, and also covers a hard refresh or
    // direct/anchor navigation that loads the page already scrolled deep
    // in — where onEnter/onLeave never fire in the first place, since they
    // only trigger on a scroll-driven state CHANGE, never just because the
    // current position happens to already satisfy one.
    const resolveActiveChapter = (): Chapter => {
      const activationLine = window.innerHeight * 0.6;
      for (let i = chapters.length - 1; i >= 0; i--) {
        const el = document.getElementById(chapters[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= activationLine && rect.bottom >= activationLine) return chapters[i];
      }
      return chapters[0];
    };
    const onBoundaryCross = () => activate(resolveActiveChapter());

    // These triggers are used purely as trip-wires to know WHEN to
    // re-resolve (their own onEnter/onLeave/etc. firing at all is the
    // signal) — the actual answer always comes from resolveActiveChapter's
    // own fresh layout read above, never from these triggers' internal state.
    const triggers: (ScrollTrigger | null)[] = [];
    chapters.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (!el) {
        triggers.push(null);
        return;
      }
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: onBoundaryCross,
          onEnterBack: onBoundaryCross,
          onLeave: onBoundaryCross,
          onLeaveBack: onBoundaryCross,
        }),
      );
    });

    // Applies the correct starting chapter immediately — instant, not
    // tweened, since this establishes initial state rather than reacting
    // to a scroll.
    activate(resolveActiveChapter(), false);

    return () => {
      triggers.forEach((trigger) => trigger?.kill());
    };
  }, [setActiveSection]);

  return null;
}
