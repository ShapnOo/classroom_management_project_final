"use client";

import { ArrowRight, RefreshCw, ShieldCheck, KeyRound } from "lucide-react";

interface StepLookupProps {
  rollNo: string;
  setRollNo: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function StepLookup({
  rollNo,
  setRollNo,
  email,
  setEmail,
  phone,
  setPhone,
  loading,
  onSubmit,
}: StepLookupProps) {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>1. Candidate Identification & Verification</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Authenticate your student roll number and registered contact details to begin statutory onboarding.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Admission Roll / Student ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SP26A001"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-700 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all uppercase"
            />
            <span className="text-[10px] text-slate-400 block">Assigned by Central Admissions</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Registered Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. sp26a1@edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-700 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
            />
            <span className="text-[10px] text-slate-400 block">Used for 2FA token & LMS access</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Mobile Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 01711223344"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-700 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-mono"
            />
            <span className="text-[10px] text-slate-400 block">SMS verification channel</span>
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            A 6-digit security code will be sent to confirm your candidate ownership.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Credentials...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Verify & Send OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
