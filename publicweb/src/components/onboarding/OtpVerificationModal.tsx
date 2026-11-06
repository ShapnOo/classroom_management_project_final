"use client";

import { X, KeyRound, ShieldCheck, RefreshCw, ArrowRight } from "lucide-react";
import { StudentProfileData } from "./types";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: StudentProfileData;
  maskedPhone: string;
  maskedEmail: string;
  otp: string;
  setOtp: (val: string) => void;
  demoOtpHint: string;
  loading: boolean;
  onVerify: (e: React.FormEvent) => void;
  errorMsg?: string;
}

export function OtpVerificationModal({
  isOpen,
  onClose,
  studentData,
  maskedPhone,
  maskedEmail,
  otp,
  setOtp,
  demoOtpHint,
  loading,
  onVerify,
  errorMsg,
}: OtpVerificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Two-Factor Security Verification
              </h3>
              <p className="text-[11px] text-slate-500">
                Identity Authentication • Session 2026
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Context Pill */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Candidate:</span>
            <strong className="text-slate-900 font-bold">{studentData.name}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Student Roll / ID:</span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              {studentData.rollNo}
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-500 font-medium">Dispatched To:</span>
            <span className="font-mono text-slate-700 text-[11px]">
              {maskedPhone} • {maskedEmail}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onVerify} className="space-y-4">
          <div className="text-center space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Enter 6-Digit One-Time Password (OTP)
            </label>
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center text-2xl tracking-[0.4em] font-mono font-black px-4 py-3 bg-slate-50 border-2 border-slate-300 focus:border-emerald-700 focus:bg-white rounded-2xl text-slate-900 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Quick Demo Helper */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
            <span>Evaluation Code: <strong className="font-mono text-emerald-800">123456</strong></span>
            <button
              type="button"
              onClick={() => setOtp(demoOtpHint || "123456")}
              className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Fill 123456
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || otp.trim().length < 6}
              className="flex-1 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Confirm & Proceed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

