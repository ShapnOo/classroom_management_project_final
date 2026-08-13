import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  totalCount?: number;
  totalLabel?: string;
}

export function SearchInput({ totalCount, totalLabel, className, ...props }: SearchInputProps) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center w-full">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input 
          type="text" 
          className={`w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all ${className || ""}`}
          {...props}
        />
      </div>
      {totalCount !== undefined && (
        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium whitespace-nowrap">
          <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-[10px]">
            {totalCount} {totalLabel || "Total Items"}
          </span>
        </div>
      )}
    </div>
  );
}
