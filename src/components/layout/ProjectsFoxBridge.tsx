"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSiteStore } from "@/lib/store";
import { buildProjectsFoxGuide, type ProjectsFoxGeometry } from "./ProjectsFoxBridge.animations";
import { FoxIcon } from "@/components/ui/FoxIcon";

interface Geometry extends ProjectsFoxGeometry {
  top: number;
  height: number;
  width: number;
}

// A small fox cameo that bounces in beside the Projects index number and
// hops in place on every next/prev switch. Scoped entirely to Projects —
// no hand-off to Contact.
export function ProjectsFoxBridge() {
  const svgRef = useRef<SVGSVGElement>(null);
  const outerGroupRef = useRef<SVGGElement>(null);
  const foxGroupRef = useRef<SVGGElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const reducedMotion = useReducedMotion();
  const loadingComplete = useSiteStore((state) => state.loadingComplete);

  useLayoutEffect(() => {
    const measure = () => {
      const indexEl = document.querySelector('[data-fox-node="project-index"]');
      if (!indexEl) {
        setGeometry(null);
        return;
      }
      const indexRect = indexEl.getBoundingClientRect();
      if (indexRect.width === 0) {
        setGeometry(null);
        return;
      }

      const top = indexRect.top + window.scrollY - 60;
      // The fox's own local origin sits mid-body, with its feet roughly
      // this many (scaled) units below it — anchoring straight at the
      // index number's own top edge put the feet, and the rest of the body
      // above them, squarely on top of the number. Perching it this far
      // above instead leaves the number fully readable underneath.
      const INDEX_PERCH_OFFSET = 24;
      const indexAnchor = {
        x: indexRect.left + indexRect.width / 2,
        y: indexRect.top + window.scrollY - top - INDEX_PERCH_OFFSET,
      };
      const height = indexAnchor.y + 60;
      const width = indexAnchor.x + 40;

      setGeometry({ top, height, width, indexAnchor });
    };

    measure();
    window.addEventListener("resize", measure);

    // A fixed timeout can't be trusted to land after every layout-affecting
    // thing has settled — confirmed empirically: the controls row shifts a
    // one-time ~16px sometime during the page's own load/entrance sequence,
    // at a moment that isn't consistently before or after any single fixed
    // delay. A ResizeObserver on <body> re-measures whenever that happens,
    // whatever the cause, instead of guessing a timing window.
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, [loadingComplete]);

  useGSAP(
    () => {
      if (!geometry || !outerGroupRef.current || !foxGroupRef.current) return;
      const projectsSection = document.getElementById("projects");
      if (!projectsSection) return;
      return buildProjectsFoxGuide(
        {
          projectsSection,
          outerGroup: outerGroupRef.current,
          foxGroup: foxGroupRef.current,
          svgTop: geometry.top,
        },
        geometry,
        reducedMotion,
      );
    },
    { dependencies: [geometry, reducedMotion], revertOnUpdate: true },
  );

  if (!geometry) return null;

  const { top, height, width } = geometry;

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute left-0 hidden sm:block"
      style={{ top, height, width, overflow: "visible" }}
    >
      <g ref={outerGroupRef}>
        {/* Small static recenter — the icon's local origin sits mid-body,
            not at its true bounding-box center, so anchoring straight at
            (0,0) reads as slightly off-center from whatever it's perched
            above. */}
        <g ref={foxGroupRef} style={{ color: "var(--accent)" }} transform="translate(5.3, 0)">
          <FoxIcon />
        </g>
      </g>
    </svg>
  );
}
