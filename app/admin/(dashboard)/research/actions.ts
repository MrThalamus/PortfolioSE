"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { researchItemSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type ResearchFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["title", "venue", "role", "year", "status", "description", "link", "order", "imageUrl"];

export async function upsertResearchItem(
  _prevState: ResearchFormState,
  formData: FormData
): Promise<ResearchFormState> {
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");

  const { url: imageUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput: String(formData.get("imageUrl") ?? ""),
    existingUrl: String(formData.get("existingImageUrl") ?? "") || null,
    remove: formData.get("removeImage") === "on",
    pathPrefix: "research",
  });

  const parsed = researchItemSchema.safeParse({
    title: formData.get("title"),
    venue: formData.get("venue"),
    role: formData.get("role"),
    year: formData.get("year"),
    status: formData.get("status"),
    description: formData.get("description"),
    link: formData.get("link"),
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
    venue: parsed.data.venue || null,
    role: parsed.data.role || null,
    description: parsed.data.description || null,
    link: parsed.data.link || null,
  };

  if (id) {
    await prisma.researchItem.update({ where: { id }, data });
  } else {
    await prisma.researchItem.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/research");
  return {};
}

export async function deleteResearchItem(id: string) {
  await prisma.researchItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/research");
}
