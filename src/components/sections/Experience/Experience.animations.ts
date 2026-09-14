import { gsap } from "@/lib/gsap";

export function buildExperienceScrub(cards: HTMLElement[], reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(cards, { autoAlpha: 1, x: 0 });
    return;
  }

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
