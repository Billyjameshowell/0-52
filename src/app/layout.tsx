import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getServerUser } from "@/lib/auth";
import { getCurrentWeekET } from "@/lib/weekTime";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "0/52 — One photo per week",
  description: "Capture your year, one photo at a time. 52 weeks. 52 moments. No likes, no noise — just your visual journal.",
  metadataBase: new URL("https://oneper.fly.dev"),
  openGraph: {
    title: "0/52",
    description: "Capture your year, one photo at a time. 52 weeks. 52 moments.",
    url: "https://oneper.fly.dev",
    siteName: "0/52",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "0/52 — One photo per week",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "0/52 — One photo per week",
    description: "Capture your year, one photo at a time. 52 weeks. 52 moments.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

async function TopNav() {
  const user = await getServerUser();
  const handle = user?.handle;
  const currentWeek = getCurrentWeekET();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-300 bg-white backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="text-base font-bold tracking-tight text-zinc-900">
            {currentWeek}/52
          </Link>
          <nav className="hidden items-center gap-3 text-sm font-medium text-zinc-800 sm:flex">
            <Link className="hover:underline" href="/feed">
              Feed
            </Link>
            <Link
              className="hover:underline"
              href={handle ? `/u/${handle}` : "/login"}
            >
              Profile
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {handle ? (
            <>
              <Link
                href={`/u/${handle}`}
                className="rounded-md border border-zinc-300 bg-white p-1.5 text-zinc-900 hover:bg-zinc-100"
                title={`@${handle}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="rounded-md border border-zinc-300 bg-white px-2 py-1 font-medium text-zinc-900 hover:bg-zinc-100">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 font-medium text-zinc-900 hover:bg-zinc-100"
              href="/login"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-zinc-50 font-sans antialiased text-zinc-900`}
        style={{ backgroundColor: "#fafafa", color: "#18181b" }}
      >
        <TopNav />
        <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
