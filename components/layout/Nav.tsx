"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type NavLink = { href: string; label: string };
type NavItem = NavLink | { label: string; children: NavLink[] };

const NAV_ITEMS: NavItem[] = [
  { href: "#top", label: "home" },
  {
    label: "work",
    children: [
      { href: "#projects", label: "projects" },
      { href: "#research", label: "research" },
    ],
  },
  {
    label: "journey",
    children: [
      { href: "#achievements", label: "achievements" },
      { href: "#beyond-academics", label: "beyond academics" },
      { href: "#involvement", label: "involvement" },
    ],
  },
  {
    label: "media",
    children: [
      { href: "#photography", label: "photography" },
      { href: "#gallery", label: "gallery" },
    ],
  },
  { href: "#about", label: "about" },
  { href: "#contact", label: "contact" },
];

function isGroup(item: NavItem): item is { label: string; children: NavLink[] } {
  return "children" in item;
}

export function Nav({ shortName }: { shortName: string }) {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-background/80 backdrop-blur">
      <nav ref={navRef} className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="#top" className="font-mono text-sm font-semibold tracking-tight">
          <span className="text-accent">~/</span>
          {shortName.toLowerCase()}
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) =>
            isGroup(item) ? (
              <li key={item.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                  aria-expanded={openGroup === item.label}
                  className="flex items-center gap-1 font-mono text-sm text-foreground-muted transition-colors hover:text-accent"
                >
                  {item.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform ${openGroup === item.label ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {openGroup === item.label && (
                  <ul className="absolute left-1/2 top-full mt-2 w-44 -translate-x-1/2 rounded-md border border-border-default bg-background-elevated py-1 shadow-lg">
                    {item.children.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          onClick={() => setOpenGroup(null)}
                          className="block px-4 py-2 font-mono text-sm text-foreground-muted transition-colors hover:bg-background hover:text-accent"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="font-mono text-sm text-foreground-muted transition-colors hover:text-accent"
                >
                  {item.label}
                </a>
              </li>
            )
          )}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border-default md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <ul className="flex flex-col border-t border-border-default px-6 py-4 md:hidden">
          {NAV_ITEMS.map((item) =>
            isGroup(item) ? (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenMobileGroup((g) => (g === item.label ? null : item.label))}
                  aria-expanded={openMobileGroup === item.label}
                  className="flex w-full items-center justify-between py-2 font-mono text-sm text-foreground-muted transition-colors hover:text-accent"
                >
                  {item.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform ${openMobileGroup === item.label ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {openMobileGroup === item.label && (
                  <ul className="flex flex-col border-l border-border-default pl-4">
                    {item.children.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          onClick={() => {
                            setOpen(false);
                            setOpenMobileGroup(null);
                          }}
                          className="block py-2 font-mono text-sm text-foreground-muted transition-colors hover:text-accent"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-mono text-sm text-foreground-muted transition-colors hover:text-accent"
                >
                  {item.label}
                </a>
              </li>
            )
          )}
        </ul>
      )}
    </header>
  );
}
