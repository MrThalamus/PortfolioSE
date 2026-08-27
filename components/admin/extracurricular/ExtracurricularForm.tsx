"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ExtracurricularEntry } from "@prisma/client";
import { upsertExtracurricular, type ExtracurricularFormState } from "@/app/admin/(dashboard)/extracurricular/actions";
import { label, input, textarea, primaryButton, secondaryButton } from "@/components/admin/styles";
import { ImageField } from "@/components/admin/ImageField";

const initialState: ExtracurricularFormState = {};

export function ExtracurricularForm({
  entry,
  onSaved,
  onCancel,
}: {
  entry?: ExtracurricularEntry;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertExtracurricular, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!entry) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, entry]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="activity">Activity</label>
          <input id="activity" name="activity" defaultValue={entry?.activity} required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="year">Year</label>
          <input id="year" name="year" defaultValue={entry?.year} required placeholder="2023–2024" className={input} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="role">Role</label>
        <input id="role" name="role" defaultValue={entry?.role} required className={input} />
      </div>

      <div>
        <label className={label} htmlFor="description">Description (optional)</label>
        <textarea id="description" name="description" defaultValue={entry?.description ?? ""} rows={2} className={textarea} />
      </div>

      <div>
        <label className={label} htmlFor="order">Order</label>
        <input id="order" name="order" type="number" defaultValue={entry?.order ?? 0} className={input} />
      </div>

      <ImageField
        label="Certificate / photo proof (optional)"
        currentUrl={entry?.imageUrl}
        urlFieldName="imageUrl"
        existingFieldName="existingImageUrl"
        removeFieldName="removeImage"
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
