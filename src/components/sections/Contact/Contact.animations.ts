import { gsap, ScrollTrigger } from "@/lib/gsap";
import { buildSplitReveal } from "@/lib/animations/splitReveal";
import { ease } from "@/lib/animations/easing";

interface ContactRefs {
  section: HTMLElement;
  glow: HTMLElement;
  headline: HTMLElement;
  pills: HTMLElement[];
  divider: HTMLElement;
  formFields: HTMLElement[];
}

export function buildContactReveal(
  { section, glow, headline, pills, divider, formFields }: ContactRefs,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    gsap.set(headline, { autoAlpha: 1 });
    gsap.set([...pills, divider, ...formFields], { autoAlpha: 1, y: 0 });
    return () => {};
  }

  gsap.set(pills, { autoAlpha: 0, y: 16 });
  gsap.set(divider, { autoAlpha: 0 });
  gsap.set(formFields, { autoAlpha: 0, y: 16 });

  const { timeline, revert } = buildSplitReveal(headline, {
    type: "chars",
    stagger: 0.015,
    duration: 0.9,
    easeName: ease.entrance,
    yPercent: 110,
  });
  timeline.to(pills, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07, ease: ease.standard }, "-=0.35");
  timeline.to(divider, { autoAlpha: 1, duration: 0.5, ease: "none" }, "-=0.3");
  timeline.to(
    formFields,
    { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: ease.standard },
    "-=0.25",
  );

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top 70%",
    toggleActions: "play none none reverse",
    animation: timeline,
  });

  // A slow, ambient breathing drift on the glow — quiet continuous life
  // rather than a one-shot entrance, echoing Hero's own idle ambient motion.
  const breathe = gsap.to(glow, {
    scale: 1.08,
    opacity: 0.85,
    duration: 6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    transformOrigin: "center",
  });

  return () => {
    revert();
    trigger.kill();
    breathe.kill();
  };
}
