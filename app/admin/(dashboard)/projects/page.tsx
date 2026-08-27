import { prisma } from "@/lib/prisma";
import { ProjectsManager } from "@/components/admin/projects/ProjectsManager";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Projects</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Manage the projects shown on the public site.
      </p>
      <ProjectsManager projects={projects} />
    </div>
  );
}
