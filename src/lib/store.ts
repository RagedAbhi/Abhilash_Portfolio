import { create } from "zustand";

export type CursorVariant = "default" | "link" | "hover" | "drag";
export type Theme = "dark" | "light";

interface SiteState {
  progress: number;
  activeSection: string | null;
  cursorVariant: CursorVariant;
  loadingComplete: boolean;
  theme: Theme;
  setProgress: (progress: number) => void;
  setActiveSection: (id: string | null) => void;
  setCursorVariant: (variant: CursorVariant) => void;
  setLoadingComplete: (complete: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export const useSiteStore = create<SiteState>((set) => ({
  progress: 0,
  activeSection: null,
  cursorVariant: "default",
  loadingComplete: false,
  theme: getInitialTheme(),
  setProgress: (progress) => set({ progress }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setCursorVariant: (cursorVariant) => set({ cursorVariant }),
  setLoadingComplete: (loadingComplete) => set({ loadingComplete }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
