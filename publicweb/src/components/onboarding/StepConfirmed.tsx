"use client";

import { Clock, ExternalLink, Printer } from "lucide-react";
import { ConfirmedRegistrationData, StudentBioData, StudentProfileData } from "./types";

interface StepConfirmedProps {
  studentData: StudentProfileData;
  email: string;
  bioData: StudentBioData;
  confirmedData: ConfirmedRegistrationData | null;
}

export function StepConfirmed({
  studentData,
  email,
  bioData,
  confirmedData,
}: StepConfirmedProps) {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">
          Documents & Password Submitted Successfully
        </h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Your statutory credentials, uploaded documents, and student password have been recorded in the central admission queue for administrative review and approval.
        </p>
      </div>

      {/* Account Credentials Summary Card */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Your Student LMS Credentials
          </span>
          <span className="font-semibold text-slate-800">
            Email: {studentData.email || email}
          </span>
          <span className="text-slate-400 mx-1.5">•</span>
          <span className="font-semibold text-slate-800">Password: •••••••• (Created)</span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Pending Administrative Approval</span>
        </span>
      </div>

      {/* Formal Registration Slip Card */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs relative print:border-none">
        {/* Slip Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 shrink-0">
              <img src="/JU_logo.png" alt="JU Crest" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                JAHANGIRNAGAR UNIVERSITY
              </h3>
              <p className="text-xs font-bold text-slate-700">
                Central Academic Admission & Verification Directorate
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Candidate E-Registration & Document Submission Receipt
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-slate-500 block">
              REF: {confirmedData?.trackingNumber || "JU-ADM-849201"}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Candidate Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
            <strong className="text-slate-900 font-bold">{studentData.name}</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Roll / ID</span>
            <span className="font-mono font-black text-emerald-800">{studentData.rollNo}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Session</span>
            <strong className="text-slate-900">2026 Admissions</strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Father&apos;s Name</span>
            <span className="text-slate-800">{bioData.fatherName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Mother&apos;s Name</span>
            <span className="text-slate-800">{bioData.motherName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
            <span className="font-bold text-red-700">{bioData.bloodGroup}</span>
          </div>
        </div>

        {/* Verification Seal */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Statutory Status: DOCUMENTS SUBMITTED • AWAITING ADMIN CLEARANCE</span>
          </div>

          <div className="text-right text-[11px] text-slate-500 font-mono">
            Submitted via Central Portal • Savar, Dhaka
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print Official Slip</span>
        </button>

        <a
          href="http://localhost:3000/auth/login"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>Access Student LMS Portal (Port 3000)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

