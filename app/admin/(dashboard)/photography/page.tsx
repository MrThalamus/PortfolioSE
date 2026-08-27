import { prisma } from "@/lib/prisma";
import { PhotosManager } from "@/components/admin/photography/PhotosManager";

export default async function AdminPhotographyPage() {
  const photos = await prisma.photo.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Photography</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Upload photos or paste image URLs for the gallery section.
      </p>
      <PhotosManager photos={photos} />
    </div>
  );
}
