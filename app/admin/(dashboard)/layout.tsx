import Link from "next/link";
import { logout } from "../logout-action";

// Admin pages read data directly through Prisma and must always reflect the
// latest writes after a create/update/delete — never serve a cached RSC payload here.
export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/achievements", label: "Achievements" },
  { href: "/admin/extracurricular", label: "Extracurricular" },
  { href: "/admin/volunteering", label: "Volunteering" },
  { href: "/admin/photography", label: "Photography" },
  { href: "/admin/profile", label: "Profile" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl">
        <aside className="hidden w-56 shrink-0 border-r border-border-default px-4 py-6 md:block">
          <p className="mb-6 px-2 font-mono text-sm text-accent">$ admin</p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-2 py-1.5 font-mono text-sm text-foreground-muted transition-colors hover:bg-background-elevated hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-border-default px-6 py-4">
            <Link href="/" target="_blank" className="font-mono text-xs text-foreground-muted hover:text-accent">
              View site ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="font-mono text-xs text-foreground-muted hover:text-accent"
              >
                Sign out
              </button>
            </form>
          </header>
          <main className="px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
