"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { involvementSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type InvolvementFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["organization", "role", "type", "period", "current", "description", "link", "order", "imageUrl"];

export async function upsertInvolvement(
  _prevState: InvolvementFormState,
  formData: FormData
): Promise<InvolvementFormState> {
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");

  const { url: imageUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput: String(formData.get("imageUrl") ?? ""),
    existingUrl: String(formData.get("existingImageUrl") ?? "") || null,
    remove: formData.get("removeImage") === "on",
    pathPrefix: "involvement",
  });

  const parsed = involvementSchema.safeParse({
    organization: formData.get("organization"),
    role: formData.get("role"),
    type: formData.get("type"),
    period: formData.get("period"),
    current: formData.get("current") === "on",
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
    description: parsed.data.description || null,
    link: parsed.data.link || null,
  };

  if (id) {
    await prisma.involvement.update({ where: { id }, data });
  } else {
    await prisma.involvement.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/involvement");
  return {};
}

export async function deleteInvolvement(id: string) {
  await prisma.involvement.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/involvement");
}
