"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { extracurricularSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";

export type ExtracurricularFormState = { error?: string };

export async function upsertExtracurricular(
  _prevState: ExtracurricularFormState,
  formData: FormData
): Promise<ExtracurricularFormState> {
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");

  const { url: imageUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput: String(formData.get("imageUrl") ?? ""),
    existingUrl: String(formData.get("existingImageUrl") ?? "") || null,
    remove: formData.get("removeImage") === "on",
    pathPrefix: "extracurricular",
  });

  const parsed = extracurricularSchema.safeParse({
    activity: formData.get("activity"),
    role: formData.get("role"),
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
    await prisma.extracurricularEntry.update({ where: { id }, data });
  } else {
    await prisma.extracurricularEntry.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/extracurricular");
  return {};
}

export async function deleteExtracurricular(id: string) {
  await prisma.extracurricularEntry.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/extracurricular");
}
