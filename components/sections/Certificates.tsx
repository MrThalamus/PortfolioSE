"use client";

import { useState } from "react";
import Image from "next/image";
import type { Certificate } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

const INITIAL_COUNT = 4;

export function Certificates({ certificates }: { certificates: Certificate[] }) {
  const [active, setActive] = useState<Certificate | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (certificates.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No certificates added yet.
      </p>
    );
  }

  const visible = expanded ? certificates : certificates.slice(0, INITIAL_COUNT);
  const hasMore = certificates.length > INITIAL_COUNT;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((cert, i) => (
          <FadeIn key={cert.id} delay={i * 0.05}>
            <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border-default bg-background-elevated">
              {cert.imageUrl && (
                <button
                  type="button"
                  onClick={() => setActive(cert)}
                  className="group relative block h-36 w-full overflow-hidden sm:h-40"
                  aria-label={`View full image for ${cert.name}`}
                >
                  <Image
                    src={cert.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              )}
              <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                <div>
                  <h3 className="font-medium leading-snug">{cert.name}</h3>
                  <p className="mt-1 text-sm text-foreground-muted">{cert.issuingOrganization}</p>
                  <p className="mt-1 font-mono text-xs text-foreground-muted">
                    {cert.dateEarned.toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                </div>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1 rounded-full border border-accent px-3 py-1 font-mono text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Verify ↗
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
            {expanded ? "Show less" : `See more (${certificates.length - INITIAL_COUNT})`}
          </button>
        </div>
      )}

      <ImageLightbox
        src={active?.imageUrl ?? null}
        alt={active ? active.name : ""}
        caption={active?.name}
        onClose={() => setActive(null)}
      />
    </>
  );
}
