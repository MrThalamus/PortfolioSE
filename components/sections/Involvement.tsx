"use client";

import { useState } from "react";
import Image from "next/image";
import type { Involvement as InvolvementEntry } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";

const INITIAL_COUNT = 4;

const TYPE_LABELS: Record<string, string> = {
  JOB: "Job",
  CLUB: "Club",
  RESEARCH_LAB: "Research lab",
  VOLUNTEER: "Volunteer",
  OTHER: "Other",
};

export function Involvement({ involvements }: { involvements: InvolvementEntry[] }) {
  const [expanded, setExpanded] = useState(false);

  if (involvements.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No involvement added yet.
      </p>
    );
  }

  const visible = expanded ? involvements : involvements.slice(0, INITIAL_COUNT);
  const hasMore = involvements.length > INITIAL_COUNT;

  return (
    <>
      <div className="space-y-4">
        {visible.map((entry, i) => (
          <FadeIn key={entry.id} delay={i * 0.05}>
            <div className="flex items-start gap-4 rounded-lg border border-border-default bg-background-elevated p-5">
              {entry.imageUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border-default">
                  <Image src={entry.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-default font-mono text-xs text-foreground-muted">
                  {entry.organization.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium leading-snug">{entry.role}</h3>
                  <span className="rounded-full border border-border-default px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                    {TYPE_LABELS[entry.type]}
                  </span>
                  {entry.current && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-foreground-muted">
                  {entry.organization} · {entry.period}
                </p>
                {entry.description && (
                  <p className="mt-2 text-sm text-foreground-muted">{entry.description}</p>
                )}
                {entry.link && (
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-mono text-xs text-accent hover:underline"
                  >
                    Learn more ↗
                  </a>
                )}
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
            {expanded ? "Show less" : `See more (${involvements.length - INITIAL_COUNT})`}
          </button>
        </div>
      )}
    </>
  );
}
