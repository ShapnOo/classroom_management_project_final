import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jahangirnagar University — Department of Computer Science & Engineering",
  description: "Official Academic Public Portal & Admitted Student E-Onboarding Verification for Jahangirnagar University Department of CSE.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-brand-dark selection:text-white" suppressHydrationWarning>
        <PublicNavbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <PublicFooter />
      </body>
    </html>
  );
}

