"use client";

import { useState } from "react";
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const mockCredentials = {
  Admin: { email: "admin@classroom.edu", password: "admin123", path: "/dashboard/admin" },
  Teacher: { email: "dr.rahman@classroom.edu", password: "teacher123", path: "/dashboard/teacher" },
  Student: { email: "tahmid@classroom.edu", password: "student123", path: "/dashboard/student" }
};

export default function LoginForm() {
  const [role, setRole] = useState<"Admin" | "Teacher" | "Student">("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Check all roles to see if credentials match
    const matchedRole = Object.entries(mockCredentials).find(
      ([_, creds]) => creds.email === email && creds.password === password
    );

    if (matchedRole) {
      router.push(matchedRole[1].path);
    } else {
      setError("Invalid email or password.");
    }
  };

  const autofill = (selectedRole: "Admin" | "Teacher" | "Student") => {
    setRole(selectedRole);
    setEmail(mockCredentials[selectedRole].email);
    setPassword(mockCredentials[selectedRole].password);
    setError("");
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-brand-dark p-3 rounded-xl mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-sm font-medium text-foreground">Welcome back</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Sign in to your Classroom Management workspace
        </p>
      </div>

      <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {/* Role Tabs */}
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

        <p className="text-[11px] text-center text-slate-400 mb-4 uppercase tracking-wider">
          {role === "Admin" ? "Full Institution Control" : role === "Teacher" ? "Classroom Management" : "Student Portal"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-[13px]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-700">Password</label>
              <a href="#" className="text-[11px] text-slate-400 hover:text-primary-600 transition-colors">
                Forgot?
              </a>
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
            className="w-full bg-brand-dark hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-[13px] transition-all flex items-center justify-center mt-6"
          >
            Sign in as {role}
          </button>
        </form>
      </div>
      
      <p className="text-[11px] text-slate-400 mt-8 text-center px-4">
        Frontend demo mode. Click on the role tabs above to auto-fill the mock credentials.
      </p>
    </div>
  );
}
