"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ExtracurricularEntry } from "@prisma/client";
import { ExtracurricularForm } from "./ExtracurricularForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteExtracurricular } from "@/app/admin/(dashboard)/extracurricular/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

export function ExtracurricularManager({ entries }: { entries: ExtracurricularEntry[] }) {
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
        <ExtracurricularForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add entry
        </button>
      )}

      <div className="space-y-3">
        {entries.map((entry) =>
          editingId === entry.id ? (
            <ExtracurricularForm
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
              <div className="flex items-center gap-3">
                {entry.imageUrl && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border-default">
                    <Image src={entry.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{entry.activity}</p>
                  <p className="font-mono text-xs text-foreground-muted">
                    {entry.role} · {entry.year} · order {entry.order}
                  </p>
                </div>
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
                  action={deleteExtracurricular.bind(null, entry.id)}
                  itemLabel={entry.activity}
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
