"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Project } from "@prisma/client";
import { upsertProject, type ProjectFormState } from "@/app/admin/(dashboard)/projects/actions";
import { label, input, textarea, primaryButton, secondaryButton } from "@/components/admin/styles";

const initialState: ProjectFormState = {};

export function ProjectForm({
  project,
  onSaved,
  onCancel,
}: {
  project?: Project;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertProject, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!project) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, project]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={project?.title} required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="slug">Slug</label>
          <input id="slug" name="slug" defaultValue={project?.slug} required placeholder="my-project" className={input} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="summary">Summary (one line)</label>
        <input id="summary" name="summary" defaultValue={project?.summary} required className={input} />
      </div>

      <div>
        <label className={label} htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={project?.description} required rows={3} className={textarea} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="problem">Problem</label>
          <textarea id="problem" name="problem" defaultValue={project?.problem ?? ""} rows={2} className={textarea} />
        </div>
        <div>
          <label className={label} htmlFor="approach">Approach</label>
          <textarea id="approach" name="approach" defaultValue={project?.approach ?? ""} rows={2} className={textarea} />
        </div>
        <div>
          <label className={label} htmlFor="outcome">Outcome</label>
          <textarea id="outcome" name="outcome" defaultValue={project?.outcome ?? ""} rows={2} className={textarea} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="techStack">Tech stack (comma-separated)</label>
        <input
          id="techStack"
          name="techStack"
          defaultValue={project?.techStack.join(", ")}
          required
          placeholder="C#, .NET 8, PostgreSQL"
          className={input}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="type">Project type</label>
          <select id="type" name="type" defaultValue={project?.type ?? "REPO"} className={input}>
            <option value="VIDEO">Demo video</option>
            <option value="LIVE">Live</option>
            <option value="REPO">Repo-only</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="order">Order</label>
          <input id="order" name="order" type="number" defaultValue={project?.order ?? 0} className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="videoUrl">Video URL</label>
          <input id="videoUrl" name="videoUrl" defaultValue={project?.videoUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="liveUrl">Live URL</label>
          <input id="liveUrl" name="liveUrl" defaultValue={project?.liveUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="repoUrl">Repo URL</label>
          <input id="repoUrl" name="repoUrl" defaultValue={project?.repoUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="thumbnailUrl">Thumbnail URL</label>
          <input id="thumbnailUrl" name="thumbnailUrl" defaultValue={project?.thumbnailUrl ?? ""} className={input} />
        </div>
      </div>

      <label className="flex items-center gap-2 font-mono text-xs text-foreground-muted">
        <input type="checkbox" name="published" defaultChecked={project?.published ?? true} />
        Published (visible on public site)
      </label>

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : project ? "Save changes" : "Add project"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
