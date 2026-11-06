import Link from "next/link";
import { ShieldCheck, LogIn, ExternalLink } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-xs text-slate-500 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg p-0.5 bg-white border border-slate-200">
            <img
              src="/JU_logo.png"
              alt="Jahangirnagar University"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-slate-800">
              Jahangirnagar University
            </p>
            <p className="text-[11px] text-slate-400">
              Central Academic & Student Registration Network • Savar, Dhaka
            </p>
          </div>
        </div>

        {/* Minimal Navigation: Home, Notice, Contact, Student Registration, LMS Login */}
        <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link href="/#notices" className="hover:text-slate-900 transition-colors">
            Notice
          </Link>
          <Link href="/#contact" className="hover:text-slate-900 transition-colors">
            Contact
          </Link>
          <Link href="/onboarding" className="text-emerald-700 hover:text-emerald-900 font-bold transition-colors">
            Student Registration
          </Link>
          <a
            href="http://localhost:3000/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1 transition-colors"
          >
            <span>LMS Login</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          &copy; {new Date().getFullYear()} JU. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
