import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOverview() {
  const [projects, research, achievements, certificates, beyondAcademics, involvements, photos, galleryImages, profile] =
    await Promise.all([
      prisma.project.count(),
      prisma.researchItem.count(),
      prisma.achievement.count(),
      prisma.certificate.count(),
      prisma.beyondAcademicsEntry.count(),
      prisma.involvement.count(),
      prisma.photo.count(),
      prisma.galleryImage.count(),
      prisma.profile.findUnique({ where: { id: "profile" } }),
    ]);

  const cards = [
    { label: "Projects", count: projects, href: "/admin/projects" },
    { label: "Research", count: research, href: "/admin/research" },
    { label: "Milestones & Achievements", count: achievements, href: "/admin/achievements" },
    { label: "Certificates", count: certificates, href: "/admin/certificates" },
    { label: "Beyond Academics", count: beyondAcademics, href: "/admin/beyond-academics" },
    { label: "Involvement", count: involvements, href: "/admin/involvement" },
    { label: "Photography", count: photos, href: "/admin/photography" },
    { label: "Gallery", count: galleryImages, href: "/admin/gallery" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Overview</h1>
      <p className="mb-8 font-mono text-sm text-foreground-muted">
        {profile ? `Signed in — managing ${profile.name}'s site.` : "No profile set up yet."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-border-default bg-background-elevated p-5 transition-colors hover:border-accent"
          >
            <p className="font-mono text-3xl font-semibold">{card.count}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-foreground-muted">
              {card.label}
            </p>
          </Link>
        ))}
      </div>

      {!profile && (
        <p className="mt-8 font-mono text-sm text-amber-500">
          Set up your profile first at{" "}
          <Link href="/admin/profile" className="underline">
            /admin/profile
          </Link>
          .
        </p>
      )}
    </div>
  );
}
