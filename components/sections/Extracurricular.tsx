"use client";

import { useState } from "react";
import Image from "next/image";
import type { ExtracurricularEntry } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

export function Extracurricular({ entries }: { entries: ExtracurricularEntry[] }) {
  const [active, setActive] = useState<ExtracurricularEntry | null>(null);

  if (entries.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No extracurricular activities added yet.
      </p>
    );
  }

  return (
    <>
      <ol className="relative space-y-8 border-l border-border-default pl-6">
        {entries.map((entry, i) => (
          <FadeIn key={entry.id} delay={i * 0.05}>
            <li className="relative">
              <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full border-2 border-accent bg-background" />
              <div className="flex items-start gap-4">
                {entry.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setActive(entry)}
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border-default"
                    aria-label={`View proof for ${entry.activity}`}
                  >
                    <Image src={entry.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                )}
                <div>
                  <p className="font-mono text-xs text-accent">{entry.year}</p>
                  <h3 className="mt-1 font-medium">{entry.activity}</h3>
                  <p className="text-sm text-foreground-muted">{entry.role}</p>
                  {entry.description && (
                    <p className="mt-1 text-sm text-foreground-muted">{entry.description}</p>
                  )}
                </div>
              </div>
            </li>
          </FadeIn>
        ))}
      </ol>

      <ImageLightbox
        src={active?.imageUrl ?? null}
        alt={active ? `Proof for ${active.activity}` : ""}
        caption={active?.activity}
        onClose={() => setActive(null)}
      />
    </>
  );
}
