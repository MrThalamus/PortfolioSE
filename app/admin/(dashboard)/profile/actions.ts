"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";

export type ProfileFormState = { error?: string; success?: boolean };

export async function upsertProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  let skills: unknown = [];
  try {
    skills = JSON.parse(String(formData.get("skillsJson") ?? "[]"));
  } catch {
    return { error: "Skills data is malformed." };
  }

  const file = formData.get("file");
  const { url: avatarUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput: String(formData.get("avatarUrl") ?? ""),
    existingUrl: String(formData.get("existingAvatarUrl") ?? "") || null,
    remove: formData.get("removeAvatar") === "on",
    pathPrefix: "profile",
  });

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    tagline: formData.get("tagline"),
    heroIntro: formData.get("heroIntro"),
    bio: formData.get("bio"),
    email: formData.get("email"),
    avatarUrl,
    githubUrl: formData.get("githubUrl"),
    linkedinUrl: formData.get("linkedinUrl"),
    resumeUrl: formData.get("resumeUrl"),
    skills,
  });

  if (uploadError) {
    return { error: uploadError };
  }

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data = {
    ...parsed.data,
    nickname: parsed.data.nickname || null,
    githubUrl: parsed.data.githubUrl || null,
    linkedinUrl: parsed.data.linkedinUrl || null,
    resumeUrl: parsed.data.resumeUrl || null,
    skills: parsed.data.skills,
  };

  await prisma.profile.upsert({
    where: { id: "profile" },
    update: data,
    create: { id: "profile", ...data },
  });

  revalidatePath("/");
  revalidatePath("/admin/profile");
  return { success: true };
}
