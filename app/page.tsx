import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ProjectsGrid } from "@/components/sections/Projects";
import { Achievements } from "@/components/sections/Achievements";
import { Extracurricular } from "@/components/sections/Extracurricular";
import { Volunteering } from "@/components/sections/Volunteering";
import { Photography } from "@/components/sections/Photography";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Section } from "@/components/ui/Section";
import {
  getProjects,
  getAchievements,
  getExtracurriculars,
  getVolunteerEntries,
  getPhotos,
  getProfile,
  type SkillGroup,
} from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [profile, projects, achievements, extracurriculars, volunteering, photos] =
    await Promise.all([
      getProfile(),
      getProjects(),
      getAchievements(),
      getExtracurriculars(),
      getVolunteerEntries(),
      getPhotos(),
    ]);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h1 className="mb-2 text-xl font-semibold">No profile found</h1>
          <p className="font-mono text-sm text-foreground-muted">
            Run <code>npm run db:seed</code> to create placeholder content, or add a profile
            from /admin/profile.
          </p>
        </div>
      </main>
    );
  }

  const skills = (profile.skills as unknown as SkillGroup[]) ?? [];
  const shortName = profile.nickname || profile.name.split(" ")[0];

  return (
    <>
      <Nav shortName={shortName} />
      <main>
        <Hero profile={profile} />

        <Section id="projects" index="01" eyebrow="Selected work" title="Projects">
          <ProjectsGrid projects={projects} />
        </Section>

        <Section
          id="achievements"
          index="02"
          eyebrow="Recognition"
          title="Achievements"
          className="border-t border-border-default"
        >
          <Achievements achievements={achievements} />
        </Section>

        <Section
          id="activities"
          index="03"
          eyebrow="Beyond the code"
          title="Extracurricular Activities"
          className="border-t border-border-default"
        >
          <Extracurricular entries={extracurriculars} />
        </Section>

        <Section
          id="volunteering"
          index="04"
          eyebrow="Giving back"
          title="Volunteering"
          className="border-t border-border-default"
        >
          <Volunteering entries={volunteering} />
        </Section>

        <Section
          id="photography"
          index="05"
          eyebrow="Side project"
          title="Photography"
          className="border-t border-border-default"
        >
          <Photography photos={photos} />
        </Section>

        <Section
          id="about"
          index="06"
          eyebrow="Background"
          title="About"
          className="border-t border-border-default"
        >
          <About bio={profile.bio} skills={skills} />
        </Section>

        <Section
          id="contact"
          index="07"
          eyebrow="Get in touch"
          title="Contact"
          className="border-t border-border-default"
        >
          <Contact profile={profile} />
        </Section>
      </main>
      <Footer name={profile.name} />
    </>
  );
}
