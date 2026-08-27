"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

export function Photography({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No photos added yet.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <FadeIn key={photo.id} delay={i * 0.04}>
            <button
              type="button"
              onClick={() => setActive(photo)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md border border-border-default"
            >
              <Image
                src={photo.url}
                alt={photo.altText}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </FadeIn>
        ))}
      </div>

      <ImageLightbox
        src={active?.url ?? null}
        alt={active?.altText ?? ""}
        caption={active?.caption}
        onClose={() => setActive(null)}
      />
    </>
  );
}
