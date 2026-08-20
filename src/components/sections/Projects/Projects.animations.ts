import { gsap } from "@/lib/gsap";
import { toggleWillChange } from "@/lib/animations/willChange";

interface ProjectsRefs {
  section: HTMLElement;
  track: HTMLElement;
  panels: HTMLElement[];
}

export function buildProjectsScrub({ section, track, panels }: ProjectsRefs, reducedMotion: boolean) {
  panels.forEach((panel) => {
    const covers = Array.from(panel.querySelectorAll<HTMLElement>("[data-reveal-cover]"));
    const meta = panel.querySelector<HTMLElement>("[data-reveal-meta]");
    if (covers.length) gsap.set(covers, { clipPath: "inset(0% 0% 0% 0%)" });
    if (meta) gsap.set(meta, { autoAlpha: 1, y: 0 });
  });

  if (reducedMotion) return () => {};

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    panels.forEach((panel) => {
      const covers = Array.from(panel.querySelectorAll<HTMLElement>("[data-reveal-cover]"));
      const meta = panel.querySelector<HTMLElement>("[data-reveal-meta]");
      if (covers.length) gsap.set(covers, { clipPath: "inset(0% 0% 0% 100%)" });
      if (meta) gsap.set(meta, { autoAlpha: 0, y: 24 });
    });

    const getDistance = () => -(track.scrollWidth - window.innerWidth);

    const scrollTween = gsap.to(track, {
      x: getDistance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${-getDistance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        snap: panels.length > 1 ? 1 / (panels.length - 1) : undefined,
        ...toggleWillChange(track, "transform"),
      },
    });

    panels.forEach((panel) => {
      const covers = Array.from(panel.querySelectorAll<HTMLElement>("[data-reveal-cover]"));
      const meta = panel.querySelector<HTMLElement>("[data-reveal-meta]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          containerAnimation: scrollTween,
          start: "left 85%",
          end: "left 40%",
          scrub: true,
          ...(covers.length ? toggleWillChange(covers, "clip-path") : {}),
        },
      });
      if (covers.length) tl.to(covers, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0);
      if (meta) tl.to(meta, { autoAlpha: 1, y: 0, ease: "none" }, 0);
    });
  });

  return () => mm.revert();
}
