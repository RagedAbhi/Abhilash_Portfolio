import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/animations/easing";

// The small tilt each card sits at in the fan — applied via GSAP (not
// inline/Tailwind transform classes) so GSAP "owns" the transform from the
// start; mixing a plain CSS transform string with GSAP-driven tweens on the
// same element lets GSAP's own transform cache silently clobber the CSS one
// the first time it writes to that element.
export const FAN_ROTATIONS = [-10, -2, 6];

// Sized to read clearly above cards this small without dwarfing them.
const FOX_SCALE = 1.5;

interface RevealRefs {
  stack: HTMLElement;
  cards: HTMLElement[];
  foxGroup?: SVGGElement | null;
}

// Entrance (fade/scale/stagger in as the stack scrolls into view) plus a
// slow, continuous idle sway on the whole cluster — the same "alive before
// you touch it" idea as Contact's own glow `breathe` tween, so the cards
// don't read as inert set-dressing before anyone clicks one. The fox (when
// present) fades in alongside them and patrols back and forth above the
// stack continuously, independent of the cards' own sway.
export function buildFunFactCardsReveal({ stack, cards, foxGroup }: RevealRefs, reducedMotion: boolean) {
  const foxBody = foxGroup?.querySelector<SVGGElement>("[data-fox-body]") ?? null;
  const foxTail = foxGroup?.querySelector<SVGGElement>("[data-fox-tail]") ?? null;

  if (reducedMotion) {
    gsap.set(cards, { autoAlpha: 1, scale: 1, y: 0 });
    cards.forEach((card, i) => gsap.set(card, { rotation: FAN_ROTATIONS[i] ?? 0 }));
    if (foxGroup) gsap.set(foxGroup, { autoAlpha: 1, scale: FOX_SCALE, x: 0 });
    return () => {};
  }

  gsap.set(cards, { autoAlpha: 0, scale: 0.85, y: 20 });
  cards.forEach((card, i) => gsap.set(card, { rotation: FAN_ROTATIONS[i] ?? 0 }));

  const tl = gsap.timeline();
  tl.to(cards, {
    autoAlpha: 1,
    scale: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: ease.standard,
  });

  if (foxGroup) {
    // Only autoAlpha is entrance-driven — x is already being written
    // continuously by the patrol timeline below (started immediately, not
    // gated behind this reveal), so a second entrance tween touching that
    // same property would fight it for control the moment both are live.
    gsap.set(foxGroup, { autoAlpha: 0, scale: FOX_SCALE });
    tl.to(foxGroup, { autoAlpha: 1, duration: 0.5, ease: ease.standard }, "-=0.3");
  }

  const trigger = ScrollTrigger.create({
    trigger: stack,
    start: "top 95%",
    toggleActions: "play none none reverse",
    animation: tl,
  });

  const sway = gsap.to(stack, {
    rotation: 1.5,
    duration: 3.4,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    transformOrigin: "50% 100%",
  });

  let patrol: gsap.core.Timeline | null = null;
  let hoverBob: gsap.core.Tween | null = null;
  let bodyIdle: gsap.core.Tween | null = null;
  let tailIdle: gsap.core.Tween | null = null;

  if (foxGroup) {
    const stackWidth = stack.getBoundingClientRect().width;
    const patrolDistance = Math.max(50, stackWidth - 60);

    // Back-and-forth pacing above the cards — the same fox silhouette used
    // everywhere else on the site, at its default fixed orientation the
    // whole time (no mirroring/rotation), matching how it's used elsewhere.
    patrol = gsap.timeline({ repeat: -1 });
    patrol
      .to(foxGroup, { x: patrolDistance, duration: 3.2, ease: "sine.inOut" })
      .to(foxGroup, { x: 0, duration: 3.2, ease: "sine.inOut" });

    // A gentle continuous float so it reads as hovering rather than resting
    // on a surface — a different property (y) than the patrol's own (x), on
    // the same element, so the two never fight over control.
    hoverBob = gsap.to(foxGroup, {
      y: "+=5",
      duration: 1.1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    bodyIdle = foxBody
      ? gsap.to(foxBody, { y: -1.2, duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: -1 })
      : null;
    tailIdle = foxTail
      ? gsap.to(foxTail, {
          rotation: 14,
          svgOrigin: "-9 -2",
          duration: 0.45,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      : null;
  }

  return () => {
    trigger.kill();
    sway.kill();
    patrol?.kill();
    hoverBob?.kill();
    bodyIdle?.kill();
    tailIdle?.kill();
  };
}

// The 3D flip itself — a plain rotationY tween on the "flipper" element,
// which sits inside a perspective-wrapped slot with two backface-hidden
// faces (back design at rotateY(0), fact content pre-rotated to
// rotateY(180deg) in its own static class) — the standard flip-card
// technique. Kept as a tiny standalone function (not tied to the reveal
// timeline above) since it fires per-card, per-click, independent of scroll.
export function flipCard(flipper: HTMLElement, toFront: boolean, reducedMotion: boolean) {
  if (reducedMotion) {
    gsap.set(flipper, { rotationY: toFront ? 180 : 0 });
    return;
  }
  gsap.to(flipper, {
    rotationY: toFront ? 180 : 0,
    duration: 0.6,
    ease: "back.out(1.6)",
  });
}
