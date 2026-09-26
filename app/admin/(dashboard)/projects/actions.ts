"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { closeGapAfterDelete, makeRoomForInsert, makeRoomForMove } from "@/lib/ordering";
import { projectSchema } from "@/lib/validations";
import { resolveImageUpload } from "@/lib/upload";
import { extractFormValues } from "@/lib/formState";

export type ProjectFormState = { error?: string; values?: Record<string, string> };

const FIELDS = [
  "title",
  "slug",
  "summary",
  "description",
  "techStack",
  "type",
  "videoUrl",
  "liveUrl",
  "repoUrl",
  "thumbnailUrl",
  "problem",
  "approach",
  "outcome",
  "order",
  "published",
];

function parseTechStack(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function upsertProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const { url: thumbnailUrl, error: uploadError } = await resolveImageUpload({
    file: null,
    urlInput: String(formData.get("thumbnailUrl") ?? ""),
    existingUrl: String(formData.get("existingThumbnailUrl") ?? "") || null,
    remove: formData.get("removeThumbnail") === "on",
    pathPrefix: "projects",
  });

  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    techStack: parseTechStack(formData.get("techStack")),
    type: formData.get("type"),
    videoUrl: formData.get("videoUrl"),
    liveUrl: formData.get("liveUrl"),
    repoUrl: formData.get("repoUrl"),
    thumbnailUrl: thumbnailUrl ?? "",
    problem: formData.get("problem"),
    approach: formData.get("approach"),
    outcome: formData.get("outcome"),
    order: formData.get("order"),
    published: formData.get("published") === "on",
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
    videoUrl: parsed.data.videoUrl || null,
    liveUrl: parsed.data.liveUrl || null,
    repoUrl: parsed.data.repoUrl || null,
    thumbnailUrl: parsed.data.thumbnailUrl || null,
    problem: parsed.data.problem || null,
    approach: parsed.data.approach || null,
    outcome: parsed.data.outcome || null,
  };

  try {
    // Save at the requested position (0 = top), shifting the other items to
    // make room — see lib/ordering.ts.
    await prisma.$transaction(async (tx) => {
      if (id) {
        const current = await tx.project.findUniqueOrThrow({ where: { id }, select: { order: true } });
        const order = await makeRoomForMove(tx, "Project", id, current.order, data.order);
        await tx.project.update({ where: { id }, data: { ...data, order } });
      } else {
        const order = await makeRoomForInsert(tx, "Project", data.order);
        await tx.project.create({ data: { ...data, order } });
      }
    });
  } catch (err) {
    // P2002 = unique constraint violation, i.e. the slug is taken.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return {
        error: "A project with that slug already exists.",
        values: extractFormValues(formData, FIELDS),
      };
    }
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return {};
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.project.delete({ where: { id }, select: { order: true } });
    await closeGapAfterDelete(tx, "Project", deleted.order);
  });
  revalidatePath("/");
  revalidatePath("/admin/projects");
}
