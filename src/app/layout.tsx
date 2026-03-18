import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineMatch",
  description: "AI-powered movie and TV recommendation platform built for ENSF 400.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
