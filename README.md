# Software Engineer Portfolio

A dark-mode-first, database-driven portfolio site for a backend/.NET-leaning software engineer. Every piece of content — projects, achievements & competitions, beyond-academics involvement (extracurricular/volunteering), photography, and the profile/bio — is stored in Postgres and managed through a password-protected `/admin` panel. Nothing is hardcoded, so publishing new content never requires a code change or redeploy.

**Stack:** Next.js (App Router) + TypeScript, Tailwind CSS, Framer Motion, Prisma, PostgreSQL, Vercel Blob (photo uploads).

## 1. Prerequisites

- Node.js 20+
- A PostgreSQL database. Free options that work well here:
  - [Neon](https://neon.tech) — serverless Postgres, generous free tier
  - [Supabase](https://supabase.com) — Postgres + extras, free tier

## 2. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string from Neon/Supabase (or a local Postgres instance) |
| `SESSION_SECRET` | Any long random string — used to sign the admin session cookie. Generate one with `openssl rand -base64 32` |
| `ADMIN_USERNAME` | The username you'll use to log into `/admin` |
| `ADMIN_PASSWORD_HASH` | A **bcrypt hash** of your admin password (see below) |
| `BLOB_READ_WRITE_TOKEN` | Optional. Without it, uploaded files are written to `public/uploads` on disk — fine for local dev, but **not for Vercel production** (its filesystem is read-only/ephemeral). Get a token from [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) before deploying if you want in-app uploads to work there; pasting an image URL always works either way |
| `NEXT_PUBLIC_SITE_URL` | Your site's public URL, used for SEO/Open Graph tags |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Optional but needed for the public contact form to actually deliver email — see below. Without these, the form shows a friendly error instead of failing silently |

Generate your admin password hash:

```bash
npm run hash-password -- "your-password-here"
```

Paste the resulting hash into `ADMIN_PASSWORD_HASH`.

> **Important:** bcrypt hashes are full of `$` characters, and Next.js's `.env` loader expands `$VAR`-style references. Escape every `$` as `\$` when pasting the hash into `.env`, e.g. `ADMIN_PASSWORD_HASH="\$2b\$12\$abc123..."`. Otherwise login will silently fail.

### Contact form email (optional)

The public Contact section sends real email via your own Gmail account (free, no third-party service):

1. Turn on 2-Step Verification on the Google account you want to send from: https://myaccount.google.com/security
2. Generate an "App Password" for it: https://myaccount.google.com/apppasswords
3. Set `GMAIL_USER` to that Gmail address and `GMAIL_APP_PASSWORD` to the generated app password.

Messages are delivered to whatever email is set on your profile in `/admin/profile` — change it there anytime, no redeploy needed. Each message's "reply-to" is set to the visitor's own address, so replying from your inbox goes straight to them. If these env vars aren't set, the form shows a clear error instead of pretending to send.

To use a different provider instead of Gmail later, set `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` (see `.env.example`) — those take priority over the Gmail vars.

## 3. Database setup

Run the initial migration (creates all tables from `prisma/schema.prisma`):

```bash
npm run db:migrate
```

Seed the database with clearly-labeled placeholder content, so the site renders immediately and you can see exactly what to replace:

```bash
npm run db:seed
```

Other useful commands:

```bash
npm run db:studio   # opens Prisma Studio, a GUI for browsing/editing the database directly
```

## 4. Run it

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site, and [http://localhost:3000/admin](http://localhost:3000/admin) to log in and manage content.

## 5. Managing content via `/admin`

Log in with the `ADMIN_USERNAME` / password you configured. From there:

- **Projects** — title, summary, description, tech stack (comma-separated), type (`Demo video` / `Live` / `Repo-only`), links, and a problem/approach/outcome breakdown shown in the project detail modal. Use `order` to control display order and `published` to hide a project without deleting it.
- **Achievements & Competitions** — coding/hackathon results, event names, etc.
- **Beyond Academics** — extracurricular activities, volunteering, and anything else outside coursework, kept as one section since that line is often blurry in practice (e.g. organizing a blood donation campaign is both).

Both have an `order` field for manual sorting and an optional photo (upload a file or paste a URL), shown as a full-width cover image on the card — click it for the full-size lightbox view.
- **Photography** — either upload an image file directly (saved to `public/uploads` locally, or to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set) or paste an image URL. Alt text is required for accessibility.
- **Profile** — your name, a nickname (used for the nav logo and the hero's code-snippet card — set this if your full name has a title/prefix like "Md." or "Dr." that shouldn't be used as your short name), tagline, hero intro, bio, contact links, resume URL, a profile photo, and a skills grid grouped by category (add/remove categories freely; list items as a comma-separated string per category). Uploading a profile photo automatically removes its background right in your browser ([`@imgly/background-removal`](https://github.com/imgly/background-removal-js) — no API key, no per-image cost, nothing sent to a third party) so the hero section can show it as a cutout over a colored backdrop. First use downloads a small ML model (a few seconds); after that it's instant. If it fails (e.g. no internet) you can still submit the original photo or paste a URL.

Every optional image field (profile photo, achievement/beyond-academics photo) supports uploading a file, pasting a URL instead, or checking "Remove current image" to clear it — leaving both blank on an edit keeps whatever image was already set.

Every create/update/delete calls `revalidatePath` so the public site reflects your change immediately — no redeploy needed.

## 6. Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Add all the environment variables from `.env` to the Vercel project settings (Production + Preview).
3. If you want in-app photo uploads, create a Vercel Blob store and add its `BLOB_READ_WRITE_TOKEN`.
4. Deploy. Vercel runs `prisma generate && next build` automatically via the `build` script.
5. Run migrations against your production database once (from your machine, pointed at the prod `DATABASE_URL`):
   ```bash
   npx prisma migrate deploy
   ```
6. Optionally seed placeholder content the same way, or just start adding real content through `/admin`.

## Project structure

```
app/                    Routes (App Router)
  admin/                Password-protected admin panel
    (dashboard)/        Shared admin shell + one page per content type
    login/              Login form + server action
  page.tsx              Public homepage, assembles all sections from the DB
components/
  admin/                Admin forms, list managers, shared form styles
  layout/               Nav, Footer
  sections/             Public-facing sections (Hero, Projects, About, etc.)
  theme/                Dark/light theme toggle
  ui/                    Shared primitives (Container, Section, Badge, FadeIn)
lib/
  prisma.ts             Prisma client singleton
  data.ts               Read-only data-fetching helpers for public pages
  validations.ts        Zod schemas shared by every admin server action
  auth.ts               Session cookie creation/verification
  mail.ts               SMTP transporter for the contact form (Gmail by default)
prisma/
  schema.prisma         Data model
  seed.ts               Placeholder content seed script
proxy.ts                Route protection for /admin/* (Next.js "Proxy", formerly Middleware)
```

## Notes

- Dark mode is the default; the toggle in the nav persists the choice to `localStorage`.
- Tech stack tags, skills, and other list-like fields are entered as comma-separated text in forms rather than raw JSON — no code editing required.
- Uploaded/linked photo hosts are allowed broadly in `next.config.ts`'s `images.remotePatterns` since this is a single-admin site; tighten this if you want stricter control.
