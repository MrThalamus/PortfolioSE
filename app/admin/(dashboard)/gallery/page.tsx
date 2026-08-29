import { prisma } from "@/lib/prisma";
import { GalleryManager } from "@/components/admin/gallery/GalleryManager";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Gallery</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Upload photos or paste image URLs for the gallery section — competitions, university life, friends, etc.
      </p>
      <GalleryManager images={images} />
    </div>
  );
}
