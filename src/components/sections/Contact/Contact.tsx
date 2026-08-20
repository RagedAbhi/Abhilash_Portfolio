"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { SiteMeta } from "@/lib/keystatic/content";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { DownloadIcon } from "@/components/ui/icons";
import { buildContactReveal } from "./Contact.animations";

export function Contact({ site }: { site: SiteMeta }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!sectionRef.current || !headlineRef.current || !metaRef.current) return;
      return buildContactReveal(
        { section: sectionRef.current, headline: headlineRef.current, meta: metaRef.current },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-screen flex-col justify-center gap-12 px-6 py-32 sm:px-10"
    >
      <span className="font-mono text-xs uppercase tracking-widest text-fg-muted">
        04 — Invitation
      </span>
      <h2
        ref={headlineRef}
        className="max-w-4xl font-display text-[11vw] leading-[0.95] tracking-tight text-fg sm:text-[7vw]"
      >
        {site.contactHeadline}
      </h2>
      <div ref={metaRef} className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <MagneticButton
          href={`mailto:${site.email}`}
          className="rounded-full border border-white/15 px-8 py-4 font-mono text-sm uppercase tracking-widest text-fg transition-colors hover:border-accent hover:text-accent"
        >
          {site.email}
        </MagneticButton>
        <div className="flex flex-col items-start gap-4 sm:items-end">
          {site.resumeUrl && (
            <a
              href={site.resumeUrl}
              download
              data-cursor="link"
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Download Resume
            </a>
          )}
          <div className="flex gap-6">
            {site.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                data-cursor="link"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
