"use client";

import { Orbitron } from "next/font/google";
import FuturisticScene3DLazy from "@/components/landing/FuturisticScene3DLazy";
import "@/components/landing/landing-futuristic.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-orbitron",
});

export default function FuturisticShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`landing-futuristic min-h-screen overflow-x-hidden bg-[#05070c] ${orbitron.variable}`}
    >
      <FuturisticScene3DLazy />
      <div className="lf-grid-overlay" aria-hidden />
      <div className="lf-vignette" aria-hidden />
      <div className="lf-page relative">{children}</div>
    </div>
  );
}
