import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

// Raster images only — SVG is excluded because it can carry scripts.
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // matches serverActions.bodySizeLimit

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100) || "upload";
}

async function saveToLocalDisk(file: File, pathPrefix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeFileName(file.name)}`;
  const dir = path.join(process.cwd(), "public", "uploads", pathPrefix);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${pathPrefix}/${filename}`;
}

export async function resolveImageUpload({
  file,
  urlInput,
  existingUrl,
  remove,
  pathPrefix,
}: {
  file: File | null;
  urlInput: string;
  existingUrl: string | null;
  remove: boolean;
  pathPrefix: string;
}): Promise<{ url: string | null; error?: string }> {
  if (remove) return { url: null };

  if (file && file.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { url: null, error: "Please upload a JPEG, PNG, WebP, GIF or AVIF image." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { url: null, error: "That image is too large — the limit is 10 MB." };
    }
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`${pathPrefix}/${Date.now()}-${safeFileName(file.name)}`, file, {
        access: "public",
      });
      return { url: blob.url };
    }
    // No Vercel Blob configured (typical for local dev) — fall back to writing
    // the file into public/uploads so uploads still work without extra setup.
    // Not suitable for Vercel's serverless production deploys (read-only, ephemeral
    // filesystem), which is why BLOB_READ_WRITE_TOKEN is still recommended there.
    const url = await saveToLocalDisk(file, pathPrefix);
    return { url };
  }

  const trimmed = urlInput.trim();
  if (trimmed) return { url: trimmed };

  return { url: existingUrl };
}
