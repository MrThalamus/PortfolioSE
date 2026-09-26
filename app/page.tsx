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
import { Background3D } from "@/components/ui/Background3D";
import { ChatWidget } from "@/components/chat/ChatWidget";
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

  // Sections with no content are hidden (and dropped from the nav) rather than
  // showing an empty state to visitors. Numbers are assigned after filtering so
  // they stay sequential.
  const sections = [
    { id: "projects", eyebrow: "Selected work", title: "Projects", show: projects.length > 0, content: <ProjectsGrid projects={projects} /> },
    { id: "research", eyebrow: "Ongoing work", title: "Research", show: researchItems.length > 0, content: <Research items={researchItems} /> },
    { id: "achievements", eyebrow: "Recognition", title: "Milestones & Achievements", show: achievements.length > 0, content: <Achievements achievements={achievements} /> },
    { id: "certificates", eyebrow: "Credentials", title: "Certificates", show: certificates.length > 0, content: <Certificates certificates={certificates} /> },
    { id: "beyond-academics", eyebrow: "Outside coursework", title: "Beyond Academics", show: beyondAcademics.length > 0, content: <BeyondAcademics entries={beyondAcademics} /> },
    { id: "involvement", eyebrow: "Where I engage", title: "Involvement", show: involvements.length > 0, content: <Involvement involvements={involvements} /> },
    { id: "photography", eyebrow: "Hobby", title: "Photography", show: photos.length > 0, content: <Photography photos={photos} /> },
    { id: "gallery", eyebrow: "Moments", title: "Gallery", show: galleryImages.length > 0, content: <Gallery images={galleryImages} /> },
    { id: "about", eyebrow: "Background", title: "About", show: true, content: <About bio={profile.bio} skills={skills} /> },
    { id: "contact", eyebrow: "Get in touch", title: "Contact", show: true, content: <Contact profile={profile} /> },
  ].filter((section) => section.show);

  return (
    <>
      <Background3D />
      <Nav shortName={shortName} visibleSections={sections.map((section) => section.id)} />
      <main>
        <Hero profile={profile} />

        {sections.map((section, i) => (
          <Section
            key={section.id}
            id={section.id}
            index={String(i + 1).padStart(2, "0")}
            eyebrow={section.eyebrow}
            title={section.title}
            className={i > 0 ? "border-t border-border-default" : undefined}
          >
            {section.content}
          </Section>
        ))}
      </main>
      <Footer name={profile.name} />
      <ChatWidget name={shortName} />
    </>
  );
}
