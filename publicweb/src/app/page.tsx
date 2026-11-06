"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  MapPin,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Code,
  Cpu,
  Brain,
  Layers,
  Network,
  Lock,
  Trophy,
  Terminal,
  Compass,
  School,
  Check,
  Search,
  Download,
  HelpCircle,
  FileCheck,
  BookmarkCheck,
  Activity
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PublicWebLandingPage() {
  const router = useRouter();
  const [landingData, setLandingData] = useState<any>(null);
  const [quickRollNo, setQuickRollNo] = useState("");
  const [selectedNoticeTab, setSelectedNoticeTab] = useState<"all" | "admission" | "academic" | "research">("all");
  const [selectedProgramTab, setSelectedProgramTab] = useState<"undergrad" | "postgrad" | "diploma">("undergrad");

  useEffect(() => {
    api.getPublicLandingData()
      .then((res) => {
        if (res.data) setLandingData(res.data);
      })
      .catch((err) => {
        console.warn("Public landing data error:", err);
      });
  }, []);

  const stats = landingData?.stats || {
    totalStudents: "1,280+",
    facultyCount: "34",
    phdFaculty: "22 Ph.D. Holders",
    activePrograms: "5 Degrees",
    employmentRate: "98.4%",
    researchPublications: "480+",
    icpcAppearances: "12 Times",
  };

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRollNo.trim()) return;
    router.push(`/onboarding?rollNo=${encodeURIComponent(quickRollNo.trim())}`);
  };

  const notices = [
    {
      id: "NTC-ADM-2026-01",
      ref: "JU/CSE/ADM/2026/108",
      category: "admission",
      categoryLabel: "Admissions & Verification",
      categoryColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      date: "Nov 06, 2026",
      title: "Mandatory Online E-Verification & Document Submission for Admitted Students (Spring 2026)",
      desc: "All allocated candidates for B.Sc. (Engg.) in CSE must authenticate their Roll Number, verify registered contact credentials, and upload educational transcripts through the department onboarding portal before registration closing.",
      isUrgent: true,
      link: "/onboarding",
    },
    {
      id: "NTC-ACAD-2026-02",
      ref: "JU/CSE/ACAD/2026/044",
      category: "academic",
      categoryLabel: "Academic Schedule",
      categoryColor: "bg-blue-50 text-blue-800 border-blue-200",
      date: "Nov 04, 2026",
      title: "Commencement of Spring 2026 Academic Classes & Central Orientation Ceremony",
      desc: "Freshmen orientation for the 54th Batch of Computer Science & Engineering will be held at Zahir Raihan Auditorium on Saturday, November 15, 2026 at 10:00 AM BST followed by lab orientation.",
      isUrgent: false,
      link: "#",
    },
    {
      id: "NTC-RES-2026-03",
      ref: "JU/CSE/RES/2026/019",
      category: "research",
      categoryLabel: "Research & Grants",
      categoryColor: "bg-purple-50 text-purple-800 border-purple-200",
      date: "Oct 29, 2026",
      title: "Call for Research Fellowships: JU Bangla NLP & Deep Speech Synthesis Consortium",
      desc: "Graduate research positions (with monthly stipend) are open for M.Sc. and Ph.D. candidates to develop large foundation language models tailored to low-resource regional dialects.",
      isUrgent: false,
      link: "#",
    },
    {
      id: "NTC-ACAD-2026-04",
      ref: "JU/CSE/EXAM/2026/092",
      category: "academic",
      categoryLabel: "Academic Notice",
      categoryColor: "bg-blue-50 text-blue-800 border-blue-200",
      date: "Oct 24, 2026",
      title: "Semester Final Examination Schedule & Admit Card Issuance for 7th & 8th Semesters",
      desc: "Students of academic sessions 2021-22 are instructed to clear all departmental and laboratory dues to download their verified digital admit cards via the LMS student dashboard.",
      isUrgent: false,
      link: "http://localhost:3000/auth/login",
    },
  ];

  const filteredNotices = selectedNoticeTab === "all"
    ? notices
    : notices.filter(n => n.category === selectedNoticeTab);

  return (
    <div className="space-y-20 pb-24 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── 1. INSTITUTIONAL HERO SECTION ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-10 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        
        {/* Subtle Architectural Grid and Ambient Lighting */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-emerald-600/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-8">
          
          {/* Top Heritage Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Spring 2026 Academic Session</span>
              <span className="text-emerald-600">•</span>
              <span className="text-white font-medium">E-Recruitment & Verification Active</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>BAETE Tier-1 Accredited (Washington Accord)</span>
            </div>
          </div>

          {/* Department Seal & Identity Header */}
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-block p-1 rounded-2xl bg-gradient-to-b from-white/20 to-white/5 shadow-2xl backdrop-blur-md">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl p-2 flex items-center justify-center shadow-inner">
                <img
                  src="/JU_logo.png"
                  alt="Jahangirnagar University Crest"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-emerald-400 flex items-center justify-center gap-2">
                <span>Faculty of Mathematical & Physical Sciences</span>
                <span className="text-slate-600">•</span>
                <span>Est. 1970</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Department of Computer Science & Engineering
              </h1>
              <p className="text-base sm:text-lg text-emerald-100/90 font-medium max-w-3xl mx-auto">
                Jahangirnagar University, Savar, Dhaka
              </p>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed pt-1">
                Pioneering academic excellence in software architecture, computational intelligence, and high-performance computing through rigorous Outcome-Based Education (OBE) and world-class research.
              </p>
            </div>
          </div>

          {/* Quick Verification & Action Card (Centerpiece) */}
          <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative">
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              
              <div className="space-y-1.5 text-left w-full md:w-auto">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admitted Student Portal</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Verify Student ID & Onboard Online
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  Allocated a seat in Spring 2026? Enter your assigned Student Roll No to complete 2FA OTP & document uploads.
                </p>
              </div>

              {/* Fast Input Form */}
              <form onSubmit={handleQuickVerify} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={quickRollNo}
                    onChange={(e) => setQuickRollNo(e.target.value)}
                    placeholder="e.g. SP26A001"
                    className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all uppercase"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
                    ID
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Verify Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

            {/* Test Credentials Quick Pill */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/90 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <span className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Student ID for Viva / Evaluation: <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">SP26A001</code></span>
              </span>
              <Link
                href="/onboarding"
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1 ml-auto"
              >
                <span>Full Onboarding Guide</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Secondary Dual Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold pt-2">
            <Link
              href="/onboarding"
              className="px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step E-Recruitment Portal</span>
            </Link>

            <a
              href="http://localhost:3000/auth/login"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Institutional LMS Portal (Port 3000)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

        </div>

      </section>

      {/* ── 2. INSTITUTIONAL CREDIBILITY METRICS ──────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 sm:-mt-14 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-950 font-sans">
              {stats.totalStudents}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Scholars
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">B.Sc, M.Sc, PGDIT, Ph.D.</div>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-sans">
              {stats.facultyCount}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Faculty Members
            </div>
            <div className="text-[10px] text-slate-500 font-medium">22 Ph.D. from Global Top 100</div>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-teal-700 font-sans">
              {stats.employmentRate}
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Career & Higher Study
            </div>
            <div className="text-[10px] text-slate-500 font-medium">FAANG, Research & Startups</div>
          </div>

          <div className="space-y-1 border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-sans">
              12x
            </div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ICPC World Finals
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Global Programming Heritage</div>
          </div>

        </div>
      </div>

      {/* ── 3. CHAIRMAN'S WELCOME ADDRESS ────────────────────────────────────────── */}
      <section id="chair-message" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-8 sm:p-10 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            
            {/* Chairman Portrait & Credentials */}
            <div className="shrink-0 text-center space-y-3">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-tr from-emerald-900 to-slate-800 flex items-center justify-center text-white">
                <div className="text-center p-3">
                  <School className="w-12 h-12 mx-auto text-emerald-300 mb-1" />
                  <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-200">
                    Dept. of CSE
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Jahangirnagar Univ.
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Prof. Dr. Shamim Al Mamun
                </h3>
                <p className="text-xs text-emerald-800 font-semibold">
                  Chairman & Professor
                </p>
                <p className="text-[11px] text-slate-500">
                  Ph.D. in Computer Engineering • Senior Member IEEE
                </p>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-4 text-slate-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Message from the Department Chairman</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Nurturing Principled Engineers, Researchers, and Global Computing Leaders
              </h2>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                &ldquo;Welcome to the Department of Computer Science & Engineering at Jahangirnagar University. Since our establishment, we have strived to build an uncompromising culture of analytical depth, scientific rigor, and ethical responsibility. Our Outcome-Based Education (OBE) curriculum is meticulously balanced between foundational mathematical theory and state-of-the-art technological application.&rdquo;
              </p>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                &ldquo;Through our newly launched digital onboarding and university classroom architecture, we guarantee our incoming scholars immediate access to cutting-edge coursework, laboratory infrastructure, and mentorship from day one. I invite all admitted students to complete their verification and take their place in our enduring tradition of excellence.&rdquo;
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium border-t border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>BAETE Washington Accord Standards</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Interdisciplinary Research Grants</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Direct Industry Capstone Pipeline</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. ADMITTED STUDENT E-RECRUITMENT & VERIFICATION WORKFLOW ────────── */}
      <section id="onboarding-guide" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            Statutory E-Recruitment Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admitted Student E-Verification & Document Flow
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Follow our 4-step institutional onboarding lifecycle to validate admission allocation, submit digital certificates, and activate your student LMS credentials.
          </p>
        </div>

        {/* 4 Interactive Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative flex flex-col justify-between group hover:border-emerald-500 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Identity & Roll Lookup
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Candidate inputs their official Admission Roll No (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">SP26A001</code>), matching registered email and mobile.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span>Database record check</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative flex flex-col justify-between group hover:border-emerald-500 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-black text-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Two-Factor OTP Check
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A 6-digit authentication token is generated and dispatched to the student's mobile and email to authenticate candidate ownership.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-teal-700 font-semibold flex items-center gap-1">
              <span>Evaluation OTP: 123456</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative flex flex-col justify-between group hover:border-emerald-500 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center font-black text-sm group-hover:bg-amber-600 group-hover:text-white transition-colors">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Bio-Data & Document Upload
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Student completes guardian details, permanent address, blood group, and uploads SSC/HSC transcripts, NID, photo, and bank slip.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <span>Encrypted file repository</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative flex flex-col justify-between group hover:border-emerald-500 transition-all">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Verified Slip & LMS Access
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The system updates student status to &ldquo;Verified&rdquo; in the database, generates an official QR-stamped admission slip, and unlocks course access.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
              <span>Ready for classroom portal</span>
            </div>
          </div>

        </div>

        {/* Callout Action Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Ready to complete your student onboarding?</span>
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-xl">
              It takes approximately 3 minutes to verify your credentials and upload your academic certificates.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Launch E-Onboarding Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

      {/* ── 5. ACADEMIC PROGRAMS & CURRICULUM ARCHITECTURE ────────────────────── */}
      <section id="programs" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Degrees & Syllabi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Academic Curricula & Programs
            </h2>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Designed following ACM/IEEE computing curricula guidelines and BAETE accreditation benchmarks under the 4-tier educational framework.
            </p>
          </div>

          {/* Program Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setSelectedProgramTab("undergrad")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedProgramTab === "undergrad"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Undergraduate (B.Sc.)
            </button>
            <button
              onClick={() => setSelectedProgramTab("postgrad")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedProgramTab === "postgrad"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Graduate (M.Sc. & MIT)
            </button>
            <button
              onClick={() => setSelectedProgramTab("diploma")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedProgramTab === "diploma"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              Postgrad Diploma (PGDIT)
            </button>
          </div>
        </div>

        {/* Dynamic Degree Cards */}
        {selectedProgramTab === "undergrad" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Core B.Sc. (Engg.) Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  4-Year Full Time Engineering
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Total Credits: 148.5 | 8 Semesters
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Bachelor of Science in Computer Science & Engineering (B.Sc. Engg.)
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Our flagship undergraduate degree program blends solid mathematical fundamentals with practical software engineering, operating systems, compiler construction, and artificial intelligence.
                </p>
              </div>

              {/* Curriculum Tier Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-emerald-700" />
                    <span>Years 1 & 2: Foundations</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Discrete Math, Structured & OOP, Data Structures, Algorithms, Computer Architecture, Digital Logic.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-emerald-700" />
                    <span>Years 3 & 4: Specialization</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Database Systems, Machine Learning, Computer Networks, Operating Systems, Capstone Project & Viva.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Outcome-Based Education (OBE) Accredited</span>
                <Link
                  href="/onboarding"
                  className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>Spring 2026 Batch Enrollment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Program Highlights Sidebar */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Program Distinctions
                </h4>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1:1 Computing Access:</strong> Dedicated high-spec machines in 6 hardware and software labs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Competitive Programming:</strong> Weekly long & short contests coached by ICPC veterans.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Industry Internship:</strong> Mandatory 3-month placement in tier-1 tech firms.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 block">Classroom Architecture:</span>
                <p className="text-[11px] text-slate-500">
                  Structured in 4 levels: <em>Program &rarr; Batch &rarr; Semester &rarr; Course</em> for clear tracking.
                </p>
              </div>
            </div>

          </div>
        )}

        {selectedProgramTab === "postgrad" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* M.Sc. in Computer Science */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                1.5 Years (3 Semesters) • 36 Credits
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Master of Science in Computer Science (M.Sc.)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Advanced thesis-driven graduate program with emphasis on deep neural networks, computational genomics, formal methods, and high-performance distributed systems.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Eligibility: B.Sc. in CSE / IT</span>
                <span className="text-teal-700 font-bold flex items-center gap-1">
                  Research Track <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Master in Information Technology */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
              <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
                2 Years (4 Semesters) • 48 Credits
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Master in Information Technology (MIT - Executive)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed for working ICT professionals seeking leadership in enterprise cloud architecture, cybersecurity management, software project governance, and big data engineering.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Weekend & Evening Classes</span>
                <span className="text-indigo-700 font-bold flex items-center gap-1">
                  Executive Track <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        )}

        {selectedProgramTab === "diploma" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 max-w-3xl">
            <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
              1 Year (3 Trimesters) • 36 Credits
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Post Graduate Diploma in Information Technology (PGDIT)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A comprehensive industry-retooling program for graduates of sciences, engineering, and business disciplines wishing to pivot into full-stack software development, database administration, and cloud infrastructure.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Class timings: Friday & Saturday</span>
              <span className="text-purple-700 font-bold flex items-center gap-1">
                Admissions Twice Yearly <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

      </section>

      {/* ── 6. SPECIALIZED RESEARCH LABORATORIES ───────────────────────────────── */}
      <section id="research" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            Innovation Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Specialized Research Laboratories
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our faculty and students conduct high-impact research supported by national ICT Division grants, international university consortia, and corporate partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Lab 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Bangla NLP & Machine Intelligence Lab
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pioneering large language models for low-resource Bengali dialects, automated optical character recognition (OCR), neural speech synthesis, and sentiment analytics.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>8 Active Fellows</span>
              <span className="text-emerald-700 font-bold">Room 408</span>
            </div>
          </div>

          {/* Lab 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Cyber Security & Cryptographic Systems Lab
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Conducting rigorous investigation into Zero-Trust network infrastructure, lightweight cryptographic primitives, post-quantum security, and SCADA protection.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>IEEE Standards Partner</span>
              <span className="text-teal-700 font-bold">Room 412</span>
            </div>
          </div>

          {/* Lab 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Bio-Genomics & Computational Biology Lab
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applying combinatorial algorithms and deep learning to genomic sequence alignment, protein secondary structure prediction, and cancer biomarker classification.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Collaborative Grants</span>
              <span className="text-indigo-700 font-bold">Room 416</span>
            </div>
          </div>

          {/* Lab 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Robotics, IoT & Cyber-Physical Systems Lab
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hardware testbed equipped with robotic arms, FPGA boards, aerial quadcopters, and low-power sensor arrays for smart agriculture and disaster monitoring.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Embedded Hardware</span>
              <span className="text-amber-700 font-bold">Room 302</span>
            </div>
          </div>

          {/* Lab 5 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                High-Performance GPU Computing Cluster
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Centralized multi-node compute cluster with NVIDIA A100 GPUs providing high-throughput acceleration for model training, computer vision, and scientific simulation.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Fibre Optic Backbone</span>
              <span className="text-slate-800 font-bold">Server Rm A</span>
            </div>
          </div>

          {/* Lab 6 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Competitive Programming & Algorithm Cell
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Home of Jahangirnagar University's ICPC World Finalists. Daily algorithmic problem-solving sessions, team contests, and training for national olympiads.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>24/7 Contest Lab</span>
              <span className="text-emerald-700 font-bold">Room 404</span>
            </div>
          </div>

        </div>

      </section>

      {/* ── 7. OFFICIAL NOTICES & CIRCULARS BOARD ─────────────────────────────── */}
      <section id="notices" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Official Gazette
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Departmental Notices & Circulars
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSelectedNoticeTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedNoticeTab === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              All Notices
            </button>
            <button
              onClick={() => setSelectedNoticeTab("admission")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedNoticeTab === "admission" ? "bg-white text-emerald-800 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Admissions
            </button>
            <button
              onClick={() => setSelectedNoticeTab("academic")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedNoticeTab === "academic" ? "bg-white text-blue-800 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Academics
            </button>
            <button
              onClick={() => setSelectedNoticeTab("research")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedNoticeTab === "research" ? "bg-white text-purple-800 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Research
            </button>
          </div>
        </div>

        {/* Notices Stack */}
        <div className="space-y-3">
          {filteredNotices.map((ntc) => (
            <div
              key={ntc.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                ntc.isUrgent
                  ? "border-emerald-300 ring-1 ring-emerald-500/20 bg-gradient-to-r from-emerald-50/40 via-white to-white"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ntc.categoryColor}`}>
                    {ntc.categoryLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Ref: {ntc.ref}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {ntc.date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors">
                  <Link href={ntc.link}>{ntc.title}</Link>
                </h3>

                <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                  {ntc.desc}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {ntc.link.startsWith("http") ? (
                  <a
                    href={ntc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>LMS Login</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    href={ntc.link}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── 8. CAMPUS CONTACT & LOCATION INFORMATION ────────────────────────── */}
      <section id="contact" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl border border-slate-200/90 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <strong className="text-slate-900 font-bold block text-sm">Campus Address</strong>
            <p className="text-slate-600 leading-relaxed">
              New Science Building (4th & 5th Floor), Department of CSE,<br />
              Jahangirnagar University, Savar, Dhaka-1342, Bangladesh.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <strong className="text-slate-900 font-bold block text-sm">Administrative Emails</strong>
            <p className="text-slate-600 leading-relaxed">
              Chairman Office: <strong>chairman.cse@juniv.edu</strong><br />
              Admissions Help: <strong>admission.cse@juniv.edu</strong>
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
            <strong className="text-slate-900 font-bold block text-sm">Telephone / PABX</strong>
            <p className="text-slate-600 leading-relaxed">
              PABX: +880-2-7791045-51 (Ext. 1420, 1422)<br />
              Admission Helpline: +880 1711-223344 (9 AM - 5 PM)
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
