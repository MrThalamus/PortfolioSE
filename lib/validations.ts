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

export const certificateSchema = z.object({
  name: z.string().min(1, "Certificate name is required"),
  issuingOrganization: z.string().min(1, "Issuing organization is required"),
  dateEarned: z.coerce.date({ message: "A valid date is required" }),
  credentialUrl: z.string().url().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
});

export const beyondAcademicsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  role: z.string().optional().or(z.literal("")),
  year: z.string().min(1, "Year is required"),
  description: z.string().optional().or(z.literal("")),
  imageUrl: imageRef().nullable(),
  order: z.coerce.number().int().default(0),
});

export const photoSchema = z.object({
  url: imageRef("A valid image URL is required"),
  caption: z.string().optional().or(z.literal("")),
  altText: z.string().min(1, "Alt text is required for accessibility"),
  order: z.coerce.number().int().default(0),
});

export const galleryImageSchema = photoSchema;

export const involvementTypeEnum = z.enum(["JOB", "CLUB", "RESEARCH_LAB", "VOLUNTEER", "OTHER"]);

export const involvementSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  role: z.string().min(1, "Role is required"),
  type: involvementTypeEnum.default("OTHER"),
  period: z.string().min(1, "Period is required"),
  current: z.coerce.boolean().default(false),
  description: z.string().optional().or(z.literal("")),
  link: z.string().url().optional().or(z.literal("")),
  imageUrl: imageRef().nullable(),
  order: z.coerce.number().int().default(0),
});

export const researchStatusEnum = z.enum(["ONGOING", "SUBMITTED", "PUBLISHED"]);

export const researchItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  venue: z.string().optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
  year: z.coerce.number().int().min(1900).max(3000),
  status: researchStatusEnum.default("ONGOING"),
  description: z.string().optional().or(z.literal("")),
  link: z.string().url().optional().or(z.literal("")),
  imageUrl: imageRef().nullable(),
  order: z.coerce.number().int().default(0),
});

export const skillGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nickname: z.string().optional().or(z.literal("")),
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

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(1, "Message is required").max(5000),
  // Honeypot: real visitors never see or fill this field. If it's non-empty,
  // the submission is almost certainly a bot. Named "_gotcha" (not "company"/
  // "website"/etc.) specifically to avoid password-manager and browser
  // autofill heuristics, which target recognizable field names regardless of
  // autocomplete="off" — a real visitor's autofill silently killed their own
  // message this way once already.
  _gotcha: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});
