"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  ShieldCheck,
  Upload,
  ArrowLeft,
  FileText,
  Camera,
  PenTool,
  GraduationCap,
  Award,
  CreditCard,
  Receipt,
  FileCheck,
} from "lucide-react";
import { DocumentUploadState } from "./types";

interface StepDocumentsProps {
  documents: DocumentUploadState[];
  onFileUpload: (docId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviewModal: (title: string, url: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  declarationAccepted: boolean;
  setDeclarationAccepted: (val: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function StepDocuments({
  documents,
  onFileUpload,
  onPreviewModal,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  declarationAccepted,
  setDeclarationAccepted,
  loading,
  onSubmit,
  onBack,
}: StepDocumentsProps) {
  const uploadedCount = documents.filter((d) => d.uploaded).length;
  const allUploaded = uploadedCount === documents.length;

  const getDocIcon = (id: string) => {
    switch (id) {
      case "photo":
        return Camera;
      case "signature":
        return PenTool;
      case "ssc":
        return GraduationCap;
      case "hsc":
        return Award;
      case "nid":
        return CreditCard;
      case "challan":
        return Receipt;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-7">
      
      {/* Header & Quick Controls */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            <span>3. Statutory Document Verification & Password Setup</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload authenticated copies of required academic records and set your student LMS password.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              allUploaded
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{uploadedCount} of {documents.length} Uploaded</span>
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        
        {/* DOCUMENT CARDS GRID (Responsive 2 or 3 Columns for Clean Organization) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, idx) => {
            const Icon = getDocIcon(doc.id);

            return (
              <div
                key={doc.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                  doc.uploaded
                    ? "bg-emerald-50/20 border-emerald-300/80 shadow-2xs"
                    : "bg-slate-50/60 border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* Card Top: Icon & Title */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        doc.uploaded
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200/70 text-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.uploaded
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {doc.uploaded ? "✓ Uploaded" : "Required"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {idx + 1}. {doc.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>

                {/* Uploaded File Pill or Preview */}
                {doc.uploaded ? (
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800 text-[11px] truncate">
                          {doc.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          ({doc.fileSize})
                        </span>
                      </div>

                      {doc.previewUrl && (
                        <button
                          type="button"
                          onClick={() => onPreviewModal(doc.title, doc.previewUrl!)}
                          className="text-slate-500 hover:text-slate-900 p-1 rounded cursor-pointer"
                          title="Preview document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <label className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs">
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>Replace Document</span>
                      <input
                        type="file"
                        accept={doc.type}
                        className="hidden"
                        onChange={(e) => onFileUpload(doc.id, e)}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Choose File</span>
                    <span className="text-[10px] text-slate-400">PDF, JPG or PNG (Max 5MB)</span>
                    <input
                      type="file"
                      accept={doc.type}
                      className="hidden"
                      onChange={(e) => onFileUpload(doc.id, e)}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>

        {/* ACCOUNT PASSWORD CREATION CARD */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Create Your Student Portal Password
                </h3>
                <p className="text-[11px] text-slate-500">
                  This password will be permanently assigned to your student LMS login upon administrative approval
                </p>
              </div>
            </div>

            <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              LMS Portal Credential
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                New Portal Password (Min 6 characters) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 focus:border-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 transition-all pr-9 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Confirm Portal Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none transition-all font-medium ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                    : "border-slate-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10"
                }`}
              />
            </div>
          </div>
        </div>

        {/* STATUTORY LEGAL DECLARATION */}
        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
            <input
              type="checkbox"
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-emerald-700 rounded border-slate-300 focus:ring-emerald-700 cursor-pointer"
            />
            <span>
              <strong>Statutory Candidate Declaration:</strong> I solemnly declare that all personal particulars, academic records, and scanned documents provided above are genuine, authentic, and complete. I understand that submitting forged certificates will lead to immediate cancellation of admission and statutory legal proceedings as per Jahangirnagar University regulations.
            </span>
          </label>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bio-Data</span>
          </button>

          <button
            type="submit"
            disabled={loading || !declarationAccepted || !allUploaded}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting Registration...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Finalize & Submit Registration</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
