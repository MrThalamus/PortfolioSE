"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@prisma/client";
import { upsertGalleryImage, type GalleryImageFormState } from "@/app/admin/(dashboard)/gallery/actions";
import { uploadFileToBlob } from "@/lib/blobUpload";
import { label, input, primaryButton, secondaryButton } from "@/components/admin/styles";

const initialState: GalleryImageFormState = {};

export function GalleryForm({
  image,
  onSaved,
  onCancel,
}: {
  image?: GalleryImage;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertGalleryImage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  // Restore what was typed if the last submission failed — see lib/formState.ts.
  const v = state.values;
  const [url, setUrl] = useState(v?.url ?? image?.url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const uploadedUrl = await uploadFileToBlob(file, "gallery");
      setUrl(uploadedUrl);
    } catch {
      setUploadError("Upload failed. Try again, or paste an image URL instead.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!image) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, image]);

  const formKey = v ? JSON.stringify(v) : (image?.id ?? "new");

  return (
    <form key={formKey} ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {image && <input type="hidden" name="id" value={image.id} />}

      <div>
        <label className={label} htmlFor="file">Upload image</label>
        <input
          id="file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className={input}
        />
        {uploading && <p className="mt-1 font-mono text-xs text-accent">Uploading…</p>}
        {uploadError && <p className="mt-1 font-mono text-xs text-red-500">{uploadError}</p>}
        <p className="mt-1 font-mono text-xs text-foreground-muted">Or paste an image URL below instead.</p>
      </div>

      <div>
        <label className={label} htmlFor="url">Image URL</label>
        <input
          id="url"
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="altText">Alt text (required for accessibility)</label>
        <input id="altText" name="altText" defaultValue={v?.altText ?? image?.altText} required className={input} />
      </div>

      <div>
        <label className={label} htmlFor="caption">Caption (optional)</label>
        <input id="caption" name="caption" defaultValue={v?.caption ?? image?.caption ?? ""} className={input} />
      </div>

      <div>
        <label className={label} htmlFor="order">Order</label>
        <input id="order" name="order" type="number" defaultValue={v?.order ?? image?.order ?? 0} className={input} />
      </div>

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : image ? "Save changes" : "Add image"}
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
