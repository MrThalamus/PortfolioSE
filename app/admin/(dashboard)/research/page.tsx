import { prisma } from "@/lib/prisma";
import { ResearchManager } from "@/components/admin/research/ResearchManager";

export default async function AdminResearchPage() {
  const researchItems = await prisma.researchItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Research</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Papers, ongoing studies, and research work.
      </p>
      <ResearchManager researchItems={researchItems} />
    </div>
  );
}
