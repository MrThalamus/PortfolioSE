"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
    if (id) {
      await prisma.project.update({ where: { id }, data });
    } else {
      await prisma.project.create({ data });
    }
  } catch {
    return {
      error: "A project with that slug already exists.",
      values: extractFormValues(formData, FIELDS),
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return {};
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/projects");
}
