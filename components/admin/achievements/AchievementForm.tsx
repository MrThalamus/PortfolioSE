"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Achievement } from "@prisma/client";
import { upsertAchievement, type AchievementFormState } from "@/app/admin/(dashboard)/achievements/actions";
import { label, input, textarea, primaryButton, secondaryButton } from "@/components/admin/styles";
import { ImageField } from "@/components/admin/ImageField";

const initialState: AchievementFormState = {};

export function AchievementForm({
  achievement,
  onSaved,
  onCancel,
}: {
  achievement?: Achievement;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertAchievement, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!achievement) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, achievement]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {achievement && <input type="hidden" name="id" value={achievement.id} />}

      <div>
        <label className={label} htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={achievement?.title} required className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="eventName">Event name</label>
          <input id="eventName" name="eventName" defaultValue={achievement?.eventName} required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="year">Year</label>
          <input id="year" name="year" type="number" defaultValue={achievement?.year} required className={input} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="description">Description (optional)</label>
        <textarea id="description" name="description" defaultValue={achievement?.description ?? ""} rows={2} className={textarea} />
      </div>

      <div>
        <label className={label} htmlFor="order">Order</label>
        <input id="order" name="order" type="number" defaultValue={achievement?.order ?? 0} className={input} />
      </div>

      <ImageField
        label="Certificate / photo proof (optional)"
        currentUrl={achievement?.imageUrl}
        urlFieldName="imageUrl"
        existingFieldName="existingImageUrl"
        removeFieldName="removeImage"
      />

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : achievement ? "Save changes" : "Add achievement"}
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
