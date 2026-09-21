"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Project } from "@/lib/keystatic/content";
import { buildProjectsReveal } from "./Projects.animations";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

const coverAccents = ["--accent-arrival", "--accent-formation", "--accent-proof", "--accent-invitation"];

export function Projects({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const prevIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const project = projects[activeIndex];

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      buildProjectsReveal(
        {
          section: sectionRef.current,
          textCol: textColRef.current,
          imageCol: imageColRef.current,
          controls: controlsRef.current,
        },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  // Crossfade + slide transition between projects, direction-matched to the
  // arrow pressed. useGSAP re-runs whenever activeIndex changes (the content
  // has already swapped by then), so it only needs to handle the "entering"
  // half — the "exiting" half runs beforehand in goTo, still on the old content.
  useGSAP(
    () => {
      if (!rowRef.current) return;
      // The fox hops to the index number's live position, which can shift a
      // few px between projects (their text columns differ in height) — so it
      // has to hop only once the new project's layout is committed, not at
      // click time.
      if (prevIndexRef.current !== activeIndex) {
        prevIndexRef.current = activeIndex;
        window.dispatchEvent(new Event("fox:project-hop"));
      }
      if (reducedMotion) {
        gsap.set(rowRef.current, { autoAlpha: 1, x: 0 });
        return;
      }
      gsap.fromTo(
        rowRef.current,
        { autoAlpha: 0, x: direction * 32 },
        { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" },
      );
    },
    { dependencies: [activeIndex], revertOnUpdate: false },
  );

  const goTo = (nextIndex: number, dir: number) => {
    setExpanded(false);
    if (!rowRef.current || reducedMotion) {
      setDirection(dir);
      setActiveIndex(nextIndex);
      return;
    }
    gsap.to(rowRef.current, {
      autoAlpha: 0,
      x: dir * -32,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setDirection(dir);
        setActiveIndex(nextIndex);
      },
    });
  };

  const goNext = () => goTo((activeIndex + 1) % projects.length, 1);
  const goPrev = () => goTo((activeIndex - 1 + projects.length) % projects.length, -1);

  const toggleDescription = () => {
    const el = descRef.current;
    if (!el) return;
    const isExpanding = !expanded;
    setExpanded(isExpanding);

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

  return (
    <div
      ref={sectionRef}
      id="projects"
      className="relative flex min-h-screen flex-col justify-center overflow-x-hidden px-6 py-24 sm:px-10"
    >
      <span className="mb-16 block font-mono text-lg uppercase tracking-widest text-accent sm:text-2xl">
        04 — Projects
      </span>
      <div ref={wrapperRef} className="w-full mx-auto max-w-7xl">
        <div ref={rowRef} className="flex flex-col gap-8 md:flex-row md:items-center md:gap-16">
          <div ref={textColRef} className="flex flex-1 flex-col gap-3 lg:flex-[38_1_0%]">
            <h3 className="font-display text-4xl text-fg sm:text-6xl">{project.title}</h3>
            {project.category && (
              <p className="font-mono text-xs uppercase tracking-widest text-accent sm:text-sm">
                {project.category}
              </p>
            )}
            <p className="max-w-md text-sm leading-relaxed text-fg-muted sm:text-base">
              {project.summary}
            </p>
            {project.stack.length > 0 && (
              <p className="font-mono text-xs uppercase tracking-widest text-fg/60">
                {project.stack.join(" · ")}
              </p>
            )}
            {(project.link || project.repo) && (
              <div className="mt-1 flex flex-wrap gap-6">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="accent"
                    className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg transition-colors hover:text-accent sm:text-sm"
                  >
                    Live
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="accent"
                    className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg transition-colors hover:text-accent sm:text-sm"
                  >
                    Source
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                )}
              </div>
            )}
            {project.description && (
              <button
                type="button"
                onClick={toggleDescription}
                aria-expanded={expanded}
                data-cursor="accent"
                className="flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:text-fg"
              >
                <span
                  className={cn("inline-block transition-transform duration-300", expanded && "rotate-45")}
                >
                  +
                </span>
                <span className="underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-fg">
                  {expanded ? "Less" : "More"}
                </span>
              </button>
            )}
            <div ref={descRef} style={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <p className="max-w-md pt-2 text-sm leading-relaxed text-fg-muted/80 sm:text-base">
                {project.description}
              </p>
            </div>
          </div>

          <div ref={imageColRef} className="w-full flex-1 lg:flex-[62_1_0%]">
            {project.coverImage.src ? (
              (() => {
                const cardClass =
                  "relative block w-full -rotate-3 overflow-hidden rounded-2xl border border-fg/10 bg-bg-elevated shadow-[8px_24px_45px_-10px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:rotate-0";
                // Sized to the cover image's own real aspect ratio — see the
                // comment on getImageDimensions in content.ts — so the card's
                // proportions match the image exactly instead of a fixed
                // 4:3 box letterboxing it with black bars whenever the real
                // image is a different shape.
                const cardStyle = {
                  aspectRatio:
                    project.coverImage.width && project.coverImage.height
                      ? `${project.coverImage.width} / ${project.coverImage.height}`
                      : "4 / 3",
                };
                const image = (
                  <Image
                    src={project.coverImage.src}
                    alt={project.coverImage.alt}
                    fill
                    sizes="(min-width: 1024px) 60vw, (min-width: 768px) 45vw, 100vw"
                    className="object-contain"
                  />
                );
                return project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title} live site`}
                    data-cursor="accent"
                    className={cardClass}
                    style={cardStyle}
                  >
                    {image}
                  </a>
                ) : (
                  <div className={cardClass} style={cardStyle}>
                    {image}
                  </div>
                );
              })()
            ) : (
              <div className="relative aspect-[4/3] w-full -rotate-3 overflow-hidden rounded-2xl border border-fg/10 bg-bg-elevated shadow-[8px_24px_45px_-10px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:rotate-0">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(120% 120% at 15% 10%, var(${coverAccents[activeIndex % coverAccents.length]}) 0%, transparent 45%), linear-gradient(160deg, var(--bg-elevated) 0%, var(--bg) 70%)`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {projects.length > 1 && (
          <div ref={controlsRef} className="mt-12 flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous project"
              data-cursor="accent"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-fg/10 text-fg transition-colors hover:bg-fg/10"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <span
              data-fox-node="project-index"
              className="font-mono text-xs uppercase tracking-widest text-fg-muted"
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next project"
              data-cursor="accent"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-fg/10 text-fg transition-colors hover:bg-fg/10"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
