"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { label as labelClass, input } from "@/components/admin/styles";

type Status = "idle" | "processing" | "error";

export function AvatarCutoutField({ currentUrl }: { currentUrl?: string | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("processing");
    setError(null);
    setProgress("Loading background-removal model…");

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

      const cutoutFile = new File([cutoutBlob], "avatar-cutout.png", { type: "image/png" });

      // Swap the file input's contents with the processed cutout so the
      // existing form submission (and server-side upload handling) needs
      // no changes at all — it just sees a different file.
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(cutoutFile);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }

      setPreview(URL.createObjectURL(cutoutFile));
      setStatus("idle");
      setProgress("");
    } catch {
      setStatus("error");
      setError("Couldn't remove the background automatically. You can still submit the original photo, or paste an image URL instead.");
      setProgress("");
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
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={status === "processing"}
          className={input}
        />
        <input type="text" name="avatarUrl" placeholder="or paste an image URL" className={input} />
      </div>

      {status === "processing" && (
        <p className="mt-1 font-mono text-xs text-accent">{progress}</p>
      )}
      {error && <p className="mt-1 font-mono text-xs text-red-500">{error}</p>}
      <p className="mt-1 font-mono text-xs text-foreground-muted">
        Upload any photo — the background is cut out automatically in your browser (first run downloads a small model, a few seconds). The result is shown as a transparent PNG.
      </p>
    </div>
  );
}
