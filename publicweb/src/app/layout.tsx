import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Jahangirnagar University — Central Academic & Student E-Onboarding Portal",
  description: "Official Central Academic Public Portal & Admitted Student E-Onboarding Verification for Jahangirnagar University.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-emerald-900 selection:text-white" suppressHydrationWarning>
        <PublicNavbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <PublicFooter />
      </body>
    </html>
  );
}
