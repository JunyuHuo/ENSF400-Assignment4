import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineMatch",
  description: "AI-powered movie and TV recommendation platform built for ENSF 400.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="cin-nav">
          <div className="page-shell flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.png" alt="CineMatch" style={{ height: 56, width: 56, objectFit: "contain" }} />
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>CineMatch</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/browse" className="nav-link">Browse</Link>
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/onboarding" className="nav-link">Taste</Link>
                <Link href="/about" className="nav-link">About</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/register" className="cin-cta">Get Started</Link>
            </div>
          </div>
        </div>

        <main>
          {children}
        </main>

        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
