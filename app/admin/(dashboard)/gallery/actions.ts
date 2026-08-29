"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { galleryImageSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type GalleryImageFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["url", "caption", "altText", "order"];

export async function upsertGalleryImage(
  _prevState: GalleryImageFormState,
  formData: FormData
): Promise<GalleryImageFormState> {
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

  if (id) {
    await prisma.galleryImage.update({ where: { id }, data });
  } else {
    await prisma.galleryImage.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return {};
}

export async function deleteGalleryImage(id: string) {
  await prisma.galleryImage.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}
