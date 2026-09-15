import { statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { reader } from "./reader";

// Keystatic overwrites the same file path on every re-upload (e.g. re-uploading
// a new portrait still saves to /images/portrait.png), so the URL never changes
// between edits — both next/image's optimizer cache and the browser's own HTTP
// cache then keep serving the old bytes indefinitely. Appending the file's own
// last-modified time as a query string gives each real change a distinct URL,
// busting both caches automatically.
function withCacheBust(publicPath: string): string {
  if (!publicPath) return publicPath;
  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    const { mtimeMs } = statSync(filePath);
    return `${publicPath}?v=${Math.floor(mtimeMs)}`;
  } catch {
    return publicPath;
  }
}

export interface MediaAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

// Lets a card size itself to the image's real aspect ratio (no cropping, no
// letterboxing) instead of forcing it into a fixed box shape.
async function getImageDimensions(publicPath: string): Promise<{ width: number; height: number } | undefined> {
  if (!publicPath) return undefined;
  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    const { width, height } = await sharp(filePath).metadata();
    if (!width || !height) return undefined;
    return { width, height };
  } catch {
    return undefined;
  }
}

export interface Project {
  slug: string;
  title: string;
  year?: number;
  role: string;
  summary: string;
  description: string;
  stack: string[];
  coverImage: MediaAsset;
  link?: string;
  repo?: string;
  featured: boolean;
  order: number;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
  order: number;
}

export interface SkillItem {
  name: string;
  level: "familiar" | "proficient" | "expert";
}

export interface SkillGroup {
  category: string;
  items: SkillItem[];
  order: number;
}

export interface SiteMeta {
  name: string;
  role: string;
  tagline: string;
  subline: string;
  email: string;
  socials: { label: string; href: string }[];
  portrait: MediaAsset;
  contactHeadline: string;
  resumeUrl?: string;
}

export async function getSiteSettings(): Promise<SiteMeta> {
  const data = await reader.singletons.siteSettings.read();
  if (!data) {
    throw new Error("Missing siteSettings content — open /keystatic and fill in Site Settings.");
  }
  return {
    name: data.name,
    role: data.role,
    tagline: data.tagline,
    subline: data.subline,
    email: data.email,
    socials: data.socials.map((s) => ({ label: s.label, href: s.href })),
    portrait: { src: withCacheBust(data.portrait ?? ""), alt: data.portraitAlt ?? "" },
    contactHeadline: data.contactHeadline,
    resumeUrl: data.resume || undefined,
  };
}

export async function getAboutBeats(): Promise<string[]> {
  const data = await reader.singletons.aboutContent.read();
  return data ? [...data.beats] : [];
}

export interface FunFact {
  emoji: string;
  label: string;
  text: string;
}

export async function getFunFacts(): Promise<FunFact[]> {
  const data = await reader.singletons.funFacts.read();
  if (!data) return [];
  return data.facts.map((f) => ({ emoji: f.emoji, label: f.label, text: f.text }));
}

export async function getProjects(): Promise<Project[]> {
  const entries = await reader.collections.projects.all();
  const projects = await Promise.all(
    entries.map(async ({ slug, entry }) => {
      const coverPath = entry.coverImage ?? "";
      const dimensions = await getImageDimensions(coverPath);
      return {
        slug,
        title: entry.title,
        year: entry.year ?? undefined,
        role: entry.role,
        summary: entry.summary,
        description: entry.description,
        stack: [...entry.stack],
        coverImage: { src: withCacheBust(coverPath), alt: entry.coverImageAlt ?? "", ...dimensions },
        link: entry.link || undefined,
        repo: entry.repo || undefined,
        featured: entry.featured,
        order: entry.order ?? 0,
      };
    }),
  );
  return projects.sort((a, b) => a.order - b.order);
}

export async function getExperience(): Promise<ExperienceEntry[]> {
  const entries = await reader.collections.experience.all();
  return entries
    .map(({ slug, entry }) => ({
      id: slug,
      company: entry.company,
      role: entry.role,
      startDate: entry.startDate,
      endDate: entry.endDate,
      summary: entry.summary,
      highlights: [...entry.highlights],
      order: entry.order ?? 0,
    }))
    .sort((a, b) => a.order - b.order);
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  const entries = await reader.collections.skillGroups.all();
  return entries
    .map(({ entry }) => ({
      category: entry.category,
      items: entry.items.map((item) => ({
        name: item.name,
        level: item.level as SkillItem["level"],
      })),
      order: entry.order ?? 0,
    }))
    .sort((a, b) => a.order - b.order);
}
