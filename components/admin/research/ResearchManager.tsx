"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ResearchItem } from "@prisma/client";
import { ResearchForm } from "./ResearchForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteResearchItem } from "@/app/admin/(dashboard)/research/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

const STATUS_LABELS: Record<string, string> = {
  ONGOING: "Ongoing",
  SUBMITTED: "Submitted",
  PUBLISHED: "Published",
};

export function ResearchManager({ researchItems }: { researchItems: ResearchItem[] }) {
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
        <ResearchForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add research item
        </button>
      )}

      <div className="space-y-3">
        {researchItems.map((item) =>
          editingId === item.id ? (
            <ResearchForm
              key={item.id}
              researchItem={item}
              onSaved={() => handleSaved(() => setEditingId(null))}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-background-elevated p-4"
            >
              <div className="flex items-center gap-3">
                {item.imageUrl && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border-default">
                    <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="font-mono text-xs text-foreground-muted">
                    {STATUS_LABELS[item.status]} · {item.year}
                    {item.venue ? ` · ${item.venue}` : ""} · order {item.order}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deleteResearchItem.bind(null, item.id)}
                  itemLabel={item.title}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {researchItems.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No research items yet.</p>
        )}
      </div>
    </div>
  );
}
