import { prisma } from "@/lib/prisma";
import { InvolvementManager } from "@/components/admin/involvement/InvolvementManager";

export default async function AdminInvolvementPage() {
  const involvements = await prisma.involvement.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Involvement</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Jobs, clubs, research labs, and other ongoing engagements.
      </p>
      <InvolvementManager involvements={involvements} />
    </div>
  );
}
