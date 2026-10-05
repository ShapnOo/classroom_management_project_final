"use client";

import {
  CheckCircle2, Circle, Clock, ArrowLeft, BookOpen, Layers,
  ChevronRight, TrendingUp, ListTodo
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

interface TeacherCourseContinuityProps {
  courseId?: string;
}

export default function TeacherCourseContinuity({ courseId }: TeacherCourseContinuityProps) {
  const { getMyClassroomViews, updateSyllabusTopic } = useStore();
  const myClassrooms = getMyClassroomViews();

  // If courseId given, find that classroom view, else show list
  const resolved = courseId
    ? myClassrooms.find(v => v.classroom.id === courseId)
    : null;

  if (!courseId || !resolved) {
    // Show list of classrooms to pick
    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-[13px] font-medium text-slate-900">Course Continuity</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Select a classroom to view and track its syllabus progress.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {myClassrooms.map(({ classroom: cls, course, batch, syllabusTopics, colors, progress }) => {
            const done = syllabusTopics.filter(t => t.teacherStatus === "done").length;
            return (
              <Link key={cls.id} href={`/dashboard/teacher/continuity/${cls.id}`} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-dark/40 hover:shadow-md transition-all group">
                <div className={`h-1 w-full rounded-full ${colors.color} mb-4`} />
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
                <h3 className="mt-2 text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors leading-snug">{course.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1">{batch.name}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-medium mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className={colors.text}>{done}/{syllabusTopics.length} topics done</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.color} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const { course, batch, session, syllabusTopics, colors, progress, classroom: cls } = resolved;
  const done = syllabusTopics.filter(t => t.teacherStatus === "done").length;

  const markStatus = (topicId: string, status: "pending" | "current" | "done") => {
    updateSyllabusTopic(topicId, { teacherStatus: status });
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/teacher/continuity" className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0" title="Back to Course List">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${colors.light} ${colors.text}`}>{course.code}</span>
              <span className="text-[9px] text-slate-500 font-medium">{session.name}</span>
            </div>
            <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">{course.title}</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">{batch.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{progress}%</p>
            <p className="text-[10px] font-medium text-slate-500">{done} of {syllabusTopics.length} topics</p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" stroke="currentColor" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${colors.color.replace("bg-","text-")}`} stroke="currentColor" strokeWidth="3.5" fill="none" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Done", count: syllabusTopics.filter(t => t.teacherStatus === "done").length, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "Current", count: syllabusTopics.filter(t => t.teacherStatus === "current").length, color: "text-blue-600", bg: "bg-blue-50", icon: TrendingUp },
          { label: "Pending", count: syllabusTopics.filter(t => t.teacherStatus === "pending").length, color: "text-slate-600", bg: "bg-slate-50", icon: Clock },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-xl border border-slate-200 p-4 flex items-center gap-3 ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className={`text-[18px] font-bold ${color}`}>{count}</p>
              <p className="text-[10px] text-slate-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Topics List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-slate-500" />
          <h2 className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">Syllabus Topics</h2>
          <span className="ml-auto text-[10px] text-slate-500">{syllabusTopics.length} topics (admin-defined)</span>
        </div>
        <div className="divide-y divide-slate-100">
          {syllabusTopics.length === 0 ? (
            <div className="py-10 text-center text-[11px] text-slate-500">No syllabus topics defined yet. Ask admin to add topics for this course.</div>
          ) : syllabusTopics.map((topic, idx) => {
            const isDone    = topic.teacherStatus === "done";
            const isCurrent = topic.teacherStatus === "current";
            const isPending = topic.teacherStatus === "pending";
            return (
              <div key={topic.id} className={`p-4 transition-colors ${isDone ? "bg-emerald-50/30" : isCurrent ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isDone    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                     isCurrent ? <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-500" /></div> :
                                 <Circle className="w-5 h-5 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[9px] text-slate-400 font-medium">Week {topic.week}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded uppercase ${isDone ? "bg-emerald-100 text-emerald-700" : isCurrent ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{topic.teacherStatus}</span>
                      {topic.adminStatus !== "Published" && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-700">{topic.adminStatus}</span>}
                    </div>
                    <h3 className={`text-[13px] font-medium leading-snug ${isDone ? "text-slate-500 line-through decoration-slate-300" : isCurrent ? "text-brand-dark" : "text-slate-800"}`}>{topic.topic}</h3>
                    {topic.subTopics.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {topic.subTopics.map((sub, i) => (
                          <span key={i} className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{sub}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Teacher can update their progress */}
                  <div className="flex gap-1 shrink-0 ml-2">
                    {!isDone && (
                      <button onClick={() => markStatus(topic.id, "done")} className="text-[10px] font-medium px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Done</button>
                    )}
                    {!isCurrent && !isDone && (
                      <button onClick={() => markStatus(topic.id, "current")} className="text-[10px] font-medium px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">Current</button>
                    )}
                    {isDone && (
                      <button onClick={() => markStatus(topic.id, "pending")} className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Undo</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
