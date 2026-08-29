"use client";

import { useActionState, useEffect, useRef } from "react";
import type { BeyondAcademicsEntry } from "@prisma/client";
import { upsertBeyondAcademics, type BeyondAcademicsFormState } from "@/app/admin/(dashboard)/beyond-academics/actions";
import { label, input, textarea, primaryButton, secondaryButton } from "@/components/admin/styles";
import { ImageField } from "@/components/admin/ImageField";

const initialState: BeyondAcademicsFormState = {};

export function BeyondAcademicsForm({
  entry,
  onSaved,
  onCancel,
}: {
  entry?: BeyondAcademicsEntry;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertBeyondAcademics, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!entry) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, entry]);

  // Restore what was typed if the last submission failed — see lib/formState.ts.
  const v = state.values;
  const formKey = v ? JSON.stringify(v) : (entry?.id ?? "new");

  return (
    <form key={formKey} ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            defaultValue={v?.title ?? entry?.title}
            required
            placeholder="Blood Donation Campaign"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="year">Year</label>
          <input id="year" name="year" defaultValue={v?.year ?? entry?.year} required placeholder="2024" className={input} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="role">Role (optional)</label>
        <input
          id="role"
          name="role"
          defaultValue={v?.role ?? entry?.role ?? ""}
          placeholder="Organizer & Lead"
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="description">Description (optional)</label>
        <textarea id="description" name="description" defaultValue={v?.description ?? entry?.description ?? ""} rows={3} className={textarea} />
      </div>

      <div>
        <label className={label} htmlFor="order">Order</label>
        <input id="order" name="order" type="number" defaultValue={v?.order ?? entry?.order ?? 0} className={input} />
      </div>

      <ImageField
        label="Photo (optional)"
        currentUrl={entry?.imageUrl}
        urlFieldName="imageUrl"
        existingFieldName="existingImageUrl"
        removeFieldName="removeImage"
        defaultUrlValue={v?.imageUrl ?? ""}
        pathPrefix="beyond-academics"
      />

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : entry ? "Save changes" : "Add entry"}
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
