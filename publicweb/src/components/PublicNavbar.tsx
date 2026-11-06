"use client";

import Link from "next/link";
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
  PhoneCall,
  ExternalLink,
  Building,
  School
} from "lucide-react";
import { useState } from "react";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      
      {/* Institutional Top Ticker Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white text-[11px] font-semibold py-1.5 px-4 tracking-wide border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
              Admissions 2026
            </span>
            <span className="hidden sm:inline text-slate-300">
              Department of CSE • Jahangirnagar University, Savar, Dhaka-1342
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <Link 
              href="/onboarding" 
              className="text-emerald-300 hover:text-white font-bold transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Student ID & Onboard &rarr;</span>
            </Link>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              PABX: +880-2-7791045
            </span>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and Department Title */}
          <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative w-12 h-12 sm:w-13 sm:h-13 shrink-0 rounded-xl overflow-hidden p-0.5 bg-white border border-slate-200 shadow-xs transition-transform group-hover:scale-105">
              <img
                src="/JU_logo.png"
                alt="Jahangirnagar University Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-950 group-hover:text-emerald-800 transition-colors">
                  Jahangirnagar University
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                  JU CSE
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-700 line-clamp-1">
                Department of Computer Science & Engineering
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Faculty of Mathematical & Physical Sciences • Est. 1970
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <Link href="/" className="hover:text-emerald-800 transition-colors">
              Home
            </Link>
            <Link href="/#programs" className="hover:text-emerald-800 transition-colors">
              Academic Degrees
            </Link>
            <Link href="/#onboarding-guide" className="hover:text-emerald-800 transition-colors">
              E-Onboarding
            </Link>
            <Link href="/#chair-message" className="hover:text-emerald-800 transition-colors">
              Chairman's Message
            </Link>
            <Link href="/#research" className="hover:text-emerald-800 transition-colors">
              Research Labs
            </Link>
            <Link href="/#notices" className="hover:text-emerald-800 transition-colors">
              Notices
            </Link>
            <Link href="/#contact" className="hover:text-emerald-800 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Student Verification Button (Primary Highlight) */}
            <Link
              href="/onboarding"
              className="relative group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Student Verification</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </Link>

            {/* Portal Login Button (Links to Main LMS on port 3000) */}
            <a
              href="http://localhost:3000/auth/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>LMS Portal Login</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-2.5 text-xs font-semibold text-slate-700">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Home
            </Link>
            <Link 
              href="/#programs" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Academic Degrees
            </Link>
            <Link 
              href="/#onboarding-guide" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              E-Onboarding Guide
            </Link>
            <Link 
              href="/#chair-message" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Chairman's Message
            </Link>
            <Link 
              href="/#research" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Research Labs
            </Link>
            <Link 
              href="/#notices" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Notices & Circulars
            </Link>
            <Link 
              href="/#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 px-2 hover:bg-slate-50 rounded"
            >
              Campus & Contact
            </Link>
          </nav>
          
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Student Verification & Document Upload</span>
            </Link>
            <a
              href="http://localhost:3000/auth/login"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-4 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>LMS Portal Login (Port 3000)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
