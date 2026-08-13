"use client";

import { 
  TrendingUp, 
  ArrowRight,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

// Mock Data for courses
const mockCourses = [
  { 
    id: "cls-1", 
    name: "Database Management Systems", 
    batch: "Spring 2026", 
    code: "CSE-305",
    progress: 68,
    classesCompleted: 18,
    nextTopic: "Continue → BCNF Examples"
  },
  { 
    id: "cls-2", 
    name: "Software Engineering", 
    batch: "Spring 2026", 
    code: "CSE-412",
    progress: 74,
    classesCompleted: 15,
    nextTopic: "Agile Methodologies (Scrum)"
  },
  { 
    id: "cls-3", 
    name: "Computer Networks", 
    batch: "Fall 2025", 
    code: "CSE-301",
    progress: 92,
    classesCompleted: 24,
    nextTopic: "Network Security Overview"
  }
];

export default function TeacherContinuityList() {
  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      


      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
            <div className="p-5 flex-1 flex flex-col">
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                  {course.code}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                  {course.batch}
                </span>
              </div>
              
              <h3 className="text-[13px] font-medium text-slate-900 mb-1 group-hover:text-brand-dark transition-colors line-clamp-1">
                {course.name}
              </h3>
              
              <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium mb-6">
                <Calendar className="w-3.5 h-3.5" /> {course.classesCompleted} Sessions Completed
              </div>
              
              <div className="mt-auto space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-slate-600">Course Progress</span>
                    <span className="text-[11px] font-medium text-brand-dark">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-dark rounded-full transition-all duration-1000" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Next Topic */}
                <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-medium text-amber-800 uppercase tracking-wider mb-0.5">Next Class Focus</h4>
                    <p className="text-[11px] font-medium text-amber-900 line-clamp-1">{course.nextTopic}</p>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Link 
                href={`/dashboard/teacher/continuity/${course.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[13px] font-medium hover:bg-slate-100 hover:text-brand-dark transition-colors shadow-sm group-hover:border-brand-dark/30"
              >
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
