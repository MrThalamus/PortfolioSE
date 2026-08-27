import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getProfile } from "@/lib/data";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : true;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile().catch(() => null);
  const name = profile?.name ?? "Software Engineer Portfolio";
  const tagline = profile?.tagline ?? "Software Engineer — .NET / Backend Systems";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} — ${tagline}`,
      template: `%s — ${name}`,
    },
    description: profile?.heroIntro ?? tagline,
    openGraph: {
      title: `${name} — ${tagline}`,
      description: profile?.heroIntro ?? tagline,
      type: "website",
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${tagline}`,
      description: profile?.heroIntro ?? tagline,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
