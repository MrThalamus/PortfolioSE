"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeGapAfterDelete, makeRoomForInsert, makeRoomForMove } from "@/lib/ordering";
import { involvementSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type InvolvementFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["organization", "role", "type", "period", "current", "description", "link", "order", "imageUrl"];

export async function upsertInvolvement(
  _prevState: InvolvementFormState,
  formData: FormData
): Promise<InvolvementFormState> {
  await requireAdmin();
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

  // Save at the requested position (0 = top), shifting the other items to
  // make room — see lib/ordering.ts.
  await prisma.$transaction(async (tx) => {
    if (id) {
      const current = await tx.involvement.findUniqueOrThrow({ where: { id }, select: { order: true } });
      const order = await makeRoomForMove(tx, "Involvement", id, current.order, data.order);
      await tx.involvement.update({ where: { id }, data: { ...data, order } });
    } else {
      const order = await makeRoomForInsert(tx, "Involvement", data.order);
      await tx.involvement.create({ data: { ...data, order } });
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/involvement");
  return {};
}

export async function deleteInvolvement(id: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.involvement.delete({ where: { id }, select: { order: true } });
    await closeGapAfterDelete(tx, "Involvement", deleted.order);
  });
  revalidatePath("/");
  revalidatePath("/admin/involvement");
}
