import SplitType from "split-type";
import { gsap } from "@/lib/gsap";
import { ease } from "./easing";

interface SplitRevealOptions {
  type?: "chars" | "words";
  stagger?: number;
  duration?: number;
  easeName?: string;
  yPercent?: number;
  delay?: number;
}

export function buildSplitReveal(
  target: HTMLElement,
  {
    type = "chars",
    stagger = 0.02,
    duration = 1,
    easeName = ease.entrance,
    yPercent = 120,
    delay = 0,
  }: SplitRevealOptions = {},
) {
  // "words,chars" wraps each word in an atomic inline-block so line breaks only
  // happen between words; without it, adjacent char spans can wrap mid-word.
  const split = new SplitType(target, { types: type === "chars" ? "words,chars" : "words" });
  const elements = type === "chars" ? split.chars : split.words;

  const revert = () => split.revert();

  if (!elements || elements.length === 0) {
    return { timeline: gsap.timeline(), revert, elements: [] as HTMLElement[] };
  }

  gsap.set(elements, { yPercent, opacity: 0 });

  const timeline = gsap.timeline({ delay });
  timeline.to(elements, {
    yPercent: 0,
    opacity: 1,
    duration,
    ease: easeName,
    stagger,
  });

  return { timeline, revert, elements };
}
