"use client";

import { CheckCircle2, AlertTriangle, Info, XCircle, X, HelpCircle } from "lucide-react";
import React from "react";

export interface ModalDialogProps {
  isOpen: boolean;
  type?: "success" | "info" | "warning" | "danger" | "confirm";
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
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
  children,
  maxWidth = "md",
}: ModalDialogProps) {
  if (!isOpen) return null;

  const isConfirm = type === "confirm" || (!!onCancel && !children);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-7 h-7 text-emerald-600" />;
      case "warning":
        return <AlertTriangle className="w-7 h-7 text-amber-600" />;
      case "danger":
        return <XCircle className="w-7 h-7 text-red-600" />;
      case "confirm":
        return <HelpCircle className="w-7 h-7 text-emerald-600" />;
      default:
        return <Info className="w-7 h-7 text-indigo-600" />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50/80 border-b border-emerald-100/60";
      case "warning":
        return "bg-amber-50/80 border-b border-amber-100/60";
      case "danger":
        return "bg-red-50/80 border-b border-red-100/60";
      case "confirm":
        return "bg-emerald-50/80 border-b border-emerald-100/60";
      default:
        return "bg-slate-50/80 border-b border-slate-100";
    }
  };

  const getConfirmBtnColor = () => {
    switch (type) {
      case "success":
      case "confirm":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20";
      default:
        return "bg-slate-900 hover:bg-slate-800 text-white shadow-md";
    }
  };

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "sm": return "max-w-sm";
      case "lg": return "max-w-lg";
      case "xl": return "max-w-xl";
      case "2xl": return "max-w-2xl";
      default: return "max-w-md";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-[26px] border border-slate-100 shadow-2xl ${getMaxWidthClass()} w-full overflow-hidden text-xs animate-in zoom-in-95 duration-200`}>
        {/* Header matching user uploaded screenshot design */}
        <div className={`p-5 sm:p-6 flex items-start gap-4 ${getHeaderBg()}`}>
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100/80 shadow-xs flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h3>
            {message && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>}
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-black/5 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Custom children form content if provided */}
        {children && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {children}
          </div>
        )}

        {/* Modal Footer (for alert / confirmation dialogs) */}
        {!children && (
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-2.5">
            {isConfirm && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 transition-colors text-xs"
              >
                {cancelLabel}
              </button>
            )}
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all text-xs ${getConfirmBtnColor()}`}
              >
                {confirmLabel || (isConfirm ? "Confirm" : "Got it")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
