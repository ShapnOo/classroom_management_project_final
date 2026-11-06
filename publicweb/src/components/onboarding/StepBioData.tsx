"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Users, UserCheck, MapPin, Copy, Calendar, HeartPulse, CreditCard, Phone } from "lucide-react";
import { StudentBioData } from "./types";

interface StepBioDataProps {
  bioData: StudentBioData;
  setBioData: React.Dispatch<React.SetStateAction<StudentBioData>>;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function StepBioData({
  bioData,
  setBioData,
  onSubmit,
  onBack,
}: StepBioDataProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyPresentAddress = () => {
    if (bioData.presentAddress) {
      setBioData((prev) => ({
        ...prev,
        permanentAddress: prev.presentAddress,
      }));
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-7">
      
      {/* Step Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <span>2. Candidate Statutory Bio-Data</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Please enter your accurate personal and parental particulars as registered in your official academic certificates.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* CARD 1: PARENTAL INFORMATION */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Parental & Family Information
              </h3>
              <p className="text-[11px] text-slate-500">Legal names of parents as listed on your SSC certificate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Father&apos;s Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Md. Mustafizur Rahman"
                value={bioData.fatherName}
                onChange={(e) => setBioData({ ...bioData, fatherName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Father&apos;s Occupation
              </label>
              <input
                type="text"
                placeholder="e.g. Government Official / Engineer"
                value={bioData.fatherOccupation}
                onChange={(e) => setBioData({ ...bioData, fatherOccupation: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mother&apos;s Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Razia Sultana"
                value={bioData.motherName}
                onChange={(e) => setBioData({ ...bioData, motherName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mother&apos;s Occupation
              </label>
              <input
                type="text"
                placeholder="e.g. Educator / Banker / Homemaker"
                value={bioData.motherOccupation}
                onChange={(e) => setBioData({ ...bioData, motherOccupation: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: PERSONAL IDENTITY & STATUTORY IDENTIFIERS */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Identity & Emergency Records
              </h3>
              <p className="text-[11px] text-slate-500">Official statutory identifiers and healthcare records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={bioData.dob}
                onChange={(e) => setBioData({ ...bioData, dob: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <select
                value={bioData.bloodGroup}
                onChange={(e) => setBioData({ ...bioData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-bold text-emerald-800"
              >
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={bioData.gender}
                onChange={(e) => setBioData({ ...bioData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-semibold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                National ID (NID) or 17-Digit Digital Birth Registration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 19982691234567890"
                value={bioData.nidBirthCert}
                onChange={(e) => setBioData({ ...bioData, nidBirthCert: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Emergency Guardian Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 01819223344"
                value={bioData.emergencyContact}
                onChange={(e) => setBioData({ ...bioData, emergencyContact: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all"
              />
            </div>

          </div>
        </div>

        {/* CARD 3: RESIDENTIAL ADDRESSES */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Residential Addresses
                </h3>
                <p className="text-[11px] text-slate-500">Present accommodation and permanent hometown address</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyPresentAddress}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Copy className="w-3 h-3 text-slate-500" />
              <span>{copiedAddress ? "Copied!" : "Same as Present Address"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Present Residential Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="House, Road, Area/Village, Police Station, District & Postcode"
                value={bioData.presentAddress}
                onChange={(e) => setBioData({ ...bioData, presentAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Permanent Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Village/Town, Post Office, Upazila/Thana, District & Postcode"
                value={bioData.permanentAddress}
                onChange={(e) => setBioData({ ...bioData, permanentAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed to Document Submission</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </form>
    </div>
  );
}
