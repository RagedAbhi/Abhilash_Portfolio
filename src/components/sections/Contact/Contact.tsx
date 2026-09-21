"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { SiteMeta, FunFact } from "@/lib/keystatic/content";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { DownloadIcon } from "@/components/ui/icons";
import { FunFactCards } from "./FunFactCards";
import { buildContactReveal } from "./Contact.animations";

type FormStatus = "idle" | "sent";

export function Contact({ site, funFacts }: { site: SiteMeta; funFacts: FunFact[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reducedMotion = useReducedMotion();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !glowRef.current ||
        !headlineRef.current ||
        !pillsRef.current ||
        !dividerRef.current ||
        !fieldsRef.current
      ) {
        return;
      }
      return buildContactReveal(
        {
          section: sectionRef.current,
          glow: glowRef.current,
          headline: headlineRef.current,
          pills: Array.from(pillsRef.current.children) as HTMLElement[],
          divider: dividerRef.current,
          formFields: Array.from(fieldsRef.current.children) as HTMLElement[],
        },
        reducedMotion,
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true },
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // UI-only for now — no backend wired up yet. Swap this for a real
    // submission (API route, Formspree, etc.) once one is chosen.
    console.log("Contact form submission:", form);
    setStatus("sent");
  };

  const inputClass =
    "w-full rounded-md border border-fg/15 bg-transparent px-4 py-3 text-sm text-fg outline-none transition-all duration-300 placeholder:text-fg-muted/50 focus:border-accent focus:ring-2 focus:ring-accent/20";

  const pillClass =
    "group relative overflow-hidden rounded-full border border-fg/15 px-6 py-3 font-mono text-xs uppercase tracking-widest text-fg transition-colors duration-300 hover:border-accent hover:text-bg";

  return (
    <div
      ref={sectionRef}
      id="contact"
      className="relative flex min-h-screen flex-col overflow-hidden px-6 py-20 sm:px-10 md:flex-row md:items-center md:gap-16 md:py-24"
    >
      {/* The same soft radial-blur motif used behind Hero's and About's
          portrait, so the only color in this section reads as a continuation
          of the site's language — with a slow, ambient breathing drift. */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[55vw] w-[55vw] max-h-[700px] max-w-[700px] rounded-full bg-accent/25 blur-[140px]"
      />

      <div className="relative flex flex-col justify-between gap-12 md:w-[42%]">
        <div>
          <span className="font-mono text-lg uppercase tracking-widest text-accent sm:text-2xl">
            05 — Contact
          </span>
          <h2
            ref={headlineRef}
            className="mt-6 max-w-md font-display text-5xl leading-[1.05] tracking-tight text-fg sm:text-7xl"
          >
            {site.contactHeadline}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <div ref={pillsRef} className="flex flex-wrap gap-3">
            <MagneticButton href={`mailto:${site.email}`} className={pillClass}>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-accent transition-transform duration-300 ease-out group-hover:translate-x-0" />
              <span className="relative">{site.email}</span>
            </MagneticButton>
            {site.socials.map((social) => (
              <MagneticButton
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={pillClass}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-accent transition-transform duration-300 ease-out group-hover:translate-x-0" />
                <span className="relative">{social.label}</span>
              </MagneticButton>
            ))}
          </div>
          {site.resumeUrl && (
            <a
              href={site.resumeUrl}
              download
              data-cursor="link"
              className="flex w-fit items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Download Resume
            </a>
          )}
        </div>
      </div>

      <div className="relative mt-16 pt-16 md:mt-0 md:flex-1 md:pl-16 md:pt-0">
        <div
          ref={dividerRef}
          aria-hidden
          className="absolute left-0 top-0 h-px w-full bg-accent/30 md:h-full md:w-px"
        />
        <form ref={formRef} onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-5">
          <div ref={fieldsRef} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                Name
              </span>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                Email
              </span>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">
                Message
              </span>
              <textarea
                required
                rows={4}
                placeholder="What are you building?"
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                className={`${inputClass} resize-none`}
              />
            </label>
            <button
              type="submit"
              data-cursor="link"
              className="mt-2 w-fit rounded-full bg-accent px-8 py-3 font-mono text-sm uppercase tracking-widest text-bg transition-all duration-300 hover:scale-[1.03] hover:opacity-90"
            >
              {status === "sent" ? "Sent — thank you" : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {funFacts.length > 0 && (
        <div className="absolute bottom-6 right-6 z-10 sm:bottom-10 sm:right-10">
          <FunFactCards facts={funFacts} />
        </div>
      )}
    </div>
  );
}
