"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ResearchItem } from "@prisma/client";
import { upsertResearchItem, type ResearchFormState } from "@/app/admin/(dashboard)/research/actions";
import { label, input, textarea, primaryButton, secondaryButton } from "@/components/admin/styles";
import { ImageField } from "@/components/admin/ImageField";

const STATUS_OPTIONS = [
  { value: "ONGOING", label: "Ongoing" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "PUBLISHED", label: "Published" },
];

const initialState: ResearchFormState = {};

export function ResearchForm({
  researchItem,
  onSaved,
  onCancel,
}: {
  researchItem?: ResearchItem;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertResearchItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!researchItem) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, researchItem]);

  // Restore what was typed if the last submission failed — see lib/formState.ts.
  const v = state.values;
  const formKey = v ? JSON.stringify(v) : (researchItem?.id ?? "new");

  return (
    <form key={formKey} ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {researchItem && <input type="hidden" name="id" value={researchItem.id} />}

      <div>
        <label className={label} htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={v?.title ?? researchItem?.title} required className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="venue">Venue / lab (optional)</label>
          <input id="venue" name="venue" defaultValue={v?.venue ?? researchItem?.venue ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="year">Year</label>
          <input id="year" name="year" type="number" defaultValue={v?.year ?? researchItem?.year} required className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="role">Role (optional)</label>
          <input id="role" name="role" placeholder="e.g. First author" defaultValue={v?.role ?? researchItem?.role ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={v?.status ?? researchItem?.status ?? "ONGOING"} className={input}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="description">Description (optional)</label>
        <textarea id="description" name="description" defaultValue={v?.description ?? researchItem?.description ?? ""} rows={2} className={textarea} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="link">Paper / link (optional)</label>
          <input id="link" name="link" type="url" placeholder="https://…" defaultValue={v?.link ?? researchItem?.link ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="order">Order</label>
          <input id="order" name="order" type="number" defaultValue={v?.order ?? researchItem?.order ?? 0} className={input} />
        </div>
      </div>

      <ImageField
        label="Figure / cover image (optional)"
        currentUrl={researchItem?.imageUrl}
        urlFieldName="imageUrl"
        existingFieldName="existingImageUrl"
        removeFieldName="removeImage"
        defaultUrlValue={v?.imageUrl ?? ""}
        pathPrefix="research"
      />

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : researchItem ? "Save changes" : "Add research item"}
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
