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
  portrait: HTMLElement;
  /** Inner wrapper of `portrait`, owned solely by the load entrance. The outer
   * `portrait` element's x/y/scale/opacity belong to TimelineBridge's scroll
   * flight (and its yPercent to the parallax below) — animating the entrance
   * on the same element made two writers fight over opacity and y, so a reload
   * deep in the page left the portrait faded back IN at its end-of-flight
   * position, floating over the hero text on the way back up. */
  portraitInner: HTMLElement;
  scrollCue: HTMLElement;
  glowWrapper: HTMLElement;
  glow: HTMLElement;
}

export function setHeroInitialState(
  { background, headline, subtext, portraitInner, scrollCue }: HeroRefs,
  reducedMotion: boolean,
) {
  gsap.set(background, { clipPath: reducedMotion ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" });
  gsap.set(subtext, { autoAlpha: 0, y: 24 });
  gsap.set(portraitInner, { autoAlpha: 0, y: 24 });
  gsap.set(scrollCue, { autoAlpha: 0, y: 10 });
  if (reducedMotion) {
    gsap.set(headline, { autoAlpha: 0 });
  }
}

export function playHeroEntrance(
  { background, headline, subtext, portraitInner, scrollCue }: HeroRefs,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    const tl = gsap.timeline();
    tl.set(background, { clipPath: "inset(0% 0 0 0)" });
    tl.to(headline, { autoAlpha: 1, duration: 0.6 });
    tl.to(subtext, { autoAlpha: 1, y: 0, duration: 0.6 }, "<");
    tl.to(portraitInner, { autoAlpha: 1, y: 0, duration: 0.6 }, "<");
    tl.to(scrollCue, { autoAlpha: 1, y: 0, duration: 0.6 }, "<");
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
  master.to(portraitInner, { autoAlpha: 1, y: 0, duration: 0.8, ease: ease.standard }, "<");
  master.to(scrollCue, { autoAlpha: 1, y: 0, duration: 0.6, ease: ease.standard }, "-=0.3");

  return { timeline: master, revert };
}

export function buildHeroAmbientBackground(
  { section, glowWrapper, glow, scrollCue, portrait }: HeroRefs,
  reducedMotion: boolean,
) {
  if (reducedMotion) {
    gsap.set(glowWrapper, { x: 0, y: 0 });
    gsap.set(glow, { xPercent: 0, yPercent: 0 });
    gsap.set(portrait, { yPercent: 0 });
    return;
  }

  // Continuous idle loop on the scroll cue — arrow bobs and gently pulses,
  // the label breathes slightly out of phase, for as long as the visitor
  // lingers on Hero.
  const arrow = scrollCue.querySelector<HTMLElement>("[data-scroll-arrow]");
  const label = scrollCue.querySelector<HTMLElement>("[data-scroll-label]");
  const arrowBob = arrow
    ? gsap.to(arrow, {
        y: 8,
        scale: 1.15,
        transformOrigin: "center",
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    : null;
  const labelPulse = label
    ? gsap.to(label, {
        opacity: 0.5,
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.35,
      })
    : null;

  // Portrait drifts at a slower rate than the page scroll — a subtle depth
  // cue independent of the pinned exit-scrub above (different refs, no
  // overlap with headline/subtext/background/scrollCue).
  const portraitParallax = gsap.fromTo(
    portrait,
    { yPercent: -6 },
    {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    },
  );

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
    arrowBob?.kill();
    labelPulse?.kill();
    portraitParallax.scrollTrigger?.kill();
    portraitParallax.kill();
  };
}

export function buildHeroExitScrub(
  { section, background, headline, subtext, scrollCue }: HeroRefs,
  reducedMotion: boolean,
) {
  if (reducedMotion) return;

  // The cue's own visibility is driven below by a tight progress threshold,
  // not by this timeline — keeping it as the single writer of scrollCue's
  // opacity avoids a repeat of the earlier two-ScrollTriggers-one-property bug.
  const HIDE_AT = 0.04;
  let cueHidden = false;

  // Not pinned: Hero fades/parallaxes out over its own natural scroll-through
  // distance (its own height) instead of holding the page captive for an
  // extra viewport of scroll before About appears — scrolling should move
  // straight into the next section, not stall on a scroll-jacked transition.
  // Portrait is deliberately NOT included here — TimelineBridge owns its
  // entire exit (shrink/move/fade) so it can be tightly co-timed against the
  // fox's own fade-in on the exact same shared progress value; splitting that
  // across two independent triggers is what caused the fox and photo to
  // overlap for an extended stretch instead of handing off cleanly.
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: "bottom top",
    scrub: 1,
    animation: gsap
      .timeline()
      .to(headline, { yPercent: -40, scale: 0.9, autoAlpha: 0, ease: "none" }, 0)
      .fromTo(subtext, { autoAlpha: 1, yPercent: 0 }, { yPercent: -20, autoAlpha: 0, ease: "none" }, 0)
      .to(background, { yPercent: -20, ease: "none" }, 0),
    onUpdate: (self) => {
      const shouldHide = self.progress > HIDE_AT;
      if (shouldHide === cueHidden) return;
      cueHidden = shouldHide;
      gsap.to(scrollCue, {
        autoAlpha: shouldHide ? 0 : 1,
        y: shouldHide ? 14 : 0,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    ...toggleWillChange([headline, subtext, background, scrollCue], "transform, opacity"),
  });
}
