"use client";

import {
  PlaySquare, CheckCircle2, History, ArrowRight, Clock,
  Calendar, Users2, Check, X, AlertCircle, Save,
  BookOpen, ArrowLeft, CalendarDays, ChevronDown, ListTodo, Mic
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import type { AttendanceRecord } from "@/lib/types";

type AttendanceStatus = AttendanceRecord["status"];

export default function StartClassSession() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams?.get("classId") ?? "";

  const {
    getMyClassroomViews, syllabusTopics,
    addClassSession, upsertAttendance, updateClassroom,
    classSessions, attendanceRecords
  } = useStore();

  const myClassrooms = getMyClassroomViews();

  const [selectedId, setSelectedId]   = useState(preselectedId || (myClassrooms[0]?.classroom.id ?? ""));
  const [step, setStep]               = useState<"pick" | "session" | "done">("pick");
  const [topic, setTopic]             = useState("");
  const [notes, setNotes]             = useState("");
  const [duration, setDuration]       = useState("1h 30m");
  const [attendance, setAttendance]   = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved]             = useState(false);
  const [newSessionId, setNewSessionId] = useState<string | null>(null);

  const selectedView = myClassrooms.find(v => v.classroom.id === selectedId);
  const myTopics     = selectedView ? syllabusTopics.filter(t => t.courseId === selectedView.course.id) : [];

  // Pre-fill attendance as "present" when classroom selected
  useEffect(() => {
    if (selectedView) {
      const initial: Record<string, AttendanceStatus> = {};
      selectedView.students.forEach(s => { initial[s.id] = "present"; });
      setAttendance(initial);
    }
  }, [selectedId]);

  // Sessions for this classroom (history)
  const myPastSessions = classSessions
    .filter(s => s.classroomId === selectedId)
    .sort((a, b) => b.conductedAt.localeCompare(a.conductedAt));

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => {
      const cur = prev[studentId] ?? "present";
      const next: AttendanceStatus = cur === "present" ? "absent" : cur === "absent" ? "late" : "present";
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    selectedView?.students.forEach(s => { next[s.id] = status; });
    setAttendance(next);
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount  = Object.values(attendance).filter(s => s === "absent").length;
  const lateCount    = Object.values(attendance).filter(s => s === "late").length;

  const handleSave = () => {
    if (!selectedView || !topic) return;
    const sessionId = Date.now().toString(36);
    addClassSession({
      classroomId: selectedId,
      date: new Date().toISOString().split("T")[0],
      topicCovered: topic,
      notes,
      duration,
      conductedAt: new Date().toISOString(),
    });
    // Save attendance
    Object.entries(attendance).forEach(([studentId, status]) => {
      upsertAttendance(sessionId, selectedId, studentId, status);
    });
    // Increment completed count
    updateClassroom(selectedId, {
      classesCompleted: selectedView.classroom.classesCompleted + 1
    });
    setNewSessionId(sessionId);
    setSaved(true);
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Session Saved!</h2>
          <p className="text-[12px] text-slate-500 mt-1">Attendance has been recorded for <strong>{presentCount}</strong> present, <strong>{absentCount}</strong> absent, <strong>{lateCount}</strong> late.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2">
          <div className="flex justify-between text-[11px]"><span className="text-slate-500">Course</span><span className="font-medium text-slate-800">{selectedView?.course.title}</span></div>
          <div className="flex justify-between text-[11px]"><span className="text-slate-500">Topic</span><span className="font-medium text-slate-800">{topic}</span></div>
          <div className="flex justify-between text-[11px]"><span className="text-slate-500">Duration</span><span className="font-medium text-slate-800">{duration}</span></div>
          <div className="flex justify-between text-[11px]"><span className="text-slate-500">Students Present</span><span className="font-medium text-emerald-700">{presentCount}/{selectedView?.students.length}</span></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setStep("pick"); setSaved(false); setTopic(""); setNotes(""); }} className="px-4 py-2 text-[11px] font-medium bg-brand-dark text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            Start Another Session
          </button>
          <Link href="/dashboard/teacher/attendance" className="px-4 py-2 text-[11px] font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            View Attendance
          </Link>
        </div>
      </div>
    );
  }

  if (step === "pick") {
    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-[13px] font-medium text-slate-900">Start Class Session</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Select a classroom to conduct a session and mark attendance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myClassrooms.filter(v => v.classroom.status === "ongoing").map(({ classroom: cls, course, batch, students, colors, progress, schedules }) => {
            const todayPastCount = classSessions.filter(s => s.classroomId === cls.id && s.date === new Date().toISOString().split("T")[0]).length;
            return (
              <button key={cls.id} onClick={() => { setSelectedId(cls.id); setStep("session"); }} className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-brand-dark/40 hover:shadow-md transition-all group">
                <div className={`h-1 w-full rounded-full ${colors.color} mb-4`} />
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
                  {todayPastCount > 0 && <span className="text-[9px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{todayPastCount} done today</span>}
                </div>
                <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors leading-snug mt-1">{course.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1">{batch.name} • {students.length} students</p>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{cls.classesCompleted}/{cls.totalClasses} classes</span>
                  <span className={`font-medium ${colors.text}`}>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className={`h-full ${colors.color}`} style={{ width: `${progress}%` }} />
                </div>
              </button>
            );
          })}
        </div>
        {myClassrooms.filter(v => v.classroom.status === "ongoing").length === 0 && (
          <div className="py-12 text-center text-[12px] text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            No ongoing classrooms. Admin must set classroom status to &quot;ongoing&quot;.
          </div>
        )}

        {/* History Section */}
        {myPastSessions.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wide">Recent Sessions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {myPastSessions.slice(0, 5).map(sess => {
                const view = myClassrooms.find(v => v.classroom.id === sess.classroomId);
                const sessAttendance = attendanceRecords.filter(r => r.sessionId === sess.id);
                const present = sessAttendance.filter(r => r.status === "present").length;
                return (
                  <div key={sess.id} className="px-5 py-3 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><CalendarDays className="w-3.5 h-3.5 text-slate-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-900 truncate">{sess.topicCovered}</p>
                      <p className="text-[10px] text-slate-500">{view?.course.code} • {new Date(sess.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded whitespace-nowrap">{present} present</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step: session — attend + topic
  const cls = selectedView!;
  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <button onClick={() => setStep("pick")} className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${cls.colors.light} ${cls.colors.text}`}>{cls.course.code}</span>
            <span className="text-[10px] text-slate-500">{cls.batch.name}</span>
          </div>
          <h1 className="text-[13px] font-semibold text-slate-900 mt-0.5">{cls.course.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Session Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            <h2 className="text-[11px] font-medium text-slate-700 uppercase tracking-wide flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Session Info</h2>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Topic Covered <span className="text-red-500">*</span></label>
              <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="">Select topic from syllabus</option>
                {myTopics.map(t => (
                  <option key={t.id} value={t.topic}>{t.topic} (Week {t.week})</option>
                ))}
                <option value="Other / Custom">Other / Custom Topic</option>
              </select>
              {topic === "Other / Custom" && (
                <input type="text" placeholder="Type custom topic..." onChange={e => setTopic(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                {["30m","45m","1h","1h 15m","1h 30m","2h"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Notes (Optional)</label>
              <textarea rows={3} placeholder="Any notes about this session..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Present", count: presentCount, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
              { label: "Absent",  count: absentCount,  color: "text-red-600",     bg: "bg-red-50 border-red-200" },
              { label: "Late",    count: lateCount,    color: "text-amber-600",   bg: "bg-amber-50 border-amber-200" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
                <p className={`text-[18px] font-bold ${s.color}`}>{s.count}</p>
                <p className="text-[9px] text-slate-600 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={!topic} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-dark text-white font-medium text-[12px] rounded-xl hover:bg-slate-800 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" /> Save Session & Attendance
          </button>
        </div>

        {/* Right: Attendance List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-medium text-slate-700 uppercase tracking-wide">Mark Attendance</span>
              <span className="text-[10px] text-slate-500">({cls.students.length} students)</span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => markAll("present")} className="text-[10px] font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors">All Present</button>
              <button onClick={() => markAll("absent")} className="text-[10px] font-medium px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">All Absent</button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
            {cls.students.map((student, idx) => {
              const status = attendance[student.id] ?? "present";
              return (
                <div key={student.id} className={`px-4 py-2.5 flex items-center gap-3 transition-colors ${status === "absent" ? "bg-red-50/50" : status === "late" ? "bg-amber-50/50" : ""}`}>
                  <span className="text-[10px] text-slate-400 font-medium w-5 text-right shrink-0">{idx + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                    {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-900 truncate">{student.name}</p>
                    <p className="text-[9px] text-slate-500">{student.rollNo}</p>
                  </div>
                  <button onClick={() => toggleStatus(student.id)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border min-w-[80px] justify-center ${
                    status === "present" ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" :
                    status === "absent"  ? "bg-red-100  text-red-700  border-red-200  hover:bg-red-200" :
                                          "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                  }`}>
                    {status === "present" ? <Check className="w-3 h-3" /> : status === "absent" ? <X className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {status}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
