"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeGapAfterDelete, makeRoomForInsert, makeRoomForMove } from "@/lib/ordering";
import { beyondAcademicsSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type BeyondAcademicsFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["title", "role", "year", "description", "order", "imageUrl"];

export async function upsertBeyondAcademics(
  _prevState: BeyondAcademicsFormState,
  formData: FormData
): Promise<BeyondAcademicsFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");

  const { url: imageUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput: String(formData.get("imageUrl") ?? ""),
    existingUrl: String(formData.get("existingImageUrl") ?? "") || null,
    remove: formData.get("removeImage") === "on",
    pathPrefix: "beyond-academics",
  });

  const parsed = beyondAcademicsSchema.safeParse({
    title: formData.get("title"),
    role: formData.get("role"),
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

  const data = {
    ...parsed.data,
    role: parsed.data.role || null,
    description: parsed.data.description || null,
  };

  // Save at the requested position (0 = top), shifting the other items to
  // make room — see lib/ordering.ts.
  await prisma.$transaction(async (tx) => {
    if (id) {
      const current = await tx.beyondAcademicsEntry.findUniqueOrThrow({ where: { id }, select: { order: true } });
      const order = await makeRoomForMove(tx, "BeyondAcademicsEntry", id, current.order, data.order);
      await tx.beyondAcademicsEntry.update({ where: { id }, data: { ...data, order } });
    } else {
      const order = await makeRoomForInsert(tx, "BeyondAcademicsEntry", data.order);
      await tx.beyondAcademicsEntry.create({ data: { ...data, order } });
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/beyond-academics");
  return {};
}

export async function deleteBeyondAcademics(id: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.beyondAcademicsEntry.delete({ where: { id }, select: { order: true } });
    await closeGapAfterDelete(tx, "BeyondAcademicsEntry", deleted.order);
  });
  revalidatePath("/");
  revalidatePath("/admin/beyond-academics");
}
