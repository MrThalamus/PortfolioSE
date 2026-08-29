import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ProjectsGrid } from "@/components/sections/Projects";
import { Achievements } from "@/components/sections/Achievements";
import { BeyondAcademics } from "@/components/sections/BeyondAcademics";
import { Photography } from "@/components/sections/Photography";
import { Gallery } from "@/components/sections/Gallery";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Section } from "@/components/ui/Section";
import {
  getProjects,
  getAchievements,
  getBeyondAcademicsEntries,
  getPhotos,
  getGalleryImages,
  getProfile,
  type SkillGroup,
} from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [profile, projects, achievements, beyondAcademics, photos, galleryImages] =
    await Promise.all([
      getProfile(),
      getProjects(),
      getAchievements(),
      getBeyondAcademicsEntries(),
      getPhotos(),
      getGalleryImages(),
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
          title="Achievements & Competitions"
          className="border-t border-border-default"
        >
          <Achievements achievements={achievements} />
        </Section>

        <Section
          id="beyond-academics"
          index="03"
          eyebrow="Outside coursework"
          title="Beyond Academics"
          className="border-t border-border-default"
        >
          <BeyondAcademics entries={beyondAcademics} />
        </Section>

        <Section
          id="photography"
          index="04"
          eyebrow="Hobby"
          title="Photography"
          className="border-t border-border-default"
        >
          <Photography photos={photos} />
        </Section>

        <Section
          id="gallery"
          index="05"
          eyebrow="Moments"
          title="Gallery"
          className="border-t border-border-default"
        >
          <Gallery images={galleryImages} />
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
