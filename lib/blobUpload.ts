import { upload } from "@vercel/blob/client";

function isHeic(file: File): boolean {
  return (
    /^image\/hei[cf]/i.test(file.type) ||
    /\.hei[cf]$/i.test(file.name)
  );
}

// iPhones save photos as HEIC by default, which no major browser can display
// in an <img>/next/image tag — an uploaded HEIC renders as a broken image
// everywhere except on the device that took it. Converting to JPEG here,
// before upload, is the only place we can catch every upload path at once.
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
  const newName = file.name.replace(/\.hei[cf]$/i, "") + ".jpg";
  return new File([jpegBlob], newName, { type: "image/jpeg" });
}

// Uploads directly from the browser to Vercel Blob, bypassing the serverless
// function body-size limit (~4.5MB on Vercel) that a form-submitted file would
// otherwise hit — this route only ever sees a short-lived client token.
export async function uploadFileToBlob(file: File, pathPrefix: string): Promise<string> {
  const uploadFile = isHeic(file) ? await convertHeicToJpeg(file) : file;
  const blob = await upload(`${pathPrefix}/${Date.now()}-${uploadFile.name}`, uploadFile, {
    access: "public",
    handleUploadUrl: "/api/upload",
  });
  return blob.url;
}
