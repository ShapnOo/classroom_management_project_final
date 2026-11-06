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
  FileCheck
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
      
      {/* ── 1. MINIMAL HERO SECTION ──────────────────────────────────────────── */}
      <section className="pt-20 pb-20 sm:pt-28 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-8">
        
        {/* University Crest */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center">
            <img
              src="/JU_logo.png"
              alt="Jahangirnagar University Crest"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Hero Titles */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Jahangirnagar University
          </h1>
          <p className="text-base sm:text-lg font-semibold text-emerald-800">
            Central Academic & Student Registration Portal
          </p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Autonomous public research university • Savar, Dhaka-1342, Bangladesh • Est. 1970
          </p>
        </motion.div>

        {/* ── MINIMAL FOCUSED VERIFICATION FORM ────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-3"
        >
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Student Admission Verification</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Session 2026</span>
          </div>

          <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={quickRollNo}
              onChange={(e) => setQuickRollNo(e.target.value)}
              placeholder="Enter Admission Roll / Student ID (e.g. SP26A001)"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all uppercase"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Verify & Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Demo ID for Viva / Evaluation: <code className="font-mono font-bold text-slate-700">SP26A001</code></span>
            <Link
              href="/onboarding"
              className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
            >
              Onboarding Portal &rarr;
            </Link>
          </div>
        </motion.div>

        {/* Action Gateway Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 pt-2"
        >
          <Link
            href="/onboarding"
            className="hover:text-emerald-800 flex items-center gap-1 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Complete Candidate Onboarding Guide</span>
          </Link>
          <span className="text-slate-300">•</span>
          <a
            href="http://localhost:3000/auth/login"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 flex items-center gap-1 text-slate-700 transition-colors"
          >
            <span>Student & Faculty LMS Portal Login</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </motion.div>

      </section>

      {/* ── 2. MINIMAL NOTICE LIST ───────────────────────────────────────────── */}
      <section id="notices" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/80 space-y-6">
        
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
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Campus Address</span>
            </span>
            <p className="text-slate-500 leading-relaxed">
              Jahangirnagar University,<br />
              Savar, Dhaka-1342, Bangladesh.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>Administrative Emails</span>
            </span>
            <p className="text-slate-500 leading-relaxed">
              Registrar: <strong>registrar@juniv.edu</strong><br />
              Admissions: <strong>admission@juniv.edu</strong>
            </p>
          </div>

          <div className="space-y-1.5">
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
