"use client";

import { useLenis } from "@/hooks/useLenis";
import { SocialLinks } from "@/components/ui/SocialLinks";

interface FooterProps {
  name: string;
  role: string;
  socials: { label: string; href: string }[];
  year: number;
}

export function Footer({ name, role, socials, year }: FooterProps) {
  const lenis = useLenis();

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative border-t border-fg/10 px-6 pb-8 pt-12 sm:px-10">
      <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-display text-3xl text-fg">{name}</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">{role}</p>
        </div>

        <div className="flex items-center gap-6">
          <SocialLinks socials={socials} />
          <button
            type="button"
            onClick={scrollToTop}
            data-cursor="link"
            className="group flex items-center gap-2 rounded-full border border-fg/15 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-fg transition-colors hover:border-accent hover:text-accent"
          >
            Back to top
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5">
              ↑
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-fg/5 pt-6 font-mono text-[11px] uppercase tracking-widest text-fg-muted/70 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {year} {name}
        </span>
        <span>Built with Next.js · Tailwind · GSAP</span>
      </div>
    </footer>
  );
}
