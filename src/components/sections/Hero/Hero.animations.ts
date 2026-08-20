import { gsap, ScrollTrigger } from "@/lib/gsap";
import { buildSplitReveal } from "@/lib/animations/splitReveal";
import { buildClipReveal } from "@/lib/animations/clipReveal";
import { ease } from "@/lib/animations/easing";
import { toggleWillChange } from "@/lib/animations/willChange";

interface HeroRefs {
  section: HTMLElement;
  background: HTMLElement;
  headline: HTMLElement;
  subtext: HTMLElement;
  glowWrapper: HTMLElement;
  glow: HTMLElement;
}

export function setHeroInitialState({ background, headline, subtext }: HeroRefs, reducedMotion: boolean) {
  gsap.set(background, { clipPath: reducedMotion ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" });
  gsap.set(subtext, { autoAlpha: 0, y: 24 });
  if (reducedMotion) {
    gsap.set(headline, { autoAlpha: 0 });
  }
}

export function playHeroEntrance({ background, headline, subtext }: HeroRefs, reducedMotion: boolean) {
  if (reducedMotion) {
    const tl = gsap.timeline();
    tl.set(background, { clipPath: "inset(0% 0 0 0)" });
    tl.to(headline, { autoAlpha: 1, duration: 0.6 });
    tl.to(subtext, { autoAlpha: 1, y: 0, duration: 0.6 }, "<");
    return { timeline: tl, revert: () => {} };
  }

  const { timeline: splitTl, revert } = buildSplitReveal(headline, {
    type: "chars",
    stagger: 0.02,
    duration: 1,
    easeName: ease.entrance,
    yPercent: 120,
  });

  const master = gsap.timeline();
  master.add(buildClipReveal(background, { direction: "up", duration: 1.3, easeName: ease.exit }), 0);
  master.add(splitTl, 0.2);
  master.to(subtext, { autoAlpha: 1, y: 0, duration: 0.8, ease: ease.standard }, "-=0.4");

  return { timeline: master, revert };
}

export function buildHeroAmbientBackground(
  { section, glowWrapper, glow }: HeroRefs,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    gsap.set(glowWrapper, { x: 0, y: 0 });
    gsap.set(glow, { xPercent: 0, yPercent: 0 });
    return;
  }

  const driftX = gsap.to(glow, {
    xPercent: 15,
    duration: 10,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
  const driftY = gsap.to(glow, {
    yPercent: 10,
    duration: 16,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });

  const moveX = gsap.quickTo(glowWrapper, "x", { duration: 1.2, ease: "power3" });
  const moveY = gsap.quickTo(glowWrapper, "y", { duration: 1.2, ease: "power3" });

  const onPointerMove = (event: PointerEvent) => {
    const rect = section.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    moveX(offsetX * 0.06);
    moveY(offsetY * 0.06);
  };
  section.addEventListener("pointermove", onPointerMove);

  const scrollTrigger = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onEnter: () => {
      driftX.resume();
      driftY.resume();
    },
    onEnterBack: () => {
      driftX.resume();
      driftY.resume();
    },
    onLeave: () => {
      driftX.pause();
      driftY.pause();
    },
    onLeaveBack: () => {
      driftX.pause();
      driftY.pause();
    },
  });

  return () => {
    section.removeEventListener("pointermove", onPointerMove);
    scrollTrigger.kill();
  };
}

export function buildHeroExitScrub({ section, background, headline }: HeroRefs, reducedMotion: boolean) {
  if (reducedMotion) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "+=100%",
    pin: true,
    pinSpacing: true,
    scrub: 1,
    animation: gsap
      .timeline()
      .to(headline, { yPercent: -40, scale: 0.9, autoAlpha: 0, ease: "none" }, 0)
      .to(background, { yPercent: -20, ease: "none" }, 0),
    ...toggleWillChange([headline, background], "transform, opacity"),
  });
}
