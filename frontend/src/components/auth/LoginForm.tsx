"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Sparkles,
  CheckCircle2,
  Building2,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api, authStorage } from "@/lib/api";

const demoCredentials = {
  Admin: { email: "admin@edu", password: "admin123", roleLabel: "Super Administrator", desc: "Institutional Administration & Central Verification" },
  Teacher: { email: "sam@juniv.edu", password: "teacher123", roleLabel: "Faculty Professor", desc: "Lecture Slides, Course Schedules & Grading" },
  Student: { email: "fa25a1@edu", password: "student123", roleLabel: "Enrolled Student", desc: "Academic Transcripts, LMS & Course Materials" },
};

const PUBLIC_WEB_URL = process.env.NEXT_PUBLIC_PUBLICWEB_URL || "http://localhost:3001";

export default function LoginForm() {
  const [role, setRole] = useState<"Admin" | "Teacher" | "Student">("Admin");
  const [email, setEmail] = useState(demoCredentials.Admin.email);
  const [password, setPassword] = useState(demoCredentials.Admin.password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const user = authStorage.getUser();
    const token = authStorage.getToken();
    if (token && user && user.role) {
      const userRole = user.role.toLowerCase();
      const targetPath = userRole === "admin" 
        ? "/dashboard/admin" 
        : userRole === "teacher" 
          ? "/dashboard/teacher" 
          : "/dashboard/student";
      router.replace(targetPath);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.login({ email: email.trim(), password });
      
      const userRole = result.user?.role?.toLowerCase() || role.toLowerCase();
      const targetPath = userRole === "admin" 
        ? "/dashboard/admin" 
        : userRole === "teacher" 
          ? "/dashboard/teacher" 
          : "/dashboard/student";

      window.location.href = targetPath;
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (selectedRole: "Admin" | "Teacher" | "Student") => {
    setRole(selectedRole);
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
    setError("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-6 sm:p-8"
    >
      {/* ── Brand Header ── */}
      <div className="flex flex-col items-center mb-6 text-center">
        <motion.a 
          href={PUBLIC_WEB_URL} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-16 h-16 rounded-2xl p-1 mb-3 bg-white shadow-md border border-slate-200/80 flex items-center justify-center transition-all group" 
          title="Return to JU Central Public Portal"
        >
          <img src="/JU_logo.png" alt="Jahangirnagar University" className="w-12 h-12 object-contain" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </motion.a>

        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3 py-1 rounded-full mb-2 flex items-center gap-1.5 shadow-2xs">
          <Building2 className="w-3 h-3 text-emerald-700" />
          <span>Jahangirnagar University • Dept. of CSE</span>
        </span>

        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          Academic &amp; Classroom Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Secure Single Sign-On for Authorized University Accounts
        </p>
      </div>

      {/* ── Main Authentication Box ── */}
      <div className="w-full bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-5">
        
        {/* Animated Role Tabs */}
        <div className="space-y-2">
          <div className="flex p-1 bg-slate-100 rounded-2xl relative">
            {(["Admin", "Teacher", "Student"] as const).map((r) => {
              const isSelected = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectRole(r)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
                    isSelected ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeRoleIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/80"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20 flex items-center justify-center gap-1.5">
                    {r === "Admin" && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                    {r === "Teacher" && <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
                    {r === "Student" && <UserCheck className="w-3.5 h-3.5 text-teal-600" />}
                    <span>{r}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Role Context Pill */}
          <div className="text-center px-1">
            <span className="text-[11px] font-semibold text-slate-500">
              {demoCredentials[role].desc}
            </span>
          </div>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-50/90 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
              <p className="leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Official Institutional Email</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">e.g. {demoCredentials[role].email}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Account Password</label>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-semibold">
                Demo: {demoCredentials[role].password}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-emerald-900 hover:to-slate-900 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sign in as {demoCredentials[role].roleLabel}</span>
              </>
            )}
          </motion.button>
        </form>

        {/* ── Candidate Onboarding & Portal Navigation Links ── */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-center">
          <a
            href={`${PUBLIC_WEB_URL}/onboarding`}
            className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
            <span>Newly Admitted Candidate? Complete Onboarding &rarr;</span>
          </a>

          <div>
            <a
              href={PUBLIC_WEB_URL}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Jahangirnagar University Public Web Portal</span>
            </a>
          </div>
        </div>

      </div>
      
      {/* Footer Attribution */}
      <p className="text-[11px] text-slate-400 mt-6 text-center leading-relaxed">
        Academic &amp; Classroom Management System • Developed by <strong className="text-slate-700">Tahmid Afsar Shapno</strong> (<a href="mailto:shapno.official@gmail.com" className="text-emerald-700 hover:underline font-medium">shapno.official@gmail.com</a>)
      </p>
    </motion.div>
  );
}
