"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VolunteerEntry } from "@prisma/client";
import { VolunteerForm } from "./VolunteerForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteVolunteer } from "@/app/admin/(dashboard)/volunteering/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

export function VolunteerManager({ entries }: { entries: VolunteerEntry[] }) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleSaved(close: () => void) {
    close();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {showNewForm ? (
        <VolunteerForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add entry
        </button>
      )}

      <div className="space-y-3">
        {entries.map((entry) =>
          editingId === entry.id ? (
            <VolunteerForm
              key={entry.id}
              entry={entry}
              onSaved={() => handleSaved(() => setEditingId(null))}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-background-elevated p-4"
            >
              <div>
                <p className="font-medium">{entry.organization}</p>
                <p className="font-mono text-xs text-foreground-muted">
                  {entry.contribution} · {entry.timeframe} · order {entry.order}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(entry.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deleteVolunteer.bind(null, entry.id)}
                  itemLabel={entry.organization}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {entries.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
