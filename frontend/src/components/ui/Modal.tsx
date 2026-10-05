import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = "max-w-md"
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[88vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl shrink-0">
          <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
