"use client";

import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export interface ModalDialogProps {
  isOpen: boolean;
  type?: "success" | "info" | "warning" | "danger" | "confirm";
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ModalDialog({
  isOpen,
  type = "info",
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ModalDialogProps) {
  if (!isOpen) return null;

  const isConfirm = type === "confirm" || !!onCancel;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "danger":
        return <XCircle className="w-6 h-6 text-red-600" />;
      case "confirm":
        return <AlertTriangle className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-slate-700" />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-100";
      case "warning":
        return "bg-amber-50 border-amber-100";
      case "danger":
        return "bg-red-50 border-red-100";
      case "confirm":
        return "bg-blue-50 border-blue-100";
      default:
        return "bg-slate-50 border-slate-100";
    }
  };

  const getConfirmBtnColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "confirm":
        return "bg-slate-900 hover:bg-slate-800 text-white";
      default:
        return "bg-slate-900 hover:bg-slate-800 text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-xs animate-in zoom-in-95 duration-200">
        <div className={`p-4 border-b flex items-start gap-3 ${getHeaderBg()}`}>
          <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 leading-snug">{title}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{message}</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-3 bg-white flex items-center justify-end gap-2">
          {isConfirm && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 transition-colors text-[11px]"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all text-[11px] shadow-2xs ${getConfirmBtnColor()}`}
          >
            {confirmLabel || (isConfirm ? "Confirm" : "Got it")}
          </button>
        </div>
      </div>
    </div>
  );
}
