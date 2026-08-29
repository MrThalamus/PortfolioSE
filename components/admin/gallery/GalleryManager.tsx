"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { GalleryImage } from "@prisma/client";
import { GalleryForm } from "./GalleryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteGalleryImage } from "@/app/admin/(dashboard)/gallery/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

export function GalleryManager({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleSaved(close: () => void) {
    close();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {showNewForm ? (
        <GalleryForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add image
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image) =>
          editingId === image.id ? (
            <div key={image.id} className="sm:col-span-2">
              <GalleryForm image={image} onSaved={() => handleSaved(() => setEditingId(null))} onCancel={() => setEditingId(null)} />
            </div>
          ) : (
            <div
              key={image.id}
              className="flex items-center gap-4 rounded-lg border border-border-default bg-background-elevated p-3"
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md border border-border-default">
                <Image src={image.url} alt={image.altText} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{image.caption || image.altText}</p>
                <p className="font-mono text-xs text-foreground-muted">order {image.order}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(image.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deleteGalleryImage.bind(null, image.id)}
                  itemLabel={image.altText}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {images.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No images yet.</p>
        )}
      </div>
    </div>
  );
}
