"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Photo } from "@prisma/client";
import { PhotoForm } from "./PhotoForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePhoto } from "@/app/admin/(dashboard)/photography/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

export function PhotosManager({ photos }: { photos: Photo[] }) {
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
        <PhotoForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add photo
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo) =>
          editingId === photo.id ? (
            <div key={photo.id} className="sm:col-span-2">
              <PhotoForm photo={photo} onSaved={() => handleSaved(() => setEditingId(null))} onCancel={() => setEditingId(null)} />
            </div>
          ) : (
            <div
              key={photo.id}
              className="flex items-center gap-4 rounded-lg border border-border-default bg-background-elevated p-3"
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md border border-border-default">
                <Image src={photo.url} alt={photo.altText} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{photo.caption || photo.altText}</p>
                <p className="font-mono text-xs text-foreground-muted">order {photo.order}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(photo.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deletePhoto.bind(null, photo.id)}
                  itemLabel={photo.altText}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {photos.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No photos yet.</p>
        )}
      </div>
    </div>
  );
}
