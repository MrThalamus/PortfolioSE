"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Photo } from "@prisma/client";
import { upsertPhoto, type PhotoFormState } from "@/app/admin/(dashboard)/photography/actions";
import { label, input, primaryButton, secondaryButton } from "@/components/admin/styles";

const initialState: PhotoFormState = {};

export function PhotoForm({
  photo,
  onSaved,
  onCancel,
}: {
  photo?: Photo;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertPhoto, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!photo) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, photo]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {photo && <input type="hidden" name="id" value={photo.id} />}

      <div>
        <label className={label} htmlFor="file">Upload image</label>
        <input id="file" name="file" type="file" accept="image/*" className={input} />
        <p className="mt-1 font-mono text-xs text-foreground-muted">
          Uploads locally to /public/uploads in dev, or to Vercel Blob when BLOB_READ_WRITE_TOKEN is set. Or paste an image URL below instead.
        </p>
      </div>

      <div>
        <label className={label} htmlFor="url">Image URL</label>
        <input id="url" name="url" defaultValue={photo?.url} placeholder="https://…" className={input} />
      </div>

      <div>
        <label className={label} htmlFor="altText">Alt text (required for accessibility)</label>
        <input id="altText" name="altText" defaultValue={photo?.altText} required className={input} />
      </div>

      <div>
        <label className={label} htmlFor="caption">Caption (optional)</label>
        <input id="caption" name="caption" defaultValue={photo?.caption ?? ""} className={input} />
      </div>

      <div>
        <label className={label} htmlFor="order">Order</label>
        <input id="order" name="order" type="number" defaultValue={photo?.order ?? 0} className={input} />
      </div>

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : photo ? "Save changes" : "Add photo"}
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
