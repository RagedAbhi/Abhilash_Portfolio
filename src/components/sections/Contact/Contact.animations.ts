import { gsap, ScrollTrigger } from "@/lib/gsap";
import { buildSplitReveal } from "@/lib/animations/splitReveal";
import { ease } from "@/lib/animations/easing";

interface ContactRefs {
  section: HTMLElement;
  headline: HTMLElement;
  meta: HTMLElement;
}

export function buildContactReveal({ section, headline, meta }: ContactRefs, reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(headline, { autoAlpha: 1 });
    gsap.set(meta, { autoAlpha: 1, y: 0 });
    return () => {};
  }

  gsap.set(meta, { autoAlpha: 0, y: 20 });

  const { timeline, revert } = buildSplitReveal(headline, {
    type: "chars",
    stagger: 0.015,
    duration: 0.9,
    easeName: ease.entrance,
    yPercent: 110,
  });
  timeline.to(meta, { autoAlpha: 1, y: 0, duration: 0.7, ease: ease.standard }, "-=0.3");

  ScrollTrigger.create({
    trigger: section,
    start: "top 70%",
    toggleActions: "play none none reverse",
    animation: timeline,
  });

  return revert;
}
