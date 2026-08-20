import { gsap } from "@/lib/gsap";

interface ExperienceRefs {
  section: HTMLElement;
  line: HTMLElement;
  cards: HTMLElement[];
}

export function buildExperienceScrub({ section, line, cards }: ExperienceRefs, reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(line, { scaleY: 1 });
    gsap.set(cards, { autoAlpha: 1, x: 0 });
    return;
  }

  gsap.set(line, { scaleY: 0 });

  gsap.to(line, {
    scaleY: 1,
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
