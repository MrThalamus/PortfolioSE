"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadFileToBlob } from "@/lib/blobUpload";
import { label as labelClass, input } from "./styles";

export function ImageField({
  label,
  currentUrl,
  urlFieldName,
  existingFieldName,
  removeFieldName,
  helpText,
  round = false,
  defaultUrlValue = "",
  pathPrefix,
}: {
  label: string;
  currentUrl?: string | null;
  urlFieldName: string;
  existingFieldName: string;
  removeFieldName: string;
  helpText?: string;
  round?: boolean;
  defaultUrlValue?: string;
  pathPrefix: string;
}) {
  const [url, setUrl] = useState(defaultUrlValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const uploadedUrl = await uploadFileToBlob(file, pathPrefix);
      setUrl(uploadedUrl);
    } catch {
      setError("Upload failed. Try again, or paste an image URL instead.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>

      {currentUrl && (
        <div className="mb-2 flex items-center gap-3">
          <div
            className={`relative h-16 w-16 shrink-0 overflow-hidden border border-border-default ${round ? "rounded-full" : "rounded-md"}`}
          >
            <Image src={currentUrl} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <label className="flex items-center gap-2 font-mono text-xs text-foreground-muted">
            <input type="checkbox" name={removeFieldName} />
            Remove current image
          </label>
        </div>
      )}
      <input type="hidden" name={existingFieldName} value={currentUrl ?? ""} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className={input}
        />
        <input
          type="text"
          name={urlFieldName}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="or paste an image URL"
          className={input}
        />
      </div>
      {uploading && <p className="mt-1 font-mono text-xs text-accent">Uploading…</p>}
      {error && <p className="mt-1 font-mono text-xs text-red-500">{error}</p>}
      {helpText && <p className="mt-1 font-mono text-xs text-foreground-muted">{helpText}</p>}
    </div>
  );
}
