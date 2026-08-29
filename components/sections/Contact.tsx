"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Profile } from "@prisma/client";
import { sendContactMessage, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = {};

export function Contact({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.success) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.success]);

  // Restore what was typed if the last submission failed — see lib/formState.ts.
  const v = state.values;
  const formKey = v ? JSON.stringify(v) : "contact";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="mb-6 max-w-md text-foreground-muted">
          Reach out directly, or send a message below — it&apos;ll land straight in my inbox.
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

      <form key={formKey} ref={formRef} action={formAction} className="space-y-4">
        {/* Honeypot — hidden from real visitors via CSS, not display:none, so
            simple bots that skip invisible fields still fill it in. Named
            "_gotcha" rather than something like "company"/"website" so
            password managers and browser autofill don't recognize and fill
            it (that happened once with a semantic name, silently discarding
            a real visitor's message). */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <input
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </div>

        <div>
          <label htmlFor="contact-name" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            required
            defaultValue={v?.name}
            className="w-full rounded-md border border-border-default bg-background-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
            Your email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            defaultValue={v?.email}
            className="w-full rounded-md border border-border-default bg-background-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1 block font-mono text-xs uppercase tracking-widest text-foreground-muted">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={4}
            defaultValue={v?.message}
            className="w-full resize-none rounded-md border border-border-default bg-background-elevated px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>

        {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}
        {state.success && (
          <p className="font-mono text-sm text-emerald-500">Message sent — thanks for reaching out!</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 font-mono text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send message"}
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
