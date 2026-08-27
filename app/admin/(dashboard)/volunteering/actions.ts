"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { volunteerSchema } from "@/lib/validations";

export type VolunteerFormState = { error?: string };

export async function upsertVolunteer(
  _prevState: VolunteerFormState,
  formData: FormData
): Promise<VolunteerFormState> {
  const id = String(formData.get("id") ?? "");

  const parsed = volunteerSchema.safeParse({
    organization: formData.get("organization"),
    contribution: formData.get("contribution"),
    timeframe: formData.get("timeframe"),
    order: formData.get("order"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (id) {
    await prisma.volunteerEntry.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.volunteerEntry.create({ data: parsed.data });
  }

  revalidatePath("/");
  revalidatePath("/admin/volunteering");
  return {};
}

export async function deleteVolunteer(id: string) {
  await prisma.volunteerEntry.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/volunteering");
}
