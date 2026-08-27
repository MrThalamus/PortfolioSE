"use client";

import { useState } from "react";
import type { Profile } from "@prisma/client";

export function Contact({ profile }: { profile: Profile }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="mb-6 max-w-md text-foreground-muted">
          Reach out directly, or send a message below — it will open in your email client.
        </p>
        <div className="space-y-3">
          <ContactRow label="Email" value={profile.email} href={`mailto:${profile.email}`} />
          {profile.githubUrl && (
            <ContactRow label="GitHub" value={profile.githubUrl.replace(/^https?:\/\//, "")} href={profile.githubUrl} />
          )}
          {profile.linkedinUrl && (
            <ContactRow label="LinkedIn" value={profile.linkedinUrl.replace(/^https?:\/\//, "")} href={profile.linkedinUrl} />
          )}
          {profile.resumeUrl && (
            <ContactRow label="Resume" value="Download PDF" href={profile.resumeUrl} />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
            Name
          </label>
          <input
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border-default bg-background-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
            Your email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border-default bg-background-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
            Message
          </label>
          <textarea
            id="contact-message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-md border border-border-default bg-background-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 font-mono text-sm font-medium text-accent-foreground"
        >
          Send message
        </button>
      </form>
    </div>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      className="flex items-center justify-between rounded-md border border-border-default bg-background-elevated px-4 py-3 transition-colors hover:border-accent"
    >
      <span className="font-mono text-xs uppercase tracking-widest text-foreground-muted">{label}</span>
      <span className="text-sm text-accent">{value}</span>
    </a>
  );
}
