import { gsap, ScrollTrigger } from "@/lib/gsap";

const SVG_NS = "http://www.w3.org/2000/svg";
// The fox's own local coordinate span (see FoxIcon.tsx) is roughly
// 18×29 units — small enough that a 1:1 scale reads as barely a smudge next
// to the line's own 2px stroke, so the "walking" size is scaled well above 1.
const WALK_SCALE = 1.3;

export interface TimelineGeometry {
  jogY: number;
  fromX: number;
  toX: number;
  proofBottom: number;
  d: string;
  /** Local to this svg's own coordinate space (top = geometry.top), or null
   * below the `sm` breakpoint where the portrait marker doesn't render. */
  portraitAnchor: { x: number; y: number } | null;
}

interface TimelineRefs {
  svg: SVGSVGElement;
  path: SVGPathElement;
  pandaGroup: SVGGElement;
  heroSection: Element | null;
  /** Hero's actual portrait element (not the static measurement twin) — its
   * entire exit (shrink, move toward the line, fade) is driven from here so
   * it can be tightly co-timed against the fox's own fade-in. */
  heroPortrait: HTMLElement | null;
}

function createDetachedPath(d: string): SVGPathElement {
  const el = document.createElementNS(SVG_NS, "path");
  el.setAttribute("d", d);
  return el;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function buildTimelineReveal(
  { svg, path, pandaGroup, heroSection, heroPortrait }: TimelineRefs,
  geometry: TimelineGeometry,
  reducedMotion: boolean,
) {
  const length = path.getTotalLength();

  if (reducedMotion) {
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
    gsap.set(pandaGroup, { autoAlpha: 0 });
    return () => {};
  }

  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  // Running side-on, the fox only reads cleanly at its own natural orientation
  // (rotating it to face down/up at the line's vertical segments looked
  // confusing in testing — legs and tail no longer read as an animal) — so
  // it always stays at rotation 0, same lesson as the earlier front-facing
  // design, just for a different reason.
  gsap.set(pandaGroup, { autoAlpha: 0, scale: WALK_SCALE, rotation: 0 });

  // A quiet "trot" loop — the body bobs and the tail wags continuously,
  // independent of the group's own scroll-driven x/y/scale (a different
  // element and different property, so the two writers never collide).
  const body = pandaGroup.querySelector<SVGGElement>("[data-fox-body]");
  const tail = pandaGroup.querySelector<SVGGElement>("[data-fox-tail]");
  const bodyBob = body
    ? gsap.to(body, { y: -1.2, duration: 0.28, ease: "sine.inOut", yoyo: true, repeat: -1 })
    : null;
  const tailWag = tail
    ? gsap.to(tail, {
        rotation: 14,
        svgOrigin: "-9 -2",
        duration: 0.45,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    : null;

  let endFaded = false;

  // Phase 2 — walking the line. Position comes from the exact same tween
  // this ScrollTrigger already drives (ease:"none", so drawn length is a
  // direct linear read of its own progress) — one source of truth, so the
  // fox can never drift from the visibly-drawn tip of the line.
  const dashTween = gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: svg,
      start: "top 85%",
      end: "bottom 70%",
      scrub: true,
      onUpdate: (self) => {
        const drawn = length * self.progress;
        const pt = path.getPointAtLength(Math.max(0, Math.min(length, drawn)));
        gsap.set(pandaGroup, { x: pt.x, y: pt.y, scale: WALK_SCALE });

        const shouldFadeOut = self.progress >= 0.999;
        if (shouldFadeOut !== endFaded) {
          endFaded = shouldFadeOut;
          gsap.to(pandaGroup, { autoAlpha: shouldFadeOut ? 0 : 1, duration: 0.3, overwrite: "auto" });
        }
      },
    },
  });

  const dashTrigger = dashTween.scrollTrigger;

  // Phase 1 — the flight from the portrait's position down to the line's own
  // first vertex. A detached (never-mounted) path is used purely for point
  // sampling; getTotalLength/getPointAtLength work on unattached path data.
  // The portrait rides this exact same path (see heroPortrait below) so the
  // two are always spatially pinned together, not on separate trajectories.
  //
  // The photo and the fox must never both be visible for long: the portrait
  // shrinks and fades out entirely within the FIRST PORTRAIT_FADE_END of this
  // same progress value, while the fox only starts fading in at
  // FOX_FADE_START (already positioned/scaled — just invisible — before
  // that, so there's no pop once it appears) and is fully opaque by
  // FOX_FADE_END. The two windows overlap only briefly
  // (FOX_FADE_START..PORTRAIT_FADE_END), for a deliberate quick crossfade
  // instead of the two coexisting for the rest of the scroll.
  const PORTRAIT_FADE_END = 0.45;
  const FOX_FADE_START = 0.35;
  const FOX_FADE_END = 0.55;

  let killFlight = () => {};
  if (geometry.portraitAnchor && heroSection && dashTrigger) {
    const { x: startX, y: startY } = geometry.portraitAnchor;
    const endX = geometry.fromX;
    const c1x = startX + (endX - startX) * 0.35;
    const c1y = startY + (0 - startY) * 0.5;
    const c2x = endX;
    const c2y = -Math.max(80, Math.abs(startY) * 0.2);
    const flightPath = createDetachedPath(
      `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} 0`,
    );
    const flightLength = flightPath.getTotalLength();

    const flightState = { t: 0 };
    const flightTween = gsap.to(flightState, {
      t: 1,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: () => dashTrigger.start,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const dist = flightLength * progress;
          const pt = flightPath.getPointAtLength(Math.max(0, Math.min(flightLength, dist)));
          const scale = lerp(2.4, WALK_SCALE, progress);
          const foxOpacity =
            progress <= FOX_FADE_START
              ? 0
              : progress >= FOX_FADE_END
                ? 1
                : (progress - FOX_FADE_START) / (FOX_FADE_END - FOX_FADE_START);
          gsap.set(pandaGroup, { x: pt.x, y: pt.y, scale, autoAlpha: foxOpacity });

          if (heroPortrait) {
            const t = Math.min(1, progress / PORTRAIT_FADE_END);
            // Same (x,y) the fox is sampling this exact frame — pt is on the
            // same flight path the portrait's own natural position (startX,
            // startY) sits at t=0, so this is a direct relative offset, not
            // a separately-computed trajectory. The two are pinned together
            // spatially the whole time; only opacity/scale diverge, so the
            // hand-off reads as one continuous shape rather than two objects
            // moving independently past each other.
            gsap.set(heroPortrait, {
              x: pt.x - startX,
              y: pt.y - startY,
              scale: lerp(1, 0.55, t),
              autoAlpha: lerp(1, 0, t),
            });
          }
        },
      },
    });

    killFlight = () => {
      flightTween.scrollTrigger?.kill();
      flightTween.kill();
    };
  }

  return () => {
    killFlight();
    bodyBob?.kill();
    tailWag?.kill();
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger === svg) trigger.kill();
    });
  };
}
