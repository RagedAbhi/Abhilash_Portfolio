import { reader } from "./reader";

export interface MediaAsset {
  src: string;
  alt: string;
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
    portrait: { src: data.portrait ?? "", alt: data.portraitAlt ?? "" },
    contactHeadline: data.contactHeadline,
    resumeUrl: data.resume || undefined,
  };
}

export async function getAboutBeats(): Promise<string[]> {
  const data = await reader.singletons.aboutContent.read();
  return data ? [...data.beats] : [];
}

export async function getProjects(): Promise<Project[]> {
  const entries = await reader.collections.projects.all();
  return entries
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      year: entry.year ?? undefined,
      role: entry.role,
      summary: entry.summary,
      description: entry.description,
      stack: [...entry.stack],
      coverImage: { src: entry.coverImage ?? "", alt: entry.coverImageAlt ?? "" },
      link: entry.link || undefined,
      repo: entry.repo || undefined,
      featured: entry.featured,
      order: entry.order ?? 0,
    }))
    .sort((a, b) => a.order - b.order);
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
