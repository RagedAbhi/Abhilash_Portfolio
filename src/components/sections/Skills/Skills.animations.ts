import { gsap, ScrollTrigger } from "@/lib/gsap";
import { toggleWillChange } from "@/lib/animations/willChange";

interface SkillsRefs {
  section: HTMLElement;
  track: HTMLElement;
}

export function buildSkillsScrub({ section, track }: SkillsRefs, reducedMotion: boolean) {
  if (reducedMotion) return () => {};

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    // Stop the pan a little short of fully flush against the viewport's right edge —
    // otherwise the last card's content (e.g. right-aligned level badges) ends up
    // with zero breathing room at the very end, unlike every other card which has
    // the track's own gap before it.
    const TRAILING_BUFFER = 40;
    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + TRAILING_BUFFER);

    // Hold at the start and end (no-op tweens that just reserve scroll distance)
    // so the first and last skill groups sit still and readable for a moment
    // instead of already being mid-pan the instant the pin activates/releases.
    const HOLD = 0.4;
    const PAN = 1;
    const totalUnits = HOLD * 2 + PAN;

    const tl = gsap.timeline();
    tl.to(track, { x: 0, duration: HOLD, ease: "none" });
    tl.to(track, { x: getScrollAmount, duration: PAN, ease: "none" });
    tl.to(track, { x: getScrollAmount, duration: HOLD, ease: "none" });

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${-getScrollAmount() * (totalUnits / PAN)}`,
      pin: true,
      scrub: 1,
      animation: tl,
      invalidateOnRefresh: true,
      ...toggleWillChange(track, "transform"),
    });
  });

  return () => mm.revert();
}
