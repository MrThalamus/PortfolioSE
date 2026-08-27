import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/admin/profile/ProfileForm";

export default async function AdminProfilePage() {
  const profile = await prisma.profile.findUnique({ where: { id: "profile" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Profile</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Your name, bio, contact links, and skills grid shown on the public site.
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}
