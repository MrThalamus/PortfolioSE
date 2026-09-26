"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeGapAfterDelete, makeRoomForInsert, makeRoomForMove } from "@/lib/ordering";
import { galleryImageSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type GalleryImageFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["url", "caption", "altText", "order"];

export async function upsertGalleryImage(
  _prevState: GalleryImageFormState,
  formData: FormData
): Promise<GalleryImageFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");
  const urlInput = String(formData.get("url") ?? "");

  const { url: resolvedUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput,
    existingUrl: null,
    remove: false,
    pathPrefix: "gallery",
  });

  if (uploadError) {
    return { error: uploadError, values: extractFormValues(formData, FIELDS) };
  }

  const parsed = galleryImageSchema.safeParse({
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
      const current = await tx.galleryImage.findUniqueOrThrow({ where: { id }, select: { order: true } });
      const order = await makeRoomForMove(tx, "GalleryImage", id, current.order, data.order);
      await tx.galleryImage.update({ where: { id }, data: { ...data, order } });
    } else {
      const order = await makeRoomForInsert(tx, "GalleryImage", data.order);
      await tx.galleryImage.create({ data: { ...data, order } });
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return {};
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.galleryImage.delete({ where: { id }, select: { order: true } });
    await closeGapAfterDelete(tx, "GalleryImage", deleted.order);
  });
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}
