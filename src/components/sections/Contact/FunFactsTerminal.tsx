"use client";

import { useEffect, useRef, useState } from "react";
import type { FunFact } from "@/lib/keystatic/content";
import { useSiteStore } from "@/lib/store";
import { pickRandomFact } from "./FunFactCards.animations";

// Real form controls and links keep their own native Enter/Space behavior —
// the section-wide Enter shortcut below steps aside for these rather than
// hijacking, e.g., Enter inside the message textarea (a newline) or Enter on
// the focused Send Message button (form submit).
const NATIVE_KEY_HANDLERS = /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/;

// Design candidate 2 — a small terminal window instead of a card or tag
// list, leaning into the site's own developer-portfolio identity. Clicking
// the prompt line draws a random fact (never repeating whatever's currently
// shown) and types it out character-by-character with a plain interval —
// no new dependency, since GSAP's TextPlugin isn't a free/installed plugin
// and a manual interval is simpler for a one-off typewriter effect anyway.
export function FunFactsTerminal({
  facts,
  reducedMotion,
}: {
  facts: FunFact[];
  reducedMotion: boolean;
}) {
  const [factIndex, setFactIndex] = useState<number | null>(null);
  const [typedLength, setTypedLength] = useState(0);
  const timerRef = useRef<number | null>(null);
  // "invitation" is Contact's own chapter id (see src/lib/chapters.ts) — the
  // same signal the navbar's active link and the accent color already use to
  // mean "the visitor is in this section", reused here rather than a new,
  // separately-computed viewport check.
  const activeSection = useSiteStore((state) => state.activeSection);

  const run = () => {
    const next = pickRandomFact(facts.length, factIndex);
    const text = facts[next].text;
    setFactIndex(next);

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (reducedMotion) {
      setTypedLength(text.length);
      return;
    }
    setTypedLength(0);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 1;
      setTypedLength(i);
      if (i >= text.length && timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 18);
  };

  // Always-fresh indirection so the effect below can call the latest `run`
  // (which closes over `factIndex`/`reducedMotion`) without needing either
  // as a dependency — those change on every keystroke of the typewriter, and
  // re-subscribing a window listener that often would be wasteful churn.
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  // A section-wide shortcut, not just an on-card one: Enter draws a new fact
  // as long as Contact is the active chapter, regardless of what (if
  // anything) has focus — requested explicitly, since requiring the card
  // itself to be focused first was easy to miss.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || activeSection !== "invitation") return;
      const target = event.target as HTMLElement | null;
      if (target && NATIVE_KEY_HANDLERS.test(target.tagName)) return;
      runRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSection]);

  const fact = factIndex !== null ? facts[factIndex] : null;
  const displayedText = fact ? fact.text.slice(0, typedLength) : "";
  const isTyping = fact ? typedLength < fact.text.length : false;

  return (
    // The whole card is the click target (not just the prompt line) — and,
    // via the section-wide Enter shortcut above, doesn't even need focus.
    // tabIndex/role/aria-label keep it a real, discoverable control for
    // keyboard/screen-reader users who reach it by Tab rather than Enter.
    <div
      role="button"
      tabIndex={0}
      onClick={run}
      onKeyDown={(event) => {
        // Space only — Enter is handled once, section-wide, above; handling
        // it again here on top of that would draw two facts per press.
        if (event.key === " ") {
          event.preventDefault();
          run();
        }
      }}
      data-cursor="accent"
      aria-label="Show another fun fact"
      className="w-[260px] cursor-pointer rounded-xl border border-fg/10 bg-bg-elevated p-4 font-mono text-[11px] shadow-[8px_24px_45px_-10px_rgba(0,0,0,0.55)] outline-none transition-colors hover:border-accent/40 focus-visible:border-accent"
    >
      <div className="mb-3 flex items-center gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-fg/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-fg/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-fg/10" />
      </div>
      <p className="text-fg-muted">
        <span className="text-accent">$</span> fun_fact --random
      </p>
      {fact && (
        <p className="mt-3 leading-relaxed text-fg">
          <span className="mr-1">{fact.emoji}</span>
          {displayedText}
          {isTyping && <span className="animate-pulse text-accent">▍</span>}
        </p>
      )}
    </div>
  );
}
