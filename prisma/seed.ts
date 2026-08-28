import { PrismaClient, ProjectType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.upsert({
    where: { id: "profile" },
    update: {},
    create: {
      id: "profile",
      name: "Your Name Placeholder",
      nickname: "Placeholder",
      tagline: "Software Engineer — .NET / Backend Systems",
      heroIntro:
        "I build reliable backend systems and APIs with .NET, C#, and modern cloud infrastructure. Replace this intro from /admin.",
      bio: "Add your full bio here from the /admin panel. Talk about your background, what you specialize in, and what you're looking for next.",
      email: "you@example.com",
      githubUrl: "https://github.com/your-username",
      linkedinUrl: "https://linkedin.com/in/your-username",
      resumeUrl: "",
      skills: [
        { category: "Languages", items: ["C#", "TypeScript", "SQL", "Python"] },
        { category: "Frameworks", items: [".NET / ASP.NET Core", "Next.js", "Entity Framework"] },
        { category: "Databases", items: ["PostgreSQL", "SQL Server", "Redis"] },
        { category: "Tools", items: ["Docker", "Git", "Azure", "GitHub Actions"] },
      ],
    },
  });

  const projectData = [
    {
      title: "Project Title Placeholder One",
      slug: "project-placeholder-one",
      summary: "Add a one-line project summary here.",
      description: "Add project description here. Explain what the project does and why it matters.",
      techStack: ["C#", ".NET 8", "PostgreSQL"],
      type: ProjectType.LIVE,
      liveUrl: "https://example.com",
      problem: "Describe the problem this project solves.",
      approach: "Describe your technical approach and architecture decisions.",
      outcome: "Describe the measurable outcome or result.",
      order: 0,
    },
    {
      title: "Project Title Placeholder Two",
      slug: "project-placeholder-two",
      summary: "Add a one-line project summary here.",
      description: "Add project description here.",
      techStack: ["TypeScript", "Next.js", "Prisma"],
      type: ProjectType.VIDEO,
      videoUrl: "",
      problem: "Describe the problem this project solves.",
      approach: "Describe your technical approach.",
      outcome: "Describe the measurable outcome.",
      order: 1,
    },
    {
      title: "Project Title Placeholder Three",
      slug: "project-placeholder-three",
      summary: "Add a one-line project summary here.",
      description: "Add project description here.",
      techStack: ["Python", "FastAPI", "Docker"],
      type: ProjectType.REPO,
      repoUrl: "https://github.com/your-username/repo",
      problem: "Describe the problem this project solves.",
      approach: "Describe your technical approach.",
      outcome: "Describe the measurable outcome.",
      order: 2,
    },
    {
      title: "Project Title Placeholder Four",
      slug: "project-placeholder-four",
      summary: "Add a one-line project summary here.",
      description: "Add project description here.",
      techStack: ["C#", "Azure Functions", "SQL Server"],
      type: ProjectType.REPO,
      repoUrl: "https://github.com/your-username/repo-four",
      order: 3,
    },
    {
      title: "Project Title Placeholder Five",
      slug: "project-placeholder-five",
      summary: "Add a one-line project summary here.",
      description: "Add project description here.",
      techStack: ["Next.js", "Tailwind CSS", "tRPC"],
      type: ProjectType.LIVE,
      liveUrl: "https://example.com",
      order: 4,
    },
    {
      title: "Project Title Placeholder Six",
      slug: "project-placeholder-six",
      summary: "Add a one-line project summary here.",
      description: "Add project description here.",
      techStack: ["C#", "gRPC", "Kubernetes"],
      type: ProjectType.REPO,
      repoUrl: "https://github.com/your-username/repo-six",
      order: 5,
    },
  ];

  for (const project of projectData) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });
  }

  const achievements = [
    { title: "1st Place — Placeholder Hackathon", eventName: "Placeholder Hackathon", year: 2024, order: 0 },
    { title: "Finalist — Placeholder Case Competition", eventName: "Placeholder Case Competition", year: 2023, order: 1 },
    { title: "Dean's List", eventName: "Placeholder University", year: 2023, order: 2 },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { id: `seed-achievement-${a.order}` },
      update: {},
      create: { id: `seed-achievement-${a.order}`, ...a },
    });
  }

  const beyondAcademics = [
    { title: "Placeholder Coding Club", role: "President", year: "2023–2024", order: 0 },
    { title: "Placeholder Nonprofit", role: "Volunteer", description: "Built internal tooling to track volunteer hours", year: "2023–Present", order: 1 },
    { title: "Placeholder Community Org", role: "Workshop Instructor", description: "Taught intro programming workshops", year: "2022–2023", order: 2 },
  ];
  for (const b of beyondAcademics) {
    await prisma.beyondAcademicsEntry.upsert({
      where: { id: `seed-beyond-academics-${b.order}` },
      update: {},
      create: { id: `seed-beyond-academics-${b.order}`, ...b },
    });
  }

  const photos = [
    { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", altText: "Placeholder landscape photo", caption: "Add your own photo via /admin", order: 0 },
    { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200", altText: "Placeholder landscape photo", caption: "Add your own photo via /admin", order: 1 },
    { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200", altText: "Placeholder landscape photo", caption: "Add your own photo via /admin", order: 2 },
  ];
  for (const p of photos) {
    await prisma.photo.upsert({
      where: { id: `seed-photo-${p.order}` },
      update: {},
      create: { id: `seed-photo-${p.order}`, ...p },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
