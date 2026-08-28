"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { beyondAcademicsSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type BeyondAcademicsFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["title", "role", "year", "description", "order", "imageUrl"];

export async function upsertBeyondAcademics(
  _prevState: BeyondAcademicsFormState,
  formData: FormData
): Promise<BeyondAcademicsFormState> {
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

  if (id) {
    await prisma.beyondAcademicsEntry.update({ where: { id }, data });
  } else {
    await prisma.beyondAcademicsEntry.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/beyond-academics");
  return {};
}

export async function deleteBeyondAcademics(id: string) {
  await prisma.beyondAcademicsEntry.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/beyond-academics");
}
