import { gsap } from "@/lib/gsap";

export function buildSkillsReveal(section: HTMLElement, track: HTMLElement, reducedMotion: boolean) {
  const cards = gsap.utils.toArray<HTMLElement>(track.children);

  if (reducedMotion) {
    gsap.set(cards, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.set(cards, { autoAlpha: 0, y: 30 });
  gsap.to(cards, {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: {
      trigger: section,
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}
