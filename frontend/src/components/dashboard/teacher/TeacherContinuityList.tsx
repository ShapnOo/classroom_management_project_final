"use client";

import { 
  TrendingUp, 
  ArrowRight,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function TeacherContinuityList() {
  const {
    getMyClassroomViews,
    fetchClassrooms, fetchCourses, fetchBatches, fetchSyllabusTopics, fetchClassSessions,
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchSyllabusTopics();
    fetchClassSessions();
  }, []);

  const myClassrooms = getMyClassroomViews();

  const formattedCourses = myClassrooms.map(({ classroom: cls, course, batch, syllabusTopics, progress }) => {
    const nextTopicObj = syllabusTopics.find(t => t.teacherStatus === "current" || t.teacherStatus === "pending");
    const nextTopic = nextTopicObj ? nextTopicObj.topic : "All topics completed!";

    return {
      id: cls.id,
      name: course.title,
      batch: batch.name,
      code: course.code,
      progress,
      classesCompleted: cls.classesCompleted,
      nextTopic,
    };
  });

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Course List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Course Details</th>
                <th className="px-5 py-3.5">Batch</th>
                <th className="px-5 py-3.5">Sessions</th>
                <th className="px-5 py-3.5">Next Class Focus</th>
                <th className="px-5 py-3.5">Course Progress</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {formattedCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-brand-dark/10 text-brand-dark">
                        {course.code}
                      </span>
                      <span className="font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                        {course.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-600">
                    {course.batch}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-medium">
                    <span className="font-bold text-slate-900">{course.classesCompleted}</span> Sessions
                  </td>
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 rounded-md px-2.5 py-1 text-[11px] font-medium text-amber-900 max-w-xs truncate">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{course.nextTopic}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 min-w-[180px]">
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-brand-dark font-bold">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-dark rounded-full transition-all duration-1000" 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <Link 
                      href={`/dashboard/teacher/continuity/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

