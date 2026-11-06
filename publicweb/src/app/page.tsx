"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  MapPin,
  Mail,
  Phone,
  FileCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Fingerprint,
  FileText,
  BadgeCheck,
  GraduationCap
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function PublicWebLandingPage() {
  const router = useRouter();
  const [quickRollNo, setQuickRollNo] = useState("");

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRollNo.trim()) return;
    router.push(`/onboarding?rollNo=${encodeURIComponent(quickRollNo.trim())}`);
  };

  const handleFillDemo = (id: string) => {
    setQuickRollNo(id);
  };

  const notices = [
    {
      id: "NTC-ADM-01",
      ref: "JU/REG/ADM/2026/102",
      date: "Nov 06, 2026",
      title: "Mandatory Online E-Verification & Document Submission for Admitted Students (Session 2026)",
      desc: "All students allocated admission seats across university faculties must authenticate their Student ID / Roll Number and submit digital documents through this portal.",
      link: "/onboarding",
    },
    {
      id: "NTC-ACAD-02",
      ref: "JU/REG/ACAD/2026/044",
      date: "Nov 04, 2026",
      title: "Central Freshmen Orientation Ceremony & Commencement of Academic Semester Classes",
      desc: "Orientation ceremony for incoming freshmen will be held at Zahir Raihan Auditorium followed by departmental class inaugurations as per the academic calendar.",
      link: "#",
    },
    {
      id: "NTC-EXAM-03",
      ref: "JU/COE/EXAM/2026/088",
      date: "Oct 30, 2026",
      title: "Semester Final Examination Registration & Digital Admit Card Issuance",
      desc: "Eligible students are advised to confirm their semester course registrations and clear dues to download authenticated digital admit cards on the LMS portal.",
      link: "http://localhost:3000/auth/login",
    },
    {
      id: "NTC-ACAD-04",
      ref: "JU/REG/GEN/2026/019",
      date: "Oct 25, 2026",
      title: "Central Library E-Resource Access & Campus High-Speed Network Credentials",
      desc: "Registered students can activate institutional credentials to access global e-journals, digital archives, and campus-wide optical fiber network services.",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      {/* ── 1. 2-COLUMN HERO SECTION: EDITORIAL TEXT ON LEFT, SMART ID VERIFIER ON RIGHT ── */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── LEFT COLUMN: REFINED EDITORIAL UNIVERSITY OVERVIEW ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Central Academic Portal • Session 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Student Identity <br />
                <span className="text-emerald-800">Verification & Clearance</span>
              </h1>

              <p className="text-sm sm:text-base font-bold text-slate-700">
                Jahangirnagar University Central Admissions Directorate
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                The official centralized verification gateway for admitted candidates. Authenticate your university seat allocation, submit required statutory records, create your student password, and obtain administrative admission clearance for full LMS portal access.
              </p>
            </div>

            {/* Modern Security & Clearance Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Statutory 2FA Verification</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                <FileCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Encrypted Document Submission</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                <span>Instant LMS Activation</span>
              </span>
            </div>

            {/* Direct Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                <span>Begin Candidate Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href="http://localhost:3000/auth/login"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <span>Student LMS Login</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

          </motion.div>

          {/* ── RIGHT COLUMN: HOLOGRAPHIC DIGITAL STUDENT ID VERIFIER ── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-6 relative"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

            {/* Smart Student ID Hologram Card */}
            <div className="relative z-10 bg-[#0c1815] text-white border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 space-y-6 overflow-hidden">
              
              {/* Animated Hologram Light Streak */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", repeatDelay: 1 }}
                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent skew-x-12 pointer-events-none"
              />

              {/* Card Header: JU Emblem + EMV Smart Chip */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shrink-0">
                    <img
                      src="/JU_logo.png"
                      alt="Jahangirnagar University Crest"
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase">
                      Jahangirnagar University
                    </h3>
                    <p className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">
                      Digital Student Credential • Session 2026
                    </p>
                  </div>
                </div>

                {/* Metallic Gold EMV Chip Graphic */}
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 shadow-sm flex items-center justify-center p-0.5 shrink-0">
                  <div className="w-full h-full border border-amber-700/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-60">
                    <div className="border-r border-amber-700/30" />
                    <div />
                  </div>
                </div>
              </div>

              {/* Integrated Verification Terminal */}
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-[11px] font-mono font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enter Admission Roll / Student ID</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("SP26A001")}
                    className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    Use SP26A001
                  </button>
                </div>

                <form onSubmit={handleQuickVerify} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={quickRollNo}
                      onChange={(e) => setQuickRollNo(e.target.value)}
                      placeholder="E.G. SP26A001"
                      className="w-full px-4 py-3 bg-white/5 border border-emerald-500/40 focus:border-emerald-400 rounded-2xl text-xs sm:text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all uppercase tracking-wider backdrop-blur-sm shadow-inner"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-emerald-400/80 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      JU-ADM
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Authenticate Credentials & Proceed</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>

              {/* Dynamic Student Pass Specimen Preview */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 relative z-10 backdrop-blur-md">
                
                {/* Real-time Scanning Ray */}
                <motion.div
                  animate={{ y: [0, 60, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent pointer-events-none"
                />

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {/* Candidate Photo Placeholder with biometric frame */}
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold shrink-0">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {quickRollNo ? "Abdur Rahman" : "Candidate Identity"}
                      </h4>
                      <p className="text-[10px] font-mono text-emerald-400">
                        Roll: {quickRollNo || "SP26A001"}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active Gateway</span>
                  </span>
                </div>

                {/* Digital Barcode & Cryptographic Seal */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="tracking-widest opacity-70">
                    |||| | |||| ||| ||||| |||| |
                  </span>
                  <span className="text-emerald-400/90 font-semibold">
                    REGISTRAR SEAL • SAVAR
                  </span>
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* ── 2. MINIMAL NOTICE LIST ───────────────────────────────────────────── */}
      <section id="notices" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-slate-200/80 space-y-6">
        
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Notice Board
            </h2>
            <p className="text-xs text-slate-500">
              Official university circulars and academic announcements.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>Admissions Desk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
          {notices.map((ntc) => (
            <div
              key={ntc.id}
              className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {ntc.date}
                  </span>
                  <span>•</span>
                  <span>Ref: {ntc.ref}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors">
                  <Link href={ntc.link}>{ntc.title}</Link>
                </h3>

                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  {ntc.desc}
                </p>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                <Link
                  href={ntc.link}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── 3. MINIMAL CAMPUS CONTACT ────────────────────────────────────────── */}
      <section id="contact" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          
          <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Campus Address</span>
            </span>
            <p className="text-slate-500 leading-relaxed">
              Jahangirnagar University,<br />
              Savar, Dhaka-1342, Bangladesh.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>Administrative Emails</span>
            </span>
            <p className="text-slate-500 leading-relaxed">
              Registrar: <strong>registrar@juniv.edu</strong><br />
              Admissions: <strong>admission@juniv.edu</strong>
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Central PABX & Hotline</span>
            </span>
            <p className="text-slate-500 leading-relaxed">
              PABX: +880-2-7791045-51<br />
              Helpline: +880 1711-223344
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
