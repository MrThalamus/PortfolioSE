"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeGapAfterDelete, makeRoomForInsert, makeRoomForMove } from "@/lib/ordering";
import { achievementSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type AchievementFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["title", "eventName", "year", "description", "order", "imageUrl"];

export async function upsertAchievement(
  _prevState: AchievementFormState,
  formData: FormData
): Promise<AchievementFormState> {
  await requireAdmin();
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
    return { error: uploadError, values: extractFormValues(formData, FIELDS) };
  }

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      values: extractFormValues(formData, FIELDS),
    };
  }

  const data = { ...parsed.data, description: parsed.data.description || null };

  // Save at the requested position (0 = top), shifting the other items to
  // make room — see lib/ordering.ts.
  await prisma.$transaction(async (tx) => {
    if (id) {
      const current = await tx.achievement.findUniqueOrThrow({ where: { id }, select: { order: true } });
      const order = await makeRoomForMove(tx, "Achievement", id, current.order, data.order);
      await tx.achievement.update({ where: { id }, data: { ...data, order } });
    } else {
      const order = await makeRoomForInsert(tx, "Achievement", data.order);
      await tx.achievement.create({ data: { ...data, order } });
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/achievements");
  return {};
}

export async function deleteAchievement(id: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.achievement.delete({ where: { id }, select: { order: true } });
    await closeGapAfterDelete(tx, "Achievement", deleted.order);
  });
  revalidatePath("/");
  revalidatePath("/admin/achievements");
}
