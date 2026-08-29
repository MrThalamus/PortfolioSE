"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Involvement } from "@prisma/client";
import { upsertInvolvement, type InvolvementFormState } from "@/app/admin/(dashboard)/involvement/actions";
import { label, input, textarea, primaryButton, secondaryButton } from "@/components/admin/styles";
import { ImageField } from "@/components/admin/ImageField";

const TYPE_OPTIONS = [
  { value: "JOB", label: "Job" },
  { value: "CLUB", label: "Club" },
  { value: "RESEARCH_LAB", label: "Research lab" },
  { value: "VOLUNTEER", label: "Volunteer" },
  { value: "OTHER", label: "Other" },
];

const initialState: InvolvementFormState = {};

export function InvolvementForm({
  involvement,
  onSaved,
  onCancel,
}: {
  involvement?: Involvement;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertInvolvement, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!involvement) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, involvement]);

  // Restore what was typed if the last submission failed — see lib/formState.ts.
  const v = state.values;
  const formKey = v ? JSON.stringify(v) : (involvement?.id ?? "new");

  return (
    <form key={formKey} ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {involvement && <input type="hidden" name="id" value={involvement.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="organization">Organization</label>
          <input id="organization" name="organization" defaultValue={v?.organization ?? involvement?.organization} required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="role">Role</label>
          <input id="role" name="role" defaultValue={v?.role ?? involvement?.role} required className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={v?.type ?? involvement?.type ?? "OTHER"} className={input}>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="period">Period</label>
          <input
            id="period"
            name="period"
            placeholder="e.g. Jan 2024 – Present"
            defaultValue={v?.period ?? involvement?.period}
            required
            className={input}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 font-mono text-xs text-foreground-muted">
        <input type="checkbox" name="current" defaultChecked={v?.current === "true" || involvement?.current} />
        Currently active
      </label>

      <div>
        <label className={label} htmlFor="description">Description (optional)</label>
        <textarea id="description" name="description" defaultValue={v?.description ?? involvement?.description ?? ""} rows={2} className={textarea} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="link">Link (optional)</label>
          <input id="link" name="link" type="url" placeholder="https://…" defaultValue={v?.link ?? involvement?.link ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="order">Order</label>
          <input id="order" name="order" type="number" defaultValue={v?.order ?? involvement?.order ?? 0} className={input} />
        </div>
      </div>

      <ImageField
        label="Logo / photo (optional)"
        currentUrl={involvement?.imageUrl}
        urlFieldName="imageUrl"
        existingFieldName="existingImageUrl"
        removeFieldName="removeImage"
        defaultUrlValue={v?.imageUrl ?? ""}
        pathPrefix="involvement"
      />

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : involvement ? "Save changes" : "Add involvement"}
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
