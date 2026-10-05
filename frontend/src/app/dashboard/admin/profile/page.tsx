"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Key, Building2, Calendar, Radio, CheckCircle } from "lucide-react";
import { authStorage } from "@/lib/api";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminProfilePage() {
  const { settings } = useStore();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const u = authStorage.getUser();
    if (u) setCurrentUser(u);
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10">
      <PageHeader 
        title="Admin Profile" 
        description="View your active account details and administrative privileges."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-brand-dark text-white text-2xl font-bold flex items-center justify-center mb-3 shadow-md">
            {currentUser?.name ? currentUser.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "AD"}
          </div>
          <h2 className="text-sm font-semibold text-slate-900">{currentUser?.name || "System Administrator"}</h2>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
            {currentUser?.role || "admin"}
          </span>
          <p className="text-[11px] text-slate-500 mt-2">{currentUser?.email || "admin@scholaris.edu"}</p>
        </div>

        {/* Account Details & Permissions */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2">Account Overview</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Full Name</p>
                <p className="font-semibold text-slate-900 mt-0.5">{currentUser?.name || "System Administrator"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Email Address</p>
                <p className="font-semibold text-slate-900 mt-0.5">{currentUser?.email || "admin@scholaris.edu"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Role & Access</p>
                <p className="font-semibold text-slate-900 mt-0.5 capitalize">{currentUser?.role || "admin"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Institution</p>
                <p className="font-semibold text-slate-900 mt-0.5">{settings.schoolName || "Jahangirnagar University"}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2 pt-2">System Privileges</h3>
          <div className="space-y-2">
            {[
              "Full CRUD Access over Academic Structure (Departments, Programs, Courses, Batches)",
              "User Management (Teachers, Students, Admin Provisioning)",
              "Classroom Allocation & Schedule Management",
              "System Settings & Branding Configuration",
              "Analytics & Reports Access"
            ].map((perm, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
