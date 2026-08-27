"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Achievement } from "@prisma/client";
import { AchievementForm } from "./AchievementForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteAchievement } from "@/app/admin/(dashboard)/achievements/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

export function AchievementsManager({ achievements }: { achievements: Achievement[] }) {
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
        <AchievementForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add achievement
        </button>
      )}

      <div className="space-y-3">
        {achievements.map((achievement) =>
          editingId === achievement.id ? (
            <AchievementForm
              key={achievement.id}
              achievement={achievement}
              onSaved={() => handleSaved(() => setEditingId(null))}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={achievement.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-background-elevated p-4"
            >
              <div className="flex items-center gap-3">
                {achievement.imageUrl && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border-default">
                    <Image src={achievement.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="font-mono text-xs text-foreground-muted">
                    {achievement.eventName} · {achievement.year} · order {achievement.order}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(achievement.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deleteAchievement.bind(null, achievement.id)}
                  itemLabel={achievement.title}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {achievements.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No achievements yet.</p>
        )}
      </div>
    </div>
  );
}
