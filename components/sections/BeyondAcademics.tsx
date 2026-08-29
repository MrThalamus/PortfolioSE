"use client";

import { useState } from "react";
import Image from "next/image";
import type { BeyondAcademicsEntry } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

const INITIAL_COUNT = 3;

export function BeyondAcademics({ entries }: { entries: BeyondAcademicsEntry[] }) {
  const [active, setActive] = useState<BeyondAcademicsEntry | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No entries added yet.
      </p>
    );
  }

  const visible = expanded ? entries : entries.slice(0, INITIAL_COUNT);
  const hasMore = entries.length > INITIAL_COUNT;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((entry, i) => (
          <FadeIn key={entry.id} delay={i * 0.05}>
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border-default bg-background-elevated">
              {entry.imageUrl && (
                <button
                  type="button"
                  onClick={() => setActive(entry)}
                  className="group relative block h-36 w-full overflow-hidden sm:h-40"
                  aria-label={`View full photo for ${entry.title}`}
                >
                  <Image
                    src={entry.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              )}
              <div className="flex flex-1 items-start gap-4 p-5">
                <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">{entry.year}</span>
                <div>
                  <h3 className="font-medium leading-snug">{entry.title}</h3>
                  {entry.role && <p className="mt-1 text-sm text-foreground-muted">{entry.role}</p>}
                  {entry.description && (
                    <p className="mt-2 text-sm text-foreground-muted">{entry.description}</p>
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
            {expanded ? "Show less" : `See more (${entries.length - INITIAL_COUNT})`}
          </button>
        </div>
      )}

      <ImageLightbox
        src={active?.imageUrl ?? null}
        alt={active ? active.title : ""}
        caption={active?.title}
        onClose={() => setActive(null)}
      />
    </>
  );
}
