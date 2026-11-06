"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  GraduationCap, 
  ShieldCheck, 
  LogIn, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  Award,
  PhoneCall
} from "lucide-react";
import { useState } from "react";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-800 via-brand-dark to-slate-900 text-white text-[11px] font-semibold py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
          Admissions 2026
        </span>
        <span>Newly Admitted Student Document Verification & E-Onboarding is Now Live.</span>
        <Link 
          href="/publicweb/onboarding" 
          className="text-amber-300 hover:text-white underline font-bold transition-colors ml-1"
        >
          Verify ID & Upload Documents &rarr;
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and University Title */}
          <Link href="/publicweb" className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative w-13 h-13 shrink-0 rounded-xl overflow-hidden p-0.5 transition-transform group-hover:scale-105">
              <img
                src="/JU_logo.png"
                alt="Jahangirnagar University Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-950 group-hover:text-brand-dark transition-colors">
                  Jahangirnagar University
                </span>
                <span className="text-[10px] font-bold bg-brand-dark/10 text-brand-dark px-1.5 py-0.5 rounded">
                  JU CSE
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-600 line-clamp-1">
                Department of Computer Science & Engineering
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Academic Management & E-Onboarding Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <Link href="/publicweb" className="hover:text-brand-dark transition-colors">
              Home
            </Link>
            <Link href="/publicweb#programs" className="hover:text-brand-dark transition-colors">
              Academic Programs
            </Link>
            <Link href="/publicweb#onboarding-guide" className="hover:text-brand-dark transition-colors">
              E-Onboarding Guide
            </Link>
            <Link href="/publicweb#notices" className="hover:text-brand-dark transition-colors">
              Notices & Circulars
            </Link>
            <Link href="/publicweb#faculty" className="hover:text-brand-dark transition-colors">
              Faculty & Research
            </Link>
            <Link href="/publicweb#contact" className="hover:text-brand-dark transition-colors">
              Campus & Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Student Verification Button (Primary Feature) */}
            <Link
              href="/publicweb/onboarding"
              className="relative group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Student Verification</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            </Link>

            {/* Portal Login Button */}
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-brand-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-2.5 text-xs font-semibold text-slate-700">
            <Link 
              href="/publicweb" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Home
            </Link>
            <Link 
              href="/publicweb#programs" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Academic Programs
            </Link>
            <Link 
              href="/publicweb#onboarding-guide" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              E-Onboarding Guide
            </Link>
            <Link 
              href="/publicweb#notices" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Notices
            </Link>
          </nav>
          
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <Link
              href="/publicweb/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Student Verification & Document Upload</span>
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
