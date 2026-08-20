export interface Chapter {
  id: string;
  label: string;
  accentVar: string;
}

export const chapters: Chapter[] = [
  { id: "arrival", label: "Arrival", accentVar: "--accent-arrival" },
  { id: "formation", label: "Formation", accentVar: "--accent-formation" },
  { id: "proof", label: "Proof", accentVar: "--accent-proof" },
  { id: "invitation", label: "Invitation", accentVar: "--accent-invitation" },
];
