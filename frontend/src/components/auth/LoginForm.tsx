"use client";

import { useState } from "react";
import { GraduationCap, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const demoCredentials = {
  Admin: { email: "admin@edu", password: "admin123", path: "/dashboard/admin" },
  Teacher: { email: "sam@juniv.edu", password: "teacher123", path: "/dashboard/teacher" },
  Student: { email: "sp26a1@edu", password: "student123", path: "/dashboard/student" },
};

export default function LoginForm() {
  const [role, setRole] = useState<"Admin" | "Teacher" | "Student">("Admin");
  const [email, setEmail] = useState(demoCredentials.Admin.email);
  const [password, setPassword] = useState(demoCredentials.Admin.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

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

  const autofill = (selectedRole: "Admin" | "Teacher" | "Student") => {
    setRole(selectedRole);
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
    setError("");
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-brand-dark p-3 rounded-xl mb-4 shadow-sm">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-base font-bold text-foreground text-center">Academic & Classroom Management System</h1>
        <p className="text-[13px] text-slate-500 mt-1 text-center">
          Sign in to your Academic Workspace
        </p>
      </div>

      <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {/* Role Quick Selector Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
          {(["Admin", "Teacher", "Student"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => autofill(r)}
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${
                role === r
                  ? "bg-white text-foreground shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-center text-slate-400 mb-4 uppercase tracking-wider font-semibold">
          {role === "Admin" ? "Full Institutional Administration" : role === "Teacher" ? "Faculty & Classroom Management" : "Student Academic Portal"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-[13px]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@edu"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-700">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-dark hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              `Sign in as ${role}`
            )}
          </button>
        </form>
      </div>
      
      <p className="text-[11px] text-slate-500 mt-8 text-center px-4">
        Academic & Classroom Management System • Developed by <strong className="text-slate-800">Tahmid Afsar Shapno</strong> (<a href="mailto:shapno.official@gmail.com" className="text-blue-600 hover:underline font-medium">shapno.official@gmail.com</a>)
      </p>
    </div>
  );
}
