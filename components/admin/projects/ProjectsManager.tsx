"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Project } from "@prisma/client";
import { ProjectForm } from "./ProjectForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProject } from "@/app/admin/(dashboard)/projects/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

export function ProjectsManager({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleSaved(close: () => void) {
    close();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {showNewForm ? (
        <ProjectForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add project
        </button>
      )}

      <div className="space-y-3">
        {projects.map((project) =>
          editingId === project.id ? (
            <ProjectForm
              key={project.id}
              project={project}
              onSaved={() => handleSaved(() => setEditingId(null))}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-background-elevated p-4"
            >
              <div className="flex items-center gap-3">
                {project.thumbnailUrl && (
                  <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-border-default">
                    <Image src={project.thumbnailUrl} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {project.title}{" "}
                    {!project.published && (
                      <span className="font-mono text-xs text-amber-500">(unpublished)</span>
                    )}
                  </p>
                  <p className="font-mono text-xs text-foreground-muted">
                    {project.type} · order {project.order} · /{project.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(project.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deleteProject.bind(null, project.id)}
                  itemLabel={project.title}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {projects.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
