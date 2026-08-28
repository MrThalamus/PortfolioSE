import { prisma } from "@/lib/prisma";
import { BeyondAcademicsManager } from "@/components/admin/beyond-academics/BeyondAcademicsManager";

export default async function AdminBeyondAcademicsPage() {
  const entries = await prisma.beyondAcademicsEntry.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Beyond Academics</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Extracurricular activities, volunteering, and anything else outside coursework.
      </p>
      <BeyondAcademicsManager entries={entries} />
    </div>
  );
}
