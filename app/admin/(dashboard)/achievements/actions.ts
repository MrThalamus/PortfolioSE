"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { achievementSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";

export type AchievementFormState = { error?: string };

export async function upsertAchievement(
  _prevState: AchievementFormState,
  formData: FormData
): Promise<AchievementFormState> {
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");

  const { url: imageUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput: String(formData.get("imageUrl") ?? ""),
    existingUrl: String(formData.get("existingImageUrl") ?? "") || null,
    remove: formData.get("removeImage") === "on",
    pathPrefix: "achievements",
  });

  const parsed = achievementSchema.safeParse({
    title: formData.get("title"),
    eventName: formData.get("eventName"),
    year: formData.get("year"),
    description: formData.get("description"),
    imageUrl,
    order: formData.get("order"),
  });

  if (uploadError) {
    return { error: uploadError };
  }

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data = { ...parsed.data, description: parsed.data.description || null };

  if (id) {
    await prisma.achievement.update({ where: { id }, data });
  } else {
    await prisma.achievement.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/achievements");
  return {};
}

export async function deleteAchievement(id: string) {
  await prisma.achievement.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/achievements");
}
