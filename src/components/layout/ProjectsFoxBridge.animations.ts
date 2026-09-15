import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface ProjectsFoxGeometry {
  indexAnchor: { x: number; y: number };
}

interface ProjectsFoxRefs {
  projectsSection: Element;
  outerGroup: SVGGElement;
  foxGroup: SVGGElement;
  /** The svg overlay's own absolute page-top, in the same px units as
   * getBoundingClientRect() + window.scrollY — needed to convert a freshly
   * re-measured index-number position into this svg's local coordinate
   * space at animation time (see getLiveIndexAnchor below). */
  svgTop: number;
}

// Sized to read clearly as a fox without dwarfing the index number/controls
// it sits next to.
const HOP_SCALE = 0.867;

// The fox's own local origin sits mid-body, with its feet roughly this many
// (scaled) units below it — anchoring straight at the index number's own
// top edge put the feet, and the rest of the body above them, squarely on
// top of the number. Perching it this far above instead leaves the number
// fully readable underneath.
const INDEX_PERCH_OFFSET = 24;

// Re-measures the index number's position fresh, every time this is called,
// instead of trusting a value computed ahead of time in React state.
// Confirmed empirically: the controls row shifts a one-time ~16px sometime
// during the page's own load/entrance sequence, at a moment that isn't
// reliably before or after any fixed delay or even a ResizeObserver-based
// re-measure — so the geometry object built earlier can go stale by the
// time the entrance bounce or a hop actually fires. Reading the real DOM
// position at the exact moment each animation targets it sidesteps that
// staleness entirely, regardless of its cause.
function getLiveIndexAnchor(svgTop: number): { x: number; y: number } | null {
  const indexEl = document.querySelector('[data-fox-node="project-index"]');
  if (!indexEl) return null;
  const rect = indexEl.getBoundingClientRect();
  if (rect.width === 0) return null;
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + window.scrollY - svgTop - INDEX_PERCH_OFFSET,
  };
}

function killTweens(...tweens: (gsap.core.Tween | null)[]) {
  tweens.forEach((tween) => tween?.kill());
}

// A proper squash-and-stretch hop: a quick anticipation squat, a stretch as
// it rises, a squash on landing, then a settle back to rest scale with a
// touch of overshoot — instead of just moving y in a straight line, which
// read as a lifeless "up and down" rather than an actual hop.
const HOP_TIMING = {
  small: { anticipation: 0.06, rise: 0.13, fall: 0.15, settle: 0.14 },
  big: { anticipation: 0.1, rise: 0.26, fall: 0.32, settle: 0.22 },
};

function hopTo(
  outerGroup: SVGGElement,
  toX: number,
  toY: number,
  opts: { rise?: number; size?: keyof typeof HOP_TIMING } = {},
) {
  const { rise = 14, size = "small" } = opts;
  const timing = HOP_TIMING[size];
  const tl = gsap.timeline();

  tl.to(outerGroup, {
    scaleX: HOP_SCALE * 1.12,
    scaleY: HOP_SCALE * 0.82,
    duration: timing.anticipation,
    ease: "power1.out",
  })
    .to(outerGroup, {
      x: toX,
      y: toY - rise,
      scaleX: HOP_SCALE * 0.85,
      scaleY: HOP_SCALE * 1.18,
      duration: timing.rise,
      ease: "power2.out",
    })
    .to(outerGroup, {
      y: toY,
      scaleX: HOP_SCALE * 1.12,
      scaleY: HOP_SCALE * 0.85,
      duration: timing.fall,
      ease: "power2.in",
    })
    .to(outerGroup, {
      scaleX: HOP_SCALE,
      scaleY: HOP_SCALE,
      duration: timing.settle,
      ease: "back.out(2.4)",
    });
  return tl;
}

export function buildProjectsFoxGuide(
  { projectsSection, outerGroup, foxGroup, svgTop }: ProjectsFoxRefs,
  geometry: ProjectsFoxGeometry,
  reducedMotion: boolean,
) {
  const body = foxGroup.querySelector<SVGGElement>("[data-fox-body]");
  const tail = foxGroup.querySelector<SVGGElement>("[data-fox-tail]");

  if (reducedMotion) {
    gsap.set(outerGroup, { autoAlpha: 0 });
    return () => {};
  }

  gsap.set(outerGroup, {
    autoAlpha: 0,
    scale: HOP_SCALE,
    x: geometry.indexAnchor.x,
    y: geometry.indexAnchor.y,
  });

  let bodyIdle: gsap.core.Tween | null = null;
  let tailIdle: gsap.core.Tween | null = null;

  const startIdle = () => {
    killTweens(bodyIdle, tailIdle);
    bodyIdle = body
      ? gsap.to(body, { y: -1.2, duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: -1 })
      : null;
    tailIdle = tail
      ? gsap.to(tail, {
          rotation: 14,
          svgOrigin: "-9 -2",
          duration: 0.45,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      : null;
  };

  // Bounce-in the moment Projects scrolls into view — but only once the
  // controls row (prev/index/next) has actually finished ITS OWN separate
  // reveal-in animation (a y:16->0 transform in Projects.animations.ts,
  // fired by a later, independent ScrollTrigger threshold). Reading the
  // index number's position before that settles catches it mid-transform,
  // still offset from its final resting spot — confirmed empirically. Since
  // scroll speed (and thus how long that takes) is entirely up to the user,
  // a fixed delay can't be trusted; waiting for that animation's own
  // completion event is the only reliable signal.
  let scrolledIn = false;
  let revealed = false;
  const tryBounceIn = () => {
    if (!scrolledIn || !revealed) return;
    const anchor = getLiveIndexAnchor(svgTop) ?? geometry.indexAnchor;
    gsap.set(outerGroup, { autoAlpha: 1, x: anchor.x });
    hopTo(outerGroup, anchor.x, anchor.y, { size: "big" }).call(startIdle);
  };
  const onProjectsRevealed = () => {
    revealed = true;
    tryBounceIn();
  };
  window.addEventListener("fox:projects-revealed", onProjectsRevealed);
  const entranceTrigger = ScrollTrigger.create({
    trigger: projectsSection,
    start: "top 80%",
    once: true,
    onEnter: () => {
      scrolledIn = true;
      tryBounceIn();
    },
  });

  // Per-project-switch hop — fired from Projects.tsx on every goNext/goPrev,
  // decoupled via a plain DOM event since ProjectsFoxBridge and Projects.tsx
  // are separate components with no shared parent to prop-drill through
  // (the same reasoning TimelineBridge already applies by reading the DOM
  // directly rather than taking props from Hero).
  const onProjectHop = () => {
    const anchor = getLiveIndexAnchor(svgTop) ?? geometry.indexAnchor;
    hopTo(outerGroup, anchor.x, anchor.y, { rise: 12 });
  };
  window.addEventListener("fox:project-hop", onProjectHop);

  return () => {
    entranceTrigger.kill();
    window.removeEventListener("fox:projects-revealed", onProjectsRevealed);
    window.removeEventListener("fox:project-hop", onProjectHop);
    killTweens(bodyIdle, tailIdle);
  };
}
