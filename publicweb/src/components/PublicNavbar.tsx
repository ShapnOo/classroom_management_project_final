"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  LogIn, 
  Menu, 
  X, 
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#fafaf9]/90 backdrop-blur-md border-b border-slate-200/70 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & University Title */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 shrink-0 rounded-xl p-0.5 bg-white border border-slate-200 shadow-2xs group-hover:border-slate-300 transition-all">
              <img
                src="/JU_logo.png"
                alt="Jahangirnagar University Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                Jahangirnagar University
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Central Academic Portal
              </span>
            </div>
          </Link>

          {/* Clean Desktop Navigation: ONLY Home, Notice, Contact */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <Link 
              href="/" 
              className="hover:text-slate-900 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/#notices" 
              className="hover:text-slate-900 transition-colors"
            >
              Notice
            </Link>
            <Link 
              href="/#contact" 
              className="hover:text-slate-900 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Action CTAs: Student Registration & LMS Portal Login */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Student Registration Button */}
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Student Registration</span>
            </Link>

            {/* LMS Portal Login Button */}
            <a
              href="http://localhost:3000/auth/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <span>LMS Login</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-5 pt-3 pb-6 space-y-3 shadow-lg"
          >
            <nav className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2 hover:bg-slate-50 rounded"
              >
                Home
              </Link>
              <Link 
                href="/#notices" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2 hover:bg-slate-50 rounded"
              >
                Notice
              </Link>
              <Link 
                href="/#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2 hover:bg-slate-50 rounded"
              >
                Contact
              </Link>
            </nav>
            
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link
                href="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Student Registration</span>
              </Link>
              <a
                href="http://localhost:3000/auth/login"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>LMS Login</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
