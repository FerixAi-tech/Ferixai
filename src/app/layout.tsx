import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_URL } from "@/lib/constants/urls";
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
  metadataBase: new URL(APP_URL),
  title: "FerixAI — Visibility for UK businesses",
  description:
    "FerixAI helps UK local businesses become easier to find when people ask AI assistants for recommendations.",
  keywords: [
    "FerixAI",
    "UK business visibility",
    "AI recommendations",
    "local business marketing",
    "content publishing",
  ],
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: APP_URL,
    siteName: "FerixAI",
    title: "FerixAI — Visibility for UK businesses",
    description:
      "Tell us about your business. We’ll prepare and publish clear local content designed to help people find you.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
