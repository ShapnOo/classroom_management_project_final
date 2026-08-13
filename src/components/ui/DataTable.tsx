import React from "react";
import { Search } from "lucide-react"; // Default icon for empty state

interface DataTableProps {
  columns: string[];
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyStateIcon?: React.ElementType;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export function DataTable({ 
  columns, 
  children, 
  isEmpty = false, 
  emptyStateIcon: EmptyIcon = Search,
  emptyStateTitle = "No data found",
  emptyStateDescription = "We couldn't find any results matching your criteria."
}: DataTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3 ${idx === columns.length - 1 && col.toLowerCase() === 'actions' ? 'text-right' : ''}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <EmptyIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[11px] font-medium text-slate-900 mb-0.5">{emptyStateTitle}</p>
                    <p className="text-[10px]">{emptyStateDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
