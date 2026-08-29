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
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border-default bg-background-elevated">
              {a.imageUrl && (
                <button
                  type="button"
                  onClick={() => setActive(a)}
                  className="group relative block h-36 w-full overflow-hidden sm:h-40"
                  aria-label={`View full proof for ${a.title}`}
                >
                  <Image
                    src={a.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              )}
              <div className="flex flex-1 items-start gap-4 p-5">
                <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">{a.year}</span>
                <div>
                  <h3 className="font-medium leading-snug">{a.title}</h3>
                  <p className="mt-1 text-sm text-foreground-muted">{a.eventName}</p>
                  {a.description && (
                    <p className="mt-2 text-sm text-foreground-muted">{a.description}</p>
                  )}
                </div>
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
