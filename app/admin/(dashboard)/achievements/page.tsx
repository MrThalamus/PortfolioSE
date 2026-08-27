import { prisma } from "@/lib/prisma";
import { AchievementsManager } from "@/components/admin/achievements/AchievementsManager";

export default async function AdminAchievementsPage() {
  const achievements = await prisma.achievement.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Achievements</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Medals, competition results, and recognitions.
      </p>
      <AchievementsManager achievements={achievements} />
    </div>
  );
}
