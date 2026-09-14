import { gsap } from "@/lib/gsap";

export function buildAboutScrub(beats: HTMLElement[], reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(beats, { autoAlpha: 1, x: 0 });
    return;
  }

  // Each beat flies in from the side as it scrolls into view, alternating
  // left/right in step with the asymmetric grid position it lands in — a
  // paced, editorial reveal rather than the whole list firing together.
  beats.forEach((beat, index) => {
    const fromSide = index % 2 === 0 ? -72 : 72;
    gsap.set(beat, { autoAlpha: 0, x: fromSide });
    gsap.to(beat, {
      autoAlpha: 1,
      x: 0,
      duration: 0.9,
      ease: "power4.out",
      scrollTrigger: {
        trigger: beat,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  });
}
