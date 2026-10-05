"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Optionally render a blank placeholder option to "unselect" */
  allowClear?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  allowClear = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const filtered = options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (allowClear) {
      filtered.unshift({ label: "None / Clear Selection", value: "" });
    }
    return filtered;
  }, [options, searchTerm, allowClear]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] transition-all bg-white
          ${disabled ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "text-slate-700 border-slate-200 hover:border-brand-dark/50 focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20"}
        `}
      >
        <span className={selectedOption ? "text-slate-700 font-medium truncate" : "text-slate-400 truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/30 focus:border-brand-dark transition-all placeholder:text-slate-400 bg-white"
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <button
                  key={`${option.value}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[11px] flex items-center justify-between hover:bg-slate-50 transition-colors
                    ${option.value === value ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-700"}
                  `}
                >
                  <span className="truncate pr-2">{option.label}</span>
                  {option.value === value && option.value !== "" && (
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-[11px] text-slate-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
