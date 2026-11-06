import Link from "next/link";
import { GraduationCap, MapPin, Mail, Phone, Globe, ShieldCheck, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: University & Dept Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 overflow-hidden">
                <img
                  src="/JU_logo.png"
                  alt="Jahangirnagar University"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-white text-sm font-bold tracking-tight">
                  Jahangirnagar University
                </h3>
                <p className="text-[11px] text-slate-300">
                  Department of Computer Science & Engineering
                </p>
                <p className="text-[10px] text-emerald-400 font-mono">
                  Autonomous Public Research University • Est. 1970
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              Department of Computer Science & Engineering at Jahangirnagar University is recognized for pioneering research, outcome-based academic curricula, and producing industry-leading software engineers, AI researchers, and academic scholars.
            </p>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Academic Building, JU Campus, Savar, Dhaka-1342, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>cse@juniv.edu • academic.office@juniv.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+880-2-7791045-51 (Ext. 1420)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Academic Programs */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Academic Programs
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/publicweb#programs" className="hover:text-emerald-400 transition-colors">
                  B.Sc. (Engg.) in CSE (4 Years)
                </Link>
              </li>
              <li>
                <Link href="/publicweb#programs" className="hover:text-emerald-400 transition-colors">
                  M.Sc. in Computer Science
                </Link>
              </li>
              <li>
                <Link href="/publicweb#programs" className="hover:text-emerald-400 transition-colors">
                  PGDIT (Post Graduate Diploma)
                </Link>
              </li>
              <li>
                <Link href="/publicweb#programs" className="hover:text-emerald-400 transition-colors">
                  Master in Information Technology (MIT)
                </Link>
              </li>
              <li>
                <Link href="/publicweb#programs" className="hover:text-emerald-400 transition-colors">
                  Ph.D. & M.Phil in Computing & AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Student E-Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Admissions & Onboarding
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/publicweb/onboarding" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Student ID Verification</span>
                </Link>
              </li>
              <li>
                <Link href="/publicweb/onboarding" className="hover:text-emerald-400 transition-colors">
                  Upload Required Documents
                </Link>
              </li>
              <li>
                <Link href="/publicweb#onboarding-guide" className="hover:text-emerald-400 transition-colors">
                  Document Checklist & Guidelines
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-emerald-400 transition-colors">
                  Student Portal LMS Login
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-emerald-400 transition-colors">
                  Faculty & Admin Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Resources */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">
              Campus & Resources
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a href="https://juniv.edu" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  JU Official University Website
                </a>
              </li>
              <li>
                <Link href="/publicweb#notices" className="hover:text-emerald-400 transition-colors">
                  Academic Calendar 2026
                </Link>
              </li>
              <li>
                <Link href="/publicweb#faculty" className="hover:text-emerald-400 transition-colors">
                  Faculty Profiles & Research
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Central Library & Digital Archives</span>
              </li>
              <li>
                <span className="text-slate-500">JU Cyber Center & ICT Cell</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Jahangirnagar University. Department of Computer Science & Engineering. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Scholaris Academic Management & E-Onboarding System</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
