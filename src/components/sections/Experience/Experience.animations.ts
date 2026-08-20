import { gsap } from "@/lib/gsap";

interface ExperienceRefs {
  section: HTMLElement;
  path: SVGPathElement;
  cards: HTMLElement[];
}

export function buildExperienceScrub({ section, path, cards }: ExperienceRefs, reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(path, { strokeDashoffset: 0 });
    gsap.set(cards, { autoAlpha: 1, x: 0 });
    return;
  }

  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      end: "bottom 60%",
      scrub: true,
    },
  });

  gsap.set(cards, {
    autoAlpha: 0,
    x: (index) => (index % 2 === 0 ? -40 : 40),
  });

  cards.forEach((card) => {
    gsap.to(card, {
      autoAlpha: 1,
      x: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}
