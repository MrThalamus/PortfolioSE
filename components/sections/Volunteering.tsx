import type { VolunteerEntry } from "@prisma/client";
import { FadeIn } from "@/components/ui/FadeIn";

export function Volunteering({ entries }: { entries: VolunteerEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="font-mono text-sm text-foreground-muted">
        No volunteering entries added yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border-default rounded-lg border border-border-default bg-background-elevated">
      {entries.map((entry, i) => (
        <FadeIn key={entry.id} delay={i * 0.05}>
          <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium">{entry.organization}</h3>
              <p className="text-sm text-foreground-muted">{entry.contribution}</p>
            </div>
            <span className="font-mono text-xs text-foreground-muted">{entry.timeframe}</span>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
