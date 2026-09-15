import { gsap } from "@/lib/gsap";

interface ProjectsRevealRefs {
  section: HTMLElement;
  textCol: HTMLElement | null;
  imageCol: HTMLElement | null;
  controls: HTMLElement | null;
}

export function buildProjectsReveal(
  { section, textCol, imageCol, controls }: ProjectsRevealRefs,
  reducedMotion: boolean,
) {
  const pieces = [textCol, imageCol, controls].filter((el): el is HTMLElement => Boolean(el));
  if (!pieces.length) return;

  if (reducedMotion) {
    gsap.set(pieces, { autoAlpha: 1, x: 0, y: 0 });
    return;
  }

  // Text and cover reveal from opposite sides, controls settle in last — a
  // staggered entrance instead of the whole block fading up as one piece.
  if (textCol) gsap.set(textCol, { autoAlpha: 0, x: -24 });
  if (imageCol) gsap.set(imageCol, { autoAlpha: 0, x: 24 });
  if (controls) gsap.set(controls, { autoAlpha: 0, y: 16 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none reverse" },
    // The controls row (prev/index/next) settles in via its own y:16->0
    // transform, not a real layout reflow — but getBoundingClientRect still
    // reflects that transform mid-flight, so anything reading the index
    // number's position (ProjectsFoxBridge) needs to know once this has
    // actually finished rather than guessing a fixed delay.
    onComplete: () => window.dispatchEvent(new Event("fox:projects-revealed")),
  });
  if (textCol) tl.to(textCol, { autoAlpha: 1, x: 0, duration: 0.7, ease: "power3.out" }, 0);
  if (imageCol) tl.to(imageCol, { autoAlpha: 1, x: 0, duration: 0.7, ease: "power3.out" }, 0.1);
  if (controls) tl.to(controls, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.35);
}
