"use client";

import { useState } from "react";
import Image from "next/image";
import type { ResearchItem } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

const INITIAL_COUNT = 4;

const STATUS_LABELS: Record<string, string> = {
  ONGOING: "Ongoing",
  SUBMITTED: "Submitted",
  PUBLISHED: "Published",
};

export function Research({ items }: { items: ResearchItem[] }) {
  const [active, setActive] = useState<ResearchItem | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No research items added yet.
      </p>
    );
  }

  const visible = expanded ? items : items.slice(0, INITIAL_COUNT);
  const hasMore = items.length > INITIAL_COUNT;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((item, i) => (
          <FadeIn key={item.id} delay={i * 0.05}>
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border-default bg-background-elevated">
              {item.imageUrl && (
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="group relative block h-36 w-full overflow-hidden sm:h-40"
                  aria-label={`View full image for ${item.title}`}
                >
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              )}
              <div className="flex flex-1 items-start gap-4 p-5">
                <span className="mt-0.5 shrink-0 font-mono text-xs text-accent">{item.year}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium leading-snug">{item.title}</h3>
                    <span className="rounded-full border border-border-default px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  {(item.venue || item.role) && (
                    <p className="mt-1 text-sm text-foreground-muted">
                      {[item.role, item.venue].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-2 text-sm text-foreground-muted">{item.description}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block font-mono text-xs text-accent hover:underline"
                    >
                      View paper ↗
                    </a>
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
            {expanded ? "Show less" : `See more (${items.length - INITIAL_COUNT})`}
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
