"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadFileToBlob } from "@/lib/blobUpload";
import { label as labelClass, input } from "@/components/admin/styles";

type Status = "idle" | "processing" | "uploading" | "error";

export function AvatarCutoutField({
  currentUrl,
  defaultUrlValue = "",
}: {
  currentUrl?: string | null;
  defaultUrlValue?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [url, setUrl] = useState(defaultUrlValue);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("processing");
    setError(null);
    setProgress("Loading background-removal model…");

    let uploadFile = file;
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const cutoutBlob = await removeBackground(file, {
        model: "isnet_quint8",
        output: { format: "image/png" },
        progress: (key, current, total) => {
          if (key.startsWith("fetch")) {
            setProgress(`Downloading model… ${Math.round((current / total) * 100)}%`);
          } else {
            setProgress("Removing background…");
          }
        },
      });
      uploadFile = new File([cutoutBlob], "avatar-cutout.png", { type: "image/png" });
      setPreview(URL.createObjectURL(uploadFile));
    } catch {
      setError("Couldn't remove the background automatically — uploading the original photo instead.");
    }

    setStatus("uploading");
    setProgress("Uploading…");
    try {
      const uploadedUrl = await uploadFileToBlob(uploadFile, "profile");
      setUrl(uploadedUrl);
      setStatus("idle");
      setProgress("");
    } catch {
      setStatus("error");
      setError("Upload failed. Try again, or paste an image URL instead.");
      setProgress("");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className={labelClass}>Profile photo (background removed automatically)</label>

      {preview && (
        <div className="mb-2 flex items-center gap-3">
          <div
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border-default"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #80808022 25%, transparent 25%), linear-gradient(-45deg, #80808022 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #80808022 75%), linear-gradient(-45deg, transparent 75%, #80808022 75%)",
              backgroundSize: "10px 10px",
              backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
            }}
          >
            <Image src={preview} alt="" fill sizes="64px" className="object-contain" />
          </div>
          <label className="flex items-center gap-2 font-mono text-xs text-foreground-muted">
            <input type="checkbox" name="removeAvatar" />
            Remove current image
          </label>
        </div>
      )}
      <input type="hidden" name="existingAvatarUrl" value={currentUrl ?? ""} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={status === "processing" || status === "uploading"}
          className={input}
        />
        <input
          type="text"
          name="avatarUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="or paste an image URL"
          className={input}
        />
      </div>

      {(status === "processing" || status === "uploading") && (
        <p className="mt-1 font-mono text-xs text-accent">{progress}</p>
      )}
      {error && <p className="mt-1 font-mono text-xs text-red-500">{error}</p>}
      <p className="mt-1 font-mono text-xs text-foreground-muted">
        Upload any photo — the background is cut out automatically in your browser (first run downloads a small model, a few seconds). The result is shown as a transparent PNG.
      </p>
    </div>
  );
}
