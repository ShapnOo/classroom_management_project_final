"use client";

import {
  History, Search, Filter, Calendar, BookOpen, User, 
  CheckCircle2, Clock, MapPin, ArrowRight, Trash2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function AdminClassSessions() {
  const { classSessions, getAllClassroomViews, deleteClassSession } = useStore();
  const allViews = getAllClassroomViews();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  // Build a rich array of session history
  const enrichedSessions = classSessions.map(session => {
    const view = allViews.find(v => v.classroom.id === session.classroomId);
    return {
      session,
      view
    };
  }).filter(s => s.view !== undefined)
    .sort((a, b) => new Date(b.session.conductedAt).getTime() - new Date(a.session.conductedAt).getTime());

  const filtered = enrichedSessions.filter(({ session, view }) => {
    const v = view!;
    const matchSearch = 
      session.topicCovered.toLowerCase().includes(search.toLowerCase()) ||
      v.course.title.toLowerCase().includes(search.toLowerCase()) ||
      v.teacher.name.toLowerCase().includes(search.toLowerCase());
    
    const matchCourse = courseFilter === "all" || v.course.id === courseFilter;
    
    return matchSearch && matchCourse;
  });

  const uniqueCourses = Array.from(new Set(allViews.map(v => v.course.id)))
    .map(id => allViews.find(v => v.course.id === id)!.course);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">All Class Sessions</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Overview of all classes conducted by teachers across all batches.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search topic, course, or teacher..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400"
          />
        </div>
        <select 
          value={courseFilter} 
          onChange={e => setCourseFilter(e.target.value)} 
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto"
        >
          <option value="all">All Courses</option>
          {uniqueCourses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions", value: classSessions.length, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "This Week", value: enrichedSessions.filter(s => new Date(s.session.conductedAt) >= new Date(Date.now() - 7 * 86400000)).length, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Active Classrooms", value: allViews.filter(v => v.classroom.status === "ongoing").length, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Avg Duration", value: "1.5 hrs", color: "text-amber-700", bg: "bg-amber-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className={`text-[18px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-[11px] font-medium text-slate-700">No class sessions found</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Sessions logged by teachers will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ session, view }) => {
            const v = view!;
            return (
              <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded uppercase ${v.colors.light} ${v.colors.text}`}>
                        {v.course.code}
                      </span>
                      <p className="text-[9px] text-slate-500 mt-0.5">{new Date(session.conductedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteClassSession(session.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <h3 className="text-[13px] font-semibold text-slate-900 mb-1 line-clamp-1">{session.topicCovered}</h3>
                <p className="text-[11px] font-medium text-slate-700 mb-4 line-clamp-1">{v.course.title}</p>
                
                <div className="space-y-2 mt-auto text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" />Teacher: <span className="text-slate-700 font-medium">{v.teacher.name}</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" />Duration: <span className="text-slate-700 font-medium">{session.duration}</span></div>
                  <div className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-slate-400" />Batch: <span className="text-slate-700 font-medium">{v.batch.name}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
