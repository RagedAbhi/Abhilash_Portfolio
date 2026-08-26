"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/hooks/useLenis";
import { useSiteStore } from "@/lib/store";
import { chapters } from "@/lib/chapters";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Nav({ name }: { name: string }) {
  const navRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const activeSection = useSiteStore((state) => state.activeSection);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      if (!navRef.current) return;
      gsap.set(navRef.current, { autoAlpha: 0, y: -12 });

      const trigger = ScrollTrigger.create({
        trigger: "#arrival",
        start: "top top",
        end: "+=100%",
        onLeave: () => gsap.to(navRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }),
        onEnterBack: () => gsap.to(navRef.current, { autoAlpha: 0, y: -12, duration: 0.4 }),
      });

      return () => trigger.kill();
    },
    { scope: navRef },
  );

  const scrollToSection = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    if (lenis) {
      lenis.scrollTo(`#${id}`, { duration: 1.2 });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        ref={navRef}
        className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-6 py-6 sm:px-10"
      >
        <a
          href="#arrival"
          data-cursor="link"
          onClick={scrollToSection("arrival")}
          className="relative z-10 font-mono text-xs uppercase tracking-widest text-fg"
        >
          {name}
        </a>
        <div className="hidden items-center gap-8 sm:flex">
          <nav className="flex gap-8">
            {chapters.map((chapter, index) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                data-cursor="link"
                onClick={scrollToSection(chapter.id)}
                className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                  activeSection === chapter.id ? "text-accent" : "text-fg-muted hover:text-fg"
                }`}
              >
                {String(index + 1).padStart(2, "0")} {chapter.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="relative z-10 flex h-8 w-8 flex-col items-center justify-center gap-1.5 sm:hidden"
        >
          <span
            className={`block h-px w-5 bg-fg transition-transform duration-300 ${
              menuOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-fg transition-transform duration-300 ${
              menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </header>

      {/* Rendered outside <header> deliberately: GSAP sets a transform on the header
          for its fade/slide-in, and any transform on an ancestor creates a new
          containing block for position:fixed descendants, which would size this
          full-screen panel against the header's own small box instead of the viewport. */}
      <div
        data-mobile-nav
        className={`fixed inset-0 z-50 flex flex-col items-start justify-center gap-6 bg-bg px-6 transition-opacity duration-300 sm:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {chapters.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            onClick={scrollToSection(chapter.id)}
            className={`font-display text-4xl ${
              activeSection === chapter.id ? "text-accent" : "text-fg"
            }`}
          >
            <span className="mr-3 font-mono text-sm text-fg-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            {chapter.label}
          </a>
        ))}
        <div className="mt-4 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-fg-muted">
          <ThemeToggle />
          <span>Theme</span>
        </div>
      </div>
    </>
  );
}
