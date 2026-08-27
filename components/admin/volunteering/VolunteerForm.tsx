"use client";

import { useActionState, useEffect, useRef } from "react";
import type { VolunteerEntry } from "@prisma/client";
import { upsertVolunteer, type VolunteerFormState } from "@/app/admin/(dashboard)/volunteering/actions";
import { label, input, primaryButton, secondaryButton } from "@/components/admin/styles";

const initialState: VolunteerFormState = {};

export function VolunteerForm({
  entry,
  onSaved,
  onCancel,
}: {
  entry?: VolunteerEntry;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertVolunteer, initialState);
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

      <div>
        <label className={label} htmlFor="organization">Organization</label>
        <input id="organization" name="organization" defaultValue={entry?.organization} required className={input} />
      </div>

      <div>
        <label className={label} htmlFor="contribution">Contribution</label>
        <input id="contribution" name="contribution" defaultValue={entry?.contribution} required className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="timeframe">Timeframe</label>
          <input id="timeframe" name="timeframe" defaultValue={entry?.timeframe} required placeholder="2023–Present" className={input} />
        </div>
        <div>
          <label className={label} htmlFor="order">Order</label>
          <input id="order" name="order" type="number" defaultValue={entry?.order ?? 0} className={input} />
        </div>
      </div>

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
