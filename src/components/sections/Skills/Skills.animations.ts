import { gsap, ScrollTrigger } from "@/lib/gsap";

export function buildSkillsReveal(section: HTMLElement, track: HTMLElement, reducedMotion: boolean) {
  const cards = gsap.utils.toArray<HTMLElement>(track.children);

  if (reducedMotion) {
    gsap.set(cards, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.set(cards, { autoAlpha: 0, y: 30 });
  gsap.to(cards, {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: {
      trigger: section,
      start: "top 75%",
      toggleActions: "play none none reverse",
    },
  });
}

interface SkillsFoxRefs {
  section: HTMLElement;
  track: HTMLElement;
  barWrap: HTMLElement;
  foxGroup: SVGGElement;
}

// The fox's own local coordinate span (see FoxIcon.tsx, "run" pose) is
// roughly x:[-18.6,14.6] y:[-16,10.5] — small enough at 1:1 that it read as
// an illegible smudge on the bar; scaled up so the silhouette is actually
// recognizable, matching the size the same icon reads at everywhere else.
const BAR_SCALE = 1.3;
// The fox's local origin (0,0) is roughly mid-body, not its bounding-box
// center — setting x straight to a 0..barWidth range let its left half
// (tail) bleed off the bar's own left edge at progress 0. Insetting the
// travel range by the silhouette's own left/right extents keeps the whole
// shape on the bar at both ends.
const FOX_LEFT = 18.6 * BAR_SCALE;
const FOX_RIGHT = 14.6 * BAR_SCALE;

// A short crossfade window (matching TimelineBridge's own Phase 1 fade)
// rather than a hard cut, so the fox is never seen popping in/out mid-frame.
function fadeFox(foxGroup: SVGGElement, visible: boolean) {
  gsap.to(foxGroup, { autoAlpha: visible ? 1 : 0, duration: 0.35, overwrite: "auto" });
}

// The fox "rides" a progress bar tracking how far the user has scrolled
// through Skills' own horizontally-scrolling card track — not page scroll,
// since the track scrolls independently via drag/wheel. Position is driven
// directly off track.scrollLeft (one source of truth, read on the track's own
// native scroll event) so it can never drift from what's actually on screen.
// Entry/exit are a page-scroll-driven fade at the section's own boundary,
// reusing the same crossfade idea already proven for the Hero→timeline
// hand-off, just without a flight phase — Skills doesn't need one.
export function buildSkillsFoxGuide(
  { section, track, barWrap, foxGroup }: SkillsFoxRefs,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    gsap.set(foxGroup, { autoAlpha: 0 });
    return () => {};
  }

  gsap.set(foxGroup, { autoAlpha: 0, scale: BAR_SCALE, y: barWrap.clientHeight / 2 });

  const body = foxGroup.querySelector<SVGGElement>("[data-fox-body]");
  const tail = foxGroup.querySelector<SVGGElement>("[data-fox-tail]");
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

  const updatePosition = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? track.scrollLeft / maxScroll : 0;
    const travel = Math.max(0, barWrap.clientWidth - FOX_LEFT - FOX_RIGHT);
    gsap.set(foxGroup, { x: FOX_LEFT + progress * travel });
  };

  updatePosition();
  track.addEventListener("scroll", updatePosition, { passive: true });

  const onResize = () => updatePosition();
  window.addEventListener("resize", onResize);

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    end: "bottom 20%",
    onEnter: () => fadeFox(foxGroup, true),
    onEnterBack: () => fadeFox(foxGroup, true),
    onLeave: () => fadeFox(foxGroup, false),
    onLeaveBack: () => fadeFox(foxGroup, false),
  });

  return () => {
    track.removeEventListener("scroll", updatePosition);
    window.removeEventListener("resize", onResize);
    trigger.kill();
    bodyBob?.kill();
    tailWag?.kill();
  };
}
