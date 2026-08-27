import { prisma } from "@/lib/prisma";
import { ExtracurricularManager } from "@/components/admin/extracurricular/ExtracurricularManager";

export default async function AdminExtracurricularPage() {
  const entries = await prisma.extracurricularEntry.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Extracurricular</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Activities, clubs, and events you&apos;ve participated in.
      </p>
      <ExtracurricularManager entries={entries} />
    </div>
  );
}
