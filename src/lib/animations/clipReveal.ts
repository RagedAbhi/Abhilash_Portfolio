import { gsap } from "@/lib/gsap";
import { ease } from "./easing";

type ClipDirection = "up" | "down" | "left" | "right";

interface ClipRevealOptions {
  direction?: ClipDirection;
  duration?: number;
  easeName?: string;
  delay?: number;
}

const clipFrom: Record<ClipDirection, string> = {
  up: "inset(100% 0 0 0)",
  down: "inset(0 0 100% 0)",
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
};

export function buildClipReveal(
  target: HTMLElement,
  { direction = "up", duration = 1.2, easeName = ease.exit, delay = 0 }: ClipRevealOptions = {},
) {
  gsap.set(target, { clipPath: clipFrom[direction] });
  return gsap.to(target, {
    clipPath: "inset(0% 0% 0% 0%)",
    duration,
    ease: easeName,
    delay,
  });
}
