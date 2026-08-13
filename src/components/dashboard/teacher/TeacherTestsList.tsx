"use client";

import { FileText, ArrowRight, ClipboardList, Clock } from "lucide-react";
import Link from "next/link";
import { myTestsByClassroom } from "@/lib/mockData";

export default function TeacherTestsList() {
  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myTestsByClassroom.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
            <div className={`h-1 w-full ${course.color}`} />
            <div className="p-5 flex-1 flex flex-col">
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                  {course.courseCode}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-500">
                  {course.session}
                </span>
              </div>
              
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-1 mb-4">
                {course.courseTitle}
              </h3>

              <div className="flex items-center gap-4 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <ClipboardList className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-medium text-emerald-600">{course.activeTests} Active Tests</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-medium text-slate-500">{course.completedTests} Completed</span>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between group-hover:bg-brand-dark/5 transition-colors">
              <span className="text-xs font-medium text-slate-600 group-hover:text-brand-dark transition-colors">
                Manage Tests
              </span>
              <Link 
                href={`/dashboard/teacher/tests/${course.id}`}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-brand-dark group-hover:bg-brand-dark/10 shadow-sm transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
