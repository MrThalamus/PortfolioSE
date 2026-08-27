"use client";

import { useState } from "react";
import Image from "next/image";
import type { Achievement } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const [active, setActive] = useState<Achievement | null>(null);

  if (achievements.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No achievements added yet.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {achievements.map((a, i) => (
          <FadeIn key={a.id} delay={i * 0.05}>
            <div className="flex h-full items-start gap-4 rounded-lg border border-border-default bg-background-elevated p-5">
              {a.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setActive(a)}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border-default"
                  aria-label={`View proof for ${a.title}`}
                >
                  <Image src={a.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ) : (
                <span className="mt-0.5 font-mono text-xs text-accent">{a.year}</span>
              )}
              <div>
                {a.imageUrl && (
                  <p className="mb-1 font-mono text-xs text-accent">{a.year}</p>
                )}
                <h3 className="font-medium leading-snug">{a.title}</h3>
                <p className="mt-1 text-sm text-foreground-muted">{a.eventName}</p>
                {a.description && (
                  <p className="mt-2 text-sm text-foreground-muted">{a.description}</p>
                )}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <ImageLightbox
        src={active?.imageUrl ?? null}
        alt={active ? `Proof for ${active.title}` : ""}
        caption={active?.title}
        onClose={() => setActive(null)}
      />
    </>
  );
}
