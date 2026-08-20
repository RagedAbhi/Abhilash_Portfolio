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
    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

    const tween = gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
    });

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${-getScrollAmount()}`,
      pin: true,
      scrub: 1,
      animation: tween,
      invalidateOnRefresh: true,
      ...toggleWillChange(track, "transform"),
    });
  });

  return () => mm.revert();
}
