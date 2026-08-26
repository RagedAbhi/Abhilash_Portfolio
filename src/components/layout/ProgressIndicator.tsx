"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function ProgressIndicator() {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!barRef.current) return;
      gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });

      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          gsap.set(barRef.current, { scaleX: self.progress });
        },
      });

      return () => trigger.kill();
    },
    { scope: barRef },
  );

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-fg/5">
      <div ref={barRef} className="h-full bg-accent" />
    </div>
  );
}
