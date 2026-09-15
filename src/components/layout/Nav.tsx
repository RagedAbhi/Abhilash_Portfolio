"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/hooks/useLenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSiteStore } from "@/lib/store";
import { chapters } from "@/lib/chapters";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DownloadIcon } from "@/components/ui/icons";

export function Nav({ name, resumeUrl }: { name: string; resumeUrl?: string }) {
  const navRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reducedMotion = useReducedMotion();
  const activeSection = useSiteStore((state) => state.activeSection);
  const loadingComplete = useSiteStore((state) => state.loadingComplete);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(menuOpen);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  // Fades in once, alongside Hero's own entrance (loadingComplete), and stays
  // visible from the very first screen onward — no longer tied to scrolling
  // past Hero into the next section.
  useGSAP(
    () => {
      if (!navRef.current) return;
      gsap.set(navRef.current, { autoAlpha: 0, y: -12 });
      if (!loadingComplete) return;
      gsap.to(navRef.current, { autoAlpha: 1, y: 0, duration: 0.5 });
    },
    { scope: navRef, dependencies: [loadingComplete] },
  );

  // Hides on scroll down, reappears on scroll up — reclaims screen space
  // while reading, without ever losing the ability to jump back to nav.
  // Always shown near the very top and while the mobile menu is open.
  useGSAP(
    () => {
      // Skipped under reduced motion — a nav that slides away on scroll is a
      // UI motion some visitors specifically asked to avoid, not decoration.
      if (!navRef.current || !loadingComplete || reducedMotion) return;
      const nav = navRef.current;
      let lastY = window.scrollY;
      let hidden = false;

      const setHidden = (next: boolean) => {
        if (next === hidden) return;
        hidden = next;
        gsap.to(nav, {
          yPercent: hidden ? -130 : 0,
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      const REVEAL_ZONE = 80;

      const onScroll = (y: number) => {
        if (menuOpenRef.current || y <= REVEAL_ZONE) {
          setHidden(false);
        } else if (y > lastY) {
          setHidden(true);
        } else if (y < lastY) {
          setHidden(false);
        }
        lastY = y;
      };

      if (lenis) {
        const handler = (instance: { scroll: number }) => onScroll(instance.scroll);
        lenis.on("scroll", handler);
        return () => {
          lenis.off("scroll", handler);
        };
      }

      const handler = () => onScroll(window.scrollY);
      window.addEventListener("scroll", handler, { passive: true });
      return () => window.removeEventListener("scroll", handler);
    },
    { scope: navRef, dependencies: [loadingComplete, lenis, reducedMotion], revertOnUpdate: true },
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
          {resumeUrl && (
            <a
              href={resumeUrl}
              download
              data-cursor="link"
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Resume
            </a>
          )}
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
        {resumeUrl && (
          <a
            href={resumeUrl}
            download
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-fg-muted"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Download Resume
          </a>
        )}
        <div className="mt-4 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-fg-muted">
          <ThemeToggle />
          <span>Theme</span>
        </div>
      </div>
    </>
  );
}
