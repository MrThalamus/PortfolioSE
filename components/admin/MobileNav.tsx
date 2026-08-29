"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-default md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-mono text-sm text-accent">$ admin</p>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border-default"
          aria-label="Toggle admin menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="space-y-1 border-t border-border-default px-4 py-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2 font-mono text-sm text-foreground-muted transition-colors hover:bg-background-elevated hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
