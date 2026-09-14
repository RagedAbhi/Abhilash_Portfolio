export interface Chapter {
  id: string;
  label: string;
  accentVar: string;
}

export const chapters: Chapter[] = [
  { id: "arrival", label: "Home", accentVar: "--accent-arrival" },
  { id: "formation", label: "About", accentVar: "--accent-formation" },
  { id: "proof", label: "Experience", accentVar: "--accent-proof" },
  { id: "projects", label: "Projects", accentVar: "--accent-projects" },
  { id: "invitation", label: "Contact", accentVar: "--accent-invitation" },
];
