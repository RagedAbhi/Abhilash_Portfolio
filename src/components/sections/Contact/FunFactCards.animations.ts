import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/animations/easing";

// Sized to read clearly above the widget without dwarfing it.
const FOX_SCALE = 1.5;

interface RevealRefs {
  stack: HTMLElement;
  content: HTMLElement;
  foxGroup?: SVGGElement | null;
}

// Entrance (fade/rise in as the widget scrolls into view) plus the fox
// patrolling back and forth above it, continuously, independent of scroll —
// shared by whichever design (pills/terminal) is currently active, since
// both just hand in their own outer content wrapper as the fade target.
export function buildFunFactsReveal({ stack, content, foxGroup }: RevealRefs, reducedMotion: boolean) {
  const foxBody = foxGroup?.querySelector<SVGGElement>("[data-fox-body]") ?? null;
  const foxTail = foxGroup?.querySelector<SVGGElement>("[data-fox-tail]") ?? null;

  if (reducedMotion) {
    gsap.set(content, { autoAlpha: 1, y: 0 });
    if (foxGroup) gsap.set(foxGroup, { autoAlpha: 1, scale: FOX_SCALE, x: 0 });
    return () => {};
  }

  gsap.set(content, { autoAlpha: 0, y: 16 });

  const tl = gsap.timeline();
  tl.to(content, { autoAlpha: 1, y: 0, duration: 0.6, ease: ease.standard });

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

  let patrol: gsap.core.Timeline | null = null;
  let hoverBob: gsap.core.Tween | null = null;
  let bodyIdle: gsap.core.Tween | null = null;
  let tailIdle: gsap.core.Tween | null = null;

  if (foxGroup) {
    const stackWidth = stack.getBoundingClientRect().width;
    const patrolDistance = Math.max(50, stackWidth - 60);

    // Back-and-forth pacing above the widget — the same fox silhouette used
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
    patrol?.kill();
    hoverBob?.kill();
    bodyIdle?.kill();
    tailIdle?.kill();
  };
}

// Module-level (not defined inside a component) so the lint rule against
// impure calls "during render" doesn't flag Math.random — a plain helper
// only ever invoked from click handlers, never during render. Shared by
// whichever design needs a "pick a different one than last time" draw.
export function pickRandomFact(length: number, excludeIndex: number | null): number {
  if (length <= 1) return 0;
  let next = Math.floor(Math.random() * length);
  while (next === excludeIndex) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}
