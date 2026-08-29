import { upload } from "@vercel/blob/client";

// Uploads directly from the browser to Vercel Blob, bypassing the serverless
// function body-size limit (~4.5MB on Vercel) that a form-submitted file would
// otherwise hit — this route only ever sees a short-lived client token.
export async function uploadFileToBlob(file: File, pathPrefix: string): Promise<string> {
  const blob = await upload(`${pathPrefix}/${Date.now()}-${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });
  return blob.url;
}
