import { Hero } from "@/components/sections/Hero/Hero";
import { About } from "@/components/sections/About/About";
import { Skills } from "@/components/sections/Skills/Skills";
import { Experience } from "@/components/sections/Experience/Experience";
import { Projects } from "@/components/sections/Projects/Projects";
import { Contact } from "@/components/sections/Contact/Contact";
import {
  getSiteSettings,
  getAboutBeats,
  getProjects,
  getExperience,
  getSkillGroups,
} from "@/lib/keystatic/content";

export default async function Home() {
  const [site, beats, projects, experience, skillGroups] = await Promise.all([
    getSiteSettings(),
    getAboutBeats(),
    getProjects(),
    getExperience(),
    getSkillGroups(),
  ]);

  return (
    <main>
      <Hero site={site} />
      <section id="formation" className="border-t border-fg/5">
        <About beats={beats} portrait={site.portrait} />
        <Skills groups={skillGroups} />
      </section>
      <section id="proof" className="border-t border-fg/5">
        <Experience entries={experience} />
        <Projects projects={projects} />
      </section>
      <section id="invitation" className="border-t border-fg/5">
        <Contact site={site} />
      </section>
    </main>
  );
}
