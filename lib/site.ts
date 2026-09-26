// Canonical public URL of the site, used for metadata, link previews, robots
// and the sitemap. Set NEXT_PUBLIC_SITE_URL in production; the trailing slash
// is stripped so paths can be appended safely.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
