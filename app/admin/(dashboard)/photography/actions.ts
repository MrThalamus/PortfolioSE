"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeGapAfterDelete, makeRoomForInsert, makeRoomForMove } from "@/lib/ordering";
import { photoSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type PhotoFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["url", "caption", "altText", "order"];

export async function upsertPhoto(
  _prevState: PhotoFormState,
  formData: FormData
): Promise<PhotoFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");
  const urlInput = String(formData.get("url") ?? "");

  const { url: resolvedUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput,
    existingUrl: null,
    remove: false,
    pathPrefix: "photography",
  });

  if (uploadError) {
    return { error: uploadError, values: extractFormValues(formData, FIELDS) };
  }

  const parsed = photoSchema.safeParse({
    url: resolvedUrl ?? "",
    caption: formData.get("caption"),
    altText: formData.get("altText"),
    order: formData.get("order"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      values: extractFormValues(formData, FIELDS),
    };
  }

  const data = { ...parsed.data, caption: parsed.data.caption || null };

  // Save at the requested position (0 = top), shifting the other items to
  // make room — see lib/ordering.ts.
  await prisma.$transaction(async (tx) => {
    if (id) {
      const current = await tx.photo.findUniqueOrThrow({ where: { id }, select: { order: true } });
      const order = await makeRoomForMove(tx, "Photo", id, current.order, data.order);
      await tx.photo.update({ where: { id }, data: { ...data, order } });
    } else {
      const order = await makeRoomForInsert(tx, "Photo", data.order);
      await tx.photo.create({ data: { ...data, order } });
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/photography");
  return {};
}

export async function deletePhoto(id: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.photo.delete({ where: { id }, select: { order: true } });
    await closeGapAfterDelete(tx, "Photo", deleted.order);
  });
  revalidatePath("/");
  revalidatePath("/admin/photography");
}
