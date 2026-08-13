"use client";

import { ListTodo, ArrowRight, FileCheck, Clock } from "lucide-react";
import Link from "next/link";
import { myAssignmentsByClassroom } from "@/lib/mockData";

export default function TeacherAssignmentsList() {
  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAssignmentsByClassroom.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
            <div className={`h-1 w-full ${course.color}`} />
            <div className="p-5 flex-1 flex flex-col">
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                  {course.courseCode}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                  {course.session}
                </span>
              </div>
              
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2">
                  {course.courseTitle}
                </h3>
                <ListTodo className="w-8 h-8 text-slate-300 shrink-0 group-hover:text-brand-dark/20 transition-colors" />
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <FileCheck className="w-3.5 h-3.5" />
                  {course.activeAssignments} Active
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${course.pendingSubmissions > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {course.pendingSubmissions} to Grade
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Link 
                href={`/dashboard/teacher/assignments/${course.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-medium hover:bg-slate-100 hover:text-brand-dark transition-colors shadow-sm group-hover:border-brand-dark/30"
              >
                Manage Assignments <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
