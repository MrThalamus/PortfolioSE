import { prisma } from "@/lib/prisma";
import { VolunteerManager } from "@/components/admin/volunteering/VolunteerManager";

export default async function AdminVolunteeringPage() {
  const entries = await prisma.volunteerEntry.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Volunteering</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Organizations and causes you&apos;ve contributed to.
      </p>
      <VolunteerManager entries={entries} />
    </div>
  );
}
