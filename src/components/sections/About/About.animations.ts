import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/animations/easing";

interface AboutRefs {
  section: HTMLElement;
  beats: HTMLElement[];
  parallax: HTMLElement;
}

export function buildAboutScrub({ section, beats, parallax }: AboutRefs, reducedMotion: boolean) {
  // Defensive: don't rely solely on useGSAP's revertOnUpdate to have fully torn
  // down a previous run's ScrollTrigger. useReducedMotion() always reports false
  // on first render (required for hydration safety) then corrects to the real
  // value shortly after — so every reduced-motion visitor briefly builds the
  // non-reduced pinned setup before this re-runs. Killing a *pinned* trigger
  // while it's actively engaged (mid-scroll) doesn't itself recalculate other
  // triggers' positions, which can leave stale pin/transform offsets on the
  // beats. Killing explicitly + refreshing after guards against this regardless
  // of what revertOnUpdate already did.
  ScrollTrigger.getAll()
    .filter((st) => st.trigger === section)
    .forEach((st) => st.kill());

  if (reducedMotion) {
    gsap.set(beats, { autoAlpha: 1, yPercent: 0, position: "relative" });
    gsap.set(parallax, { autoAlpha: 0.5 });
    ScrollTrigger.refresh();
    return;
  }

  gsap.set(beats, { autoAlpha: 0, yPercent: 30 });
  gsap.set(parallax, { autoAlpha: 0 });

  // Continuous parallax: a dedicated ScrollTrigger spanning the section's entire
  // presence in the viewport (not tied to the discrete beat-transition timeline
  // below, whose pacing depends on beat count) — drifts the portrait at a
  // different rate than the page scroll for the classic layered-depth feel,
  // the same technique Hero's own background already uses for its parallax.
  gsap.fromTo(
    parallax,
    { yPercent: -8 },
    {
      yPercent: 16,
      ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 },
    },
  );

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

  // Sequential (non-overlapping) crossfade: because this timeline is scrubbed
  // directly by scroll position, a visitor can pause at any point — including
  // mid-transition. A simultaneous crossfade would leave both beats legible and
  // overlapping at that exact point, so each transition is split into two
  // non-overlapping halves: the outgoing beat fully exits before the incoming
  // beat starts entering, guaranteeing at most one beat is ever visible.
  const tl = gsap.timeline();
  const HALF = 0.5;
  beats.forEach((beat, index) => {
    if (index === 0) return;
    const prev = beats[index - 1];
    const segmentStart = index - 1;
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
        { autoAlpha: 0, yPercent: -30, duration: HALF, ease: ease.scrub },
        segmentStart,
      );
    } else {
      tl.to(prev, { autoAlpha: 0, yPercent: -30, duration: HALF, ease: ease.scrub }, segmentStart);
    }
    tl.to(beat, { autoAlpha: 1, yPercent: 0, duration: HALF, ease: ease.scrub }, segmentStart + HALF);
  });

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: `+=${(beats.length - 1) * 100}%`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    animation: tl,
  });

  ScrollTrigger.refresh();
}
