import { prisma } from "./prisma";

export async function getProjects() {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({ where: { slug } });
}

export async function getAchievements() {
  return prisma.achievement.findMany({ orderBy: { order: "asc" } });
}

export async function getExtracurriculars() {
  return prisma.extracurricularEntry.findMany({ orderBy: { order: "asc" } });
}

export async function getVolunteerEntries() {
  return prisma.volunteerEntry.findMany({ orderBy: { order: "asc" } });
}

export async function getPhotos() {
  return prisma.photo.findMany({ orderBy: { order: "asc" } });
}

export async function getProfile() {
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } });
  return profile;
}

export type SkillGroup = {
  category: string;
  items: string[];
};
