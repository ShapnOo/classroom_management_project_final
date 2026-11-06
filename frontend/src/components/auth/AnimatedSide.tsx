"use client";

import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Layers, 
  Clock, 
  Award,
  Presentation
} from "lucide-react";

export default function AnimatedSide() {
  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-[#07131e] via-[#092224] to-[#0a1826] overflow-hidden flex flex-col justify-between p-10 xl:p-14 text-white select-none">
      
      {/* ── Ambient Background Glow Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Grid */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #34d399 1px, transparent 0)`,
            backgroundSize: "32px 32px"
          }} 
        />

        {/* Floating Aurora Gradient 1 */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-[120px]"
        />

        {/* Floating Aurora Gradient 2 */}
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-teal-500/20 blur-[130px]"
        />

        {/* Floating Aurora Gradient 3 (Center accent) */}
        <motion.div
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-sky-500/15 blur-[100px]"
        />
      </div>

      {/* ── Top Header / Live System Pill ── */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono tracking-wider font-semibold text-emerald-300 uppercase">
            Campus Network Online
          </span>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-[11px] text-slate-300 font-mono">Session 2026</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-white/5 px-3 py-1 rounded-xl border border-white/5 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Statutory 2FA Protected</span>
        </div>
      </motion.div>

      {/* ── Central Showcase & Floating Cards ── */}
      <div className="relative z-10 my-auto py-8 space-y-8 max-w-xl">
        
        {/* Main Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unified Higher Education Management</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
            Next-Gen Academic &amp; <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              Classroom Governance
            </span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
            Empowering Jahangirnagar University faculty, administration, and students with real-time lecture slide telemetry, attendance tracking, and verified statutory onboarding.
          </p>
        </motion.div>

        {/* ── LIVE INTERACTIVE WORKSPACE CARD ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-3xl bg-white/[0.06] border border-white/15 p-5 xl:p-6 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 space-y-4 overflow-hidden group hover:border-emerald-500/40 transition-all duration-300"
        >
          {/* Subtle Top Gradient Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />

          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Structured Programming (CSE-101)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                    LIVE SESSION
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Prof. Dr. Shamim Al Mamun • Chairman, Dept. of CSE
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
              Room 402
            </span>
          </div>

          {/* Card Body: Real-time Attendance & Slide Sync Preview */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Live Attendance
                </span>
                <span className="font-mono font-bold text-white">95%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 1.2, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>19 Present</span>
                <span>Batch 52 (SP26-A)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  Slide Telemetry
                </span>
                <span className="font-mono font-bold text-teal-300">Slide 14/24</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "58%" }}
                  transition={{ duration: 1.2, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-teal-400 to-sky-400 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>In-App Presenter</span>
                <span className="text-teal-400 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── FLOATING STAT PILLS (Smooth Animated Drifts) ── */}
        <div className="grid grid-cols-3 gap-3">
          
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight font-mono">12</span>
              <span className="text-[10px] text-slate-400 block leading-tight">Programs</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight font-mono">5</span>
              <span className="text-[10px] text-slate-400 block leading-tight">Active Batches</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block leading-tight font-mono">100</span>
              <span className="text-[10px] text-slate-400 block leading-tight">Students</span>
            </div>
          </motion.div>

        </div>

      </div>

      {/* ── Bottom Institutional Brand Bar ── */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-medium"
      >
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Jahangirnagar University • Savar, Dhaka-1342</span>
        </span>
        <span className="text-slate-500 font-mono text-[10px]">
          v2.4 Production Engine
        </span>
      </motion.div>

    </div>
  );
}
