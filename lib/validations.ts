import { z } from "zod";

// Accepts either an absolute URL (Vercel Blob, external host) or a root-relative
// path like "/uploads/..." (the local-disk fallback used when no Blob token is set).
const imageRef = (message = "Enter a valid image URL") =>
  z.string().refine((val) => /^https?:\/\//.test(val) || val.startsWith("/"), { message });

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  techStack: z.array(z.string().min(1)).min(1, "Add at least one tech tag"),
  type: z.enum(["VIDEO", "LIVE", "REPO"]),
  videoUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  problem: z.string().optional().or(z.literal("")),
  approach: z.string().optional().or(z.literal("")),
  outcome: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  eventName: z.string().min(1, "Event name is required"),
  year: z.coerce.number().int().min(1900).max(3000),
  description: z.string().optional().or(z.literal("")),
  imageUrl: imageRef().nullable(),
  order: z.coerce.number().int().default(0),
});

export const extracurricularSchema = z.object({
  activity: z.string().min(1, "Activity is required"),
  role: z.string().min(1, "Role is required"),
  year: z.string().min(1, "Year is required"),
  description: z.string().optional().or(z.literal("")),
  imageUrl: imageRef().nullable(),
  order: z.coerce.number().int().default(0),
});

export const volunteerSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  contribution: z.string().min(1, "Contribution is required"),
  timeframe: z.string().min(1, "Timeframe is required"),
  order: z.coerce.number().int().default(0),
});

export const photoSchema = z.object({
  url: imageRef("A valid image URL is required"),
  caption: z.string().optional().or(z.literal("")),
  altText: z.string().min(1, "Alt text is required for accessibility"),
  order: z.coerce.number().int().default(0),
});

export const skillGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  heroIntro: z.string().min(1, "Hero intro is required"),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email("Valid email required"),
  avatarUrl: imageRef().nullable(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  skills: z.array(skillGroupSchema).default([]),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
