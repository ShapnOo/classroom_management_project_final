"use client";

import { 
  FolderOpen,
  ArrowRight,
  Files
} from "lucide-react";
import Link from "next/link";

import { useStore } from "@/lib/store";
import { useState } from "react";

export default function TeacherMaterialsList() {
  const { getMyClassroomViews } = useStore();
  const myClassrooms = getMyClassroomViews();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  if (!selectedBatchId) {
    const uniqueBatches = Array.from(new Map(myClassrooms.map(c => [c.batch.id, c.batch])).values());
    return (
      <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-[13px] font-medium text-slate-900">Select Batch</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Select a batch to manage its materials.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueBatches.map(b => {
            const batchClasses = myClassrooms.filter(c => c.batch.id === b.id);
            return (
              <button key={b.id} onClick={() => setSelectedBatchId(b.id)} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group block text-left">
                <div className="h-1 w-full rounded-full bg-slate-200 group-hover:bg-brand-dark/40 transition-colors mb-4" />
                <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors">{b.name}</h3>
                <p className="text-[10px] text-slate-500 mt-1">{batchClasses.length} courses</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const batchClasses = myClassrooms.filter(c => c.batch.id === selectedBatchId);
  const batchInfo = batchClasses[0]?.batch;

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="pb-4 border-b border-slate-200 flex items-center gap-3">
        <button onClick={() => setSelectedBatchId(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
        <div>
          <h2 className="text-[13px] font-medium text-slate-900">Courses in {batchInfo?.name}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Select a course to view its materials.</p>
        </div>
      </div>

      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batchClasses.map(({ classroom: cls, course, batch, colors }) => (
          <div key={cls.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
            <div className="p-5 flex-1 flex flex-col">
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>
                  {course.code}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                  {batch.name}
                </span>
              </div>
              
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <FolderOpen className="w-8 h-8 text-slate-300 shrink-0 group-hover:text-brand-dark/20 transition-colors" />
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Files className="w-3.5 h-3.5" />
                  {5} Files {/* Hardcoded mock count for now */}
                </div>
                <span>12 MB</span> {/* Hardcoded mock size for now */}
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Link 
                href={`/dashboard/teacher/materials/${cls.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-medium hover:bg-slate-100 hover:text-brand-dark transition-colors shadow-sm group-hover:border-brand-dark/30"
              >
                View Materials <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
