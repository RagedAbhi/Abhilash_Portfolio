import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "./icons";

interface Social {
  label: string;
  href: string;
}

const icons: Record<string, () => ReactElement> = {
  github: () => <GitHubIcon className="h-[18px] w-[18px]" />,
  linkedin: () => <LinkedInIcon className="h-[18px] w-[18px]" />,
  x: () => <XIcon className="h-[18px] w-[18px]" />,
};

export function SocialLinks({ socials, className }: { socials: Social[]; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {socials.map((social) => {
        const Icon = icons[social.label.toLowerCase()];
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            data-cursor="link"
            className="text-fg-muted transition-colors hover:text-accent"
          >
            {Icon ? <Icon /> : social.label}
          </a>
        );
      })}
    </div>
  );
}
