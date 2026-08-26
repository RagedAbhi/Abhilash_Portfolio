"use client";

import { useSyncExternalStore } from "react";
import { useSiteStore } from "@/lib/store";
import { SunIcon, MoonIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSiteStore((state) => state.theme);
  const toggleTheme = useSiteStore((state) => state.toggleTheme);
  // The store's theme can already be "light" on the very first client render
  // (read from localStorage at store-creation time), but SSR always renders
  // "dark" (no access to localStorage) — so until mount is confirmed, display
  // as if theme is "dark" to match the server output exactly, then correct
  // immediately after. Same SSR-safe pattern as useMediaQuery.ts, which avoids
  // the hydration mismatch this button's icon/label would otherwise hit.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const displayedTheme = mounted ? theme : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-cursor="link"
      aria-label={displayedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("flex h-4 w-4 items-center justify-center text-fg-muted transition-colors hover:text-fg", className)}
    >
      {displayedTheme === "dark" ? <SunIcon className="h-full w-full" /> : <MoonIcon className="h-full w-full" />}
    </button>
  );
}
