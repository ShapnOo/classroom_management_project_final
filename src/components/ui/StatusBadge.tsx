import React from "react";

type StatusType = "Active" | "Upcoming" | "Completed" | string;

interface StatusBadgeProps {
  status: StatusType;
  colorMap?: Record<string, string>;
}

const defaultColorMap: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-slate-100 text-slate-700 border-slate-200",
};

export function StatusBadge({ status, colorMap }: StatusBadgeProps) {
  const mapping = { ...defaultColorMap, ...colorMap };
  const colorClass = mapping[status] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${colorClass}`}>
      {status}
    </span>
  );
}
