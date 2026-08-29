import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { ProjectsGrid } from "@/components/sections/Projects";
import { Research } from "@/components/sections/Research";
import { Achievements } from "@/components/sections/Achievements";
import { Certificates } from "@/components/sections/Certificates";
import { BeyondAcademics } from "@/components/sections/BeyondAcademics";
import { Involvement } from "@/components/sections/Involvement";
import { Photography } from "@/components/sections/Photography";
import { Gallery } from "@/components/sections/Gallery";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Section } from "@/components/ui/Section";
import {
  getProjects,
  getResearchItems,
  getAchievements,
  getCertificates,
  getBeyondAcademicsEntries,
  getInvolvements,
  getPhotos,
  getGalleryImages,
  getProfile,
  type SkillGroup,
} from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [profile, projects, researchItems, achievements, certificates, beyondAcademics, involvements, photos, galleryImages] =
    await Promise.all([
      getProfile(),
      getProjects(),
      getResearchItems(),
      getAchievements(),
      getCertificates(),
      getBeyondAcademicsEntries(),
      getInvolvements(),
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
          id="research"
          index="02"
          eyebrow="Ongoing work"
          title="Research"
          className="border-t border-border-default"
        >
          <Research items={researchItems} />
        </Section>

        <Section
          id="achievements"
          index="03"
          eyebrow="Recognition"
          title="Milestones & Achievements"
          className="border-t border-border-default"
        >
          <Achievements achievements={achievements} />
        </Section>

        <Section
          id="certificates"
          index="04"
          eyebrow="Credentials"
          title="Certificates"
          className="border-t border-border-default"
        >
          <Certificates certificates={certificates} />
        </Section>

        <Section
          id="beyond-academics"
          index="05"
          eyebrow="Outside coursework"
          title="Beyond Academics"
          className="border-t border-border-default"
        >
          <BeyondAcademics entries={beyondAcademics} />
        </Section>

        <Section
          id="involvement"
          index="06"
          eyebrow="Where I engage"
          title="Involvement"
          className="border-t border-border-default"
        >
          <Involvement involvements={involvements} />
        </Section>

        <Section
          id="photography"
          index="07"
          eyebrow="Hobby"
          title="Photography"
          className="border-t border-border-default"
        >
          <Photography photos={photos} />
        </Section>

        <Section
          id="gallery"
          index="08"
          eyebrow="Moments"
          title="Gallery"
          className="border-t border-border-default"
        >
          <Gallery images={galleryImages} />
        </Section>

        <Section
          id="about"
          index="09"
          eyebrow="Background"
          title="About"
          className="border-t border-border-default"
        >
          <About bio={profile.bio} skills={skills} />
        </Section>

        <Section
          id="contact"
          index="10"
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
