"use client";

import { useState } from "react";
import Image from "next/image";
import type { Achievement } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

const INITIAL_COUNT = 3;

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const [active, setActive] = useState<Achievement | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (achievements.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No achievements added yet.
      </p>
    );
  }

  const visible = expanded ? achievements : achievements.slice(0, INITIAL_COUNT);
  const hasMore = achievements.length > INITIAL_COUNT;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((a, i) => (
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

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-border-default px-4 py-2 font-mono text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {expanded ? "Show less" : `See more (${achievements.length - INITIAL_COUNT})`}
          </button>
        </div>
      )}

      <ImageLightbox
        src={active?.imageUrl ?? null}
        alt={active ? `Proof for ${active.title}` : ""}
        caption={active?.title}
        onClose={() => setActive(null)}
      />
    </>
  );
}
