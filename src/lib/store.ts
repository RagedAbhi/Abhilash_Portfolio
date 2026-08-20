import { create } from "zustand";

export type CursorVariant = "default" | "link" | "view" | "drag";

interface SiteState {
  progress: number;
  activeSection: string | null;
  cursorVariant: CursorVariant;
  loadingComplete: boolean;
  setProgress: (progress: number) => void;
  setActiveSection: (id: string | null) => void;
  setCursorVariant: (variant: CursorVariant) => void;
  setLoadingComplete: (complete: boolean) => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  progress: 0,
  activeSection: null,
  cursorVariant: "default",
  loadingComplete: false,
  setProgress: (progress) => set({ progress }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setCursorVariant: (cursorVariant) => set({ cursorVariant }),
  setLoadingComplete: (loadingComplete) => set({ loadingComplete }),
}));
