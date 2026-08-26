"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Project } from "@/lib/keystatic/content";
import { buildProjectsScrub } from "./Projects.animations";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, GitHubIcon } from "@/components/ui/icons";

const coverAccents = ["--accent-arrival", "--accent-formation", "--accent-proof", "--accent-invitation"];

export function Projects({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggleDescription = (index: number) => {
    const el = descRefs.current[index];
    if (!el) return;
    const isExpanding = !expanded[index];
    setExpanded((prev) => ({ ...prev, [index]: isExpanding }));

    if (reducedMotion) {
      gsap.set(el, { height: isExpanding ? "auto" : 0, autoAlpha: isExpanding ? 1 : 0 });
      return;
    }
    gsap.to(el, {
      height: isExpanding ? "auto" : 0,
      autoAlpha: isExpanding ? 1 : 0,
      duration: 0.5,
      ease: "power2.inOut",
    });
  };

  useGSAP(
    () => {
      if (!sectionRef.current || !trackRef.current) return;
      const panels = panelRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
      if (!panels.length) return;
      return buildProjectsScrub(
        { section: sectionRef.current, track: trackRef.current, panels },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div
      ref={sectionRef}
      id="projects"
      className={cn("relative", !reducedMotion && "md:h-screen md:overflow-hidden")}
    >
      <div
        ref={trackRef}
        data-cursor="drag"
        className={cn(
          "flex flex-col gap-16 px-6 pb-24 pt-4 sm:px-10",
          // Falls back to a normal vertical stack under reduced motion, matching the
          // mobile layout, since the JS-driven horizontal pin+scrub is skipped there.
          !reducedMotion && "md:h-full md:flex-row md:gap-0 md:p-0",
        )}
      >
        {projects.map((project, index) => (
          <div
            key={project.slug}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-2xl",
              project.coverImage.src ? "gap-6 pb-10 sm:pb-14" : "h-[70vh] justify-end",
              !reducedMotion &&
                "md:h-full md:w-screen md:flex-shrink-0 md:justify-end md:gap-0 md:rounded-none md:pb-0",
            )}
          >
            <div
              data-reveal-cover
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(120% 120% at 15% 10%, var(${coverAccents[index % coverAccents.length]}) 0%, transparent 45%), linear-gradient(160deg, var(--bg-elevated) 0%, var(--bg) 70%)`,
              }}
            >
              <span className="absolute -right-4 bottom-0 select-none font-display text-[40vw] font-medium leading-none text-fg/[0.04] md:text-[22vw]">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            {project.coverImage.src && (
              // Normal flex-flow sibling (pushes the meta block below it, avoiding
              // overlap) whenever panels stack vertically — mobile, or desktop under
              // reduced motion where the horizontal pin is skipped (matching the
              // track's own !reducedMotion guard). Only pulled into absolute
              // positioning for the actual pinned horizontal-gallery layout, so meta
              // can independently anchor to the panel's bottom edge.
              <div
                data-reveal-cover
                className={cn(
                  "relative z-10 mx-auto mt-16 h-[20vh] w-[min(56%,480px)] -rotate-3 overflow-hidden rounded-xl border border-fg/10 shadow-[8px_24px_45px_-10px_rgba(0,0,0,0.55)] sm:mt-20 sm:h-[26vh]",
                  !reducedMotion && "md:absolute md:left-1/2 md:top-28 md:mt-0 md:h-[30vh] md:-translate-x-1/2",
                )}
              >
                <Image
                  src={project.coverImage.src}
                  alt={project.coverImage.alt}
                  fill
                  sizes="(min-width: 768px) 60vw, 90vw"
                  className="object-cover"
                />
              </div>
            )}
            <div
              data-reveal-meta
              className="relative z-10 flex flex-col gap-3 bg-gradient-to-t from-bg via-bg/70 to-transparent p-6 pt-24 sm:p-10 sm:pt-32"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">
                {project.year ? `${project.year} — ${project.role}` : project.role}
              </span>
              <h3 className="font-display text-4xl text-fg sm:text-6xl">{project.title}</h3>
              <p className="max-w-md text-sm leading-relaxed text-fg-muted sm:text-base">
                {project.summary}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-fg/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {(project.link || project.repo) && (
                <div className="flex flex-wrap gap-4">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="view"
                      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
                    >
                      <ExternalLinkIcon className="h-3 w-3" />
                      Live Site
                    </a>
                  )}
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="view"
                      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
                    >
                      <GitHubIcon className="h-3 w-3" />
                      Source
                    </a>
                  )}
                </div>
              )}
              {project.description && (
                <button
                  type="button"
                  data-cursor="view"
                  onClick={() => toggleDescription(index)}
                  aria-expanded={Boolean(expanded[index])}
                  className="flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:text-fg"
                >
                  <span
                    className={cn(
                      "inline-block transition-transform duration-300",
                      expanded[index] && "rotate-45",
                    )}
                  >
                    +
                  </span>
                  <span className="underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-fg">
                    {expanded[index] ? "Less" : "More"}
                  </span>
                </button>
              )}
              <div
                ref={(el) => {
                  descRefs.current[index] = el;
                }}
                style={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="max-w-md pt-4 text-sm leading-relaxed text-fg-muted/80 sm:text-base">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
