import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/animations/easing";

interface AboutRefs {
  section: HTMLElement;
  beats: HTMLElement[];
  parallax: HTMLElement;
}

export function buildAboutScrub({ section, beats, parallax }: AboutRefs, reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(beats, { autoAlpha: 1, yPercent: 0, position: "relative" });
    gsap.set(parallax, { autoAlpha: 0.5 });
    return;
  }

  gsap.set(beats, { autoAlpha: 0, yPercent: 30 });
  gsap.set(beats[0], { autoAlpha: 1, yPercent: 0 });

  const tl = gsap.timeline();
  beats.forEach((beat, index) => {
    if (index === 0) return;
    const prev = beats[index - 1];
    tl.to(prev, { autoAlpha: 0, yPercent: -30, duration: 1, ease: ease.scrub }, index - 1);
    tl.to(beat, { autoAlpha: 1, yPercent: 0, duration: 1, ease: ease.scrub }, index - 1);
  });
  tl.to(parallax, { yPercent: 20, ease: "none" }, 0);

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: `+=${(beats.length - 1) * 100}%`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    animation: tl,
  });
}
