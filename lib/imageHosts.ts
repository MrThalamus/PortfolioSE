// Hosts that next/image is allowed to fetch and optimize. Kept deliberately
// small: allowing every host ("**") turns the image optimizer into an open
// proxy anyone can use to burn through the Vercel image-optimization quota.
// Shared by next.config.ts and the admin form validation, so an admin can't
// save an image URL that would then fail to render on the public site.
export const IMAGE_HOST_PATTERNS = [
  // Vercel Blob storage (all uploads from /admin)
  "*.public.blob.vercel-storage.com",
  // Placeholder images used by prisma/seed.ts
  "images.unsplash.com",
];

export function isAllowedImageHost(hostname: string): boolean {
  return IMAGE_HOST_PATTERNS.some((pattern) =>
    pattern.startsWith("*.") ? hostname.endsWith(pattern.slice(1)) : hostname === pattern
  );
}
