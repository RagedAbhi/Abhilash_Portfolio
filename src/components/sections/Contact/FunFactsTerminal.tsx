"use client";

import { useEffect, useRef, useState } from "react";
import type { FunFact } from "@/lib/keystatic/content";
import { pickRandomFact } from "./FunFactCards.animations";

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

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

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

  const fact = factIndex !== null ? facts[factIndex] : null;
  const displayedText = fact ? fact.text.slice(0, typedLength) : "";
  const isTyping = fact ? typedLength < fact.text.length : false;

  return (
    <div className="w-[260px] rounded-xl border border-fg/10 bg-bg-elevated p-4 font-mono text-[11px] shadow-[8px_24px_45px_-10px_rgba(0,0,0,0.55)]">
      <div className="mb-3 flex items-center gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-fg/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-fg/10" />
        <span className="h-2.5 w-2.5 rounded-full bg-fg/10" />
      </div>
      <button type="button" onClick={run} className="block w-full text-left text-fg-muted">
        <span className="text-accent">$</span> fun_fact --random
      </button>
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
