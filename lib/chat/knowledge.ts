import {
  getProfile,
  getProjects,
  getResearchItems,
  getAchievements,
  getCertificates,
  getBeyondAcademicsEntries,
  getInvolvements,
  type SkillGroup,
} from "@/lib/data";

// Turns everything public on the portfolio into one plain-text reference
// sheet for the chatbot. The whole portfolio is small enough to send in
// full on every request, so there's no need for embeddings/RAG. Output is
// deterministic (ordered by `order`, no timestamps) so it stays identical
// between requests until the content itself changes.
export async function buildKnowledgeBase(): Promise<{ name: string; text: string } | null> {
  const [profile, projects, research, achievements, certificates, beyond, involvements] = await Promise.all([
    getProfile(),
    getProjects(),
    getResearchItems(),
    getAchievements(),
    getCertificates(),
    getBeyondAcademicsEntries(),
    getInvolvements(),
  ]);

  if (!profile) return null;

  const out: string[] = [];
  const line = (label: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") out.push(`${label}: ${value}`);
  };

  out.push(`# ${profile.name}`);
  line("Goes by", profile.nickname);
  line("Tagline", profile.tagline);
  line("Intro", profile.heroIntro);
  line("Email", profile.email);
  line("GitHub", profile.githubUrl);
  line("LinkedIn", profile.linkedinUrl);
  line("Resume", profile.resumeUrl);
  out.push("", "## Bio", profile.bio);

  const skills = (profile.skills as unknown as SkillGroup[]) ?? [];
  if (skills.length) {
    out.push("", "## Skills");
    for (const group of skills) out.push(`- ${group.category}: ${group.items.join(", ")}`);
  }

  if (profile.chatbotNotes?.trim()) {
    out.push("", "## Additional notes from the owner", profile.chatbotNotes.trim());
  }

  if (projects.length) {
    out.push("", "## Projects");
    for (const p of projects) {
      out.push("", `### ${p.title}`);
      line("Summary", p.summary);
      line("Tech", p.techStack.join(", "));
      line("Description", p.description);
      line("Problem", p.problem);
      line("Approach", p.approach);
      line("Outcome", p.outcome);
      line("Live demo", p.liveUrl);
      line("Source code", p.repoUrl);
      line("Video", p.videoUrl);
    }
  }

  if (research.length) {
    out.push("", "## Research");
    for (const r of research) {
      out.push("", `### ${r.title} (${r.year}, ${r.status.toLowerCase()})`);
      line("Venue", r.venue);
      line("Role", r.role);
      line("Description", r.description);
      line("Link", r.link);
    }
  }

  if (involvements.length) {
    out.push("", "## Work & involvement");
    for (const i of involvements) {
      out.push("", `### ${i.role} at ${i.organization} (${i.period}${i.current ? ", current" : ""})`);
      line("Type", i.type.replace("_", " ").toLowerCase());
      line("Description", i.description);
      line("Link", i.link);
    }
  }

  if (achievements.length) {
    out.push("", "## Achievements");
    for (const a of achievements) {
      out.push(`- ${a.title} — ${a.eventName} (${a.year})${a.description ? `: ${a.description}` : ""}`);
    }
  }

  if (certificates.length) {
    out.push("", "## Certificates");
    for (const c of certificates) {
      const earned = c.dateEarned.toISOString().slice(0, 7);
      out.push(`- ${c.name} — ${c.issuingOrganization} (${earned})${c.credentialUrl ? ` ${c.credentialUrl}` : ""}`);
    }
  }

  if (beyond.length) {
    out.push("", "## Beyond academics");
    for (const b of beyond) {
      out.push(`- ${b.title}${b.role ? ` (${b.role})` : ""}, ${b.year}${b.description ? `: ${b.description}` : ""}`);
    }
  }

  return { name: profile.nickname || profile.name, text: out.join("\n") };
}
