"use client";

import { X } from "lucide-react";

interface DocumentPreviewModalProps {
  file: { title: string; url: string } | null;
  onClose: () => void;
}

export function DocumentPreviewModal({ file, onClose }: DocumentPreviewModalProps) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 truncate">
            {file.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-4">
          <img
            src={file.url}
            alt="Document Preview"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

