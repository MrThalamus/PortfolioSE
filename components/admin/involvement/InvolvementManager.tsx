"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Involvement } from "@prisma/client";
import { InvolvementForm } from "./InvolvementForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteInvolvement } from "@/app/admin/(dashboard)/involvement/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

const TYPE_LABELS: Record<string, string> = {
  JOB: "Job",
  CLUB: "Club",
  RESEARCH_LAB: "Research lab",
  VOLUNTEER: "Volunteer",
  OTHER: "Other",
};

export function InvolvementManager({ involvements }: { involvements: Involvement[] }) {
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
        <InvolvementForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add involvement
        </button>
      )}

      <div className="space-y-3">
        {involvements.map((involvement) =>
          editingId === involvement.id ? (
            <InvolvementForm
              key={involvement.id}
              involvement={involvement}
              onSaved={() => handleSaved(() => setEditingId(null))}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={involvement.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-background-elevated p-4"
            >
              <div className="flex items-center gap-3">
                {involvement.imageUrl && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border-default">
                    <Image src={involvement.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {involvement.role} · {involvement.organization}
                    {involvement.current && (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-xs text-foreground-muted">
                    {TYPE_LABELS[involvement.type]} · {involvement.period} · order {involvement.order}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(involvement.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deleteInvolvement.bind(null, involvement.id)}
                  itemLabel={`${involvement.role} · ${involvement.organization}`}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {involvements.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No involvement added yet.</p>
        )}
      </div>
    </div>
  );
}
