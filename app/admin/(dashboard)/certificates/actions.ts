"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { certificateSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type CertificateFormState = { error?: string; values?: Record<string, string> };

const FIELDS = ["name", "issuingOrganization", "dateEarned", "credentialUrl", "order", "imageUrl"];

export async function upsertCertificate(
  _prevState: CertificateFormState,
  formData: FormData
): Promise<CertificateFormState> {
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

  if (id) {
    await prisma.certificate.update({ where: { id }, data });
  } else {
    await prisma.certificate.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/certificates");
  return {};
}

export async function deleteCertificate(id: string) {
  await prisma.certificate.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/certificates");
}
