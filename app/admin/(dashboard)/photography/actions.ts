"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { photoSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";

export type PhotoFormState = { error?: string };

export async function upsertPhoto(
  _prevState: PhotoFormState,
  formData: FormData
): Promise<PhotoFormState> {
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
    return { error: uploadError };
  }

  const parsed = photoSchema.safeParse({
    url: resolvedUrl ?? "",
    caption: formData.get("caption"),
    altText: formData.get("altText"),
    order: formData.get("order"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data = { ...parsed.data, caption: parsed.data.caption || null };

  if (id) {
    await prisma.photo.update({ where: { id }, data });
  } else {
    await prisma.photo.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/photography");
  return {};
}

export async function deletePhoto(id: string) {
  await prisma.photo.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/photography");
}
