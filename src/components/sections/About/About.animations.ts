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
  gsap.set(parallax, { autoAlpha: 0 });

  // Entrance: reveal the first beat and portrait as this section's top edge
  // approaches the viewport, rather than having them already sitting there fully
  // formed. This scroll range naturally overlaps with Hero's own exit scrub, since
  // Hero's pin releasing (in the section immediately before this one) is exactly
  // what brings this section's top edge up toward the viewport — so the two read
  // as one continuous crossfade handoff instead of "Hero fades, then this appears."
  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "top top",
      scrub: 1,
    },
  })
    .to(beats[0], { autoAlpha: 1, yPercent: 0, ease: "none" }, 0)
    .to(parallax, { autoAlpha: 1, ease: "none" }, 0);

  const tl = gsap.timeline();
  beats.forEach((beat, index) => {
    if (index === 0) return;
    const prev = beats[index - 1];
    if (index === 1) {
      // beats[0]'s "visible" state is set by the separate entrance timeline above,
      // not this one — a plain .to() here would capture its from-state at build
      // time (while it's still hidden, before the entrance ever runs), so this
      // timeline would keep re-asserting "hidden" at scroll progress 0 and fight
      // the entrance. fromTo makes this timeline's own progress-0 state correct
      // regardless of timing (same fix as Hero's subtext fade earlier).
      tl.fromTo(
        prev,
        { autoAlpha: 1, yPercent: 0 },
        { autoAlpha: 0, yPercent: -30, duration: 1, ease: ease.scrub },
        index - 1,
      );
    } else {
      tl.to(prev, { autoAlpha: 0, yPercent: -30, duration: 1, ease: ease.scrub }, index - 1);
    }
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
