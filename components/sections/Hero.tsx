import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/ui/FadeIn";
import { HeroAvatar } from "@/components/sections/HeroAvatar";
import type { Profile } from "@prisma/client";

export function Hero({ profile }: { profile: Profile }) {
  const firstName = profile.name.split(" ")[0];

  return (
    <section id="top" className="relative overflow-hidden border-b border-border-default">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 h-[600px]" />
      <Container className="grid gap-12 py-24 sm:py-32 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <FadeIn>
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
            <HeroAvatar avatarUrl={profile.avatarUrl} name={profile.name} />
            <div>
              <p className="mb-4 font-mono text-sm text-accent">$ whoami</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-3 font-mono text-base text-foreground-muted sm:text-lg">
                {profile.tagline}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-foreground-muted">{profile.heroIntro}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <a
              href="#projects"
              className="rounded-md bg-accent px-4 py-2 font-mono text-sm font-medium text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              View Projects
            </a>
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border-default px-4 py-2 font-mono text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Resume
              </a>
            )}
            <div className="ml-1 flex items-center gap-3">
              {profile.githubUrl && (
                <IconLink href={profile.githubUrl} label="GitHub">
                  <GitHubIcon />
                </IconLink>
              )}
              {profile.linkedinUrl && (
                <IconLink href={profile.linkedinUrl} label="LinkedIn">
                  <LinkedInIcon />
                </IconLink>
              )}
              <IconLink href={`mailto:${profile.email}`} label="Email">
                <MailIcon />
              </IconLink>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <TerminalCard name={firstName} tagline={profile.tagline} email={profile.email} />
        </FadeIn>
      </Container>
    </section>
  );
}

function TerminalCard({
  name,
  tagline,
  email,
}: {
  name: string;
  tagline: string;
  email: string;
}) {
  return (
    <div className="terminal-glow overflow-hidden rounded-lg border border-border-default bg-background-elevated">
      <div className="flex items-center gap-1.5 border-b border-border-default px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-3 font-mono text-xs text-foreground-muted">about.ts</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed">
        <code>
          <span className="text-foreground-muted">{`// ${name}'s profile`}</span>
          {"\n"}
          <span className="text-sky-400">const</span> <span className="text-emerald-400">engineer</span> = {"{"}
          {"\n  "}name: <span className="text-amber-300">&quot;{name}&quot;</span>,
          {"\n  "}focus: <span className="text-amber-300">&quot;{tagline}&quot;</span>,
          {"\n  "}status: <span className="text-amber-300">&quot;open to opportunities&quot;</span>,
          {"\n  "}contact: <span className="text-amber-300">&quot;{email}&quot;</span>,
          {"\n"}
          {"}"};
        </code>
      </pre>
    </div>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border-default text-foreground-muted transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </Link>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
