"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { closeGapAfterDelete, makeRoomForInsert, makeRoomForMove } from "@/lib/ordering";
import { certificateSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type CertificateFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["name", "issuingOrganization", "dateEarned", "credentialUrl", "order", "imageUrl"];

export async function upsertCertificate(
  _prevState: CertificateFormState,
  formData: FormData
): Promise<CertificateFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");

  const { url: imageUrl, error: uploadError } = await resolveImageUpload({
    file: file instanceof File ? file : null,
    urlInput: String(formData.get("imageUrl") ?? ""),
    existingUrl: String(formData.get("existingImageUrl") ?? "") || null,
    remove: formData.get("removeImage") === "on",
    pathPrefix: "certificates",
  });

  const parsed = certificateSchema.safeParse({
    name: formData.get("name"),
    issuingOrganization: formData.get("issuingOrganization"),
    dateEarned: formData.get("dateEarned"),
    credentialUrl: formData.get("credentialUrl"),
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

  const data = { ...parsed.data, credentialUrl: parsed.data.credentialUrl || null };

  // Save at the requested position (0 = top), shifting the other items to
  // make room — see lib/ordering.ts.
  await prisma.$transaction(async (tx) => {
    if (id) {
      const current = await tx.certificate.findUniqueOrThrow({ where: { id }, select: { order: true } });
      const order = await makeRoomForMove(tx, "Certificate", id, current.order, data.order);
      await tx.certificate.update({ where: { id }, data: { ...data, order } });
    } else {
      const order = await makeRoomForInsert(tx, "Certificate", data.order);
      await tx.certificate.create({ data: { ...data, order } });
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/certificates");
  return {};
}

export async function deleteCertificate(id: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.certificate.delete({ where: { id }, select: { order: true } });
    await closeGapAfterDelete(tx, "Certificate", deleted.order);
  });
  revalidatePath("/");
  revalidatePath("/admin/certificates");
}
