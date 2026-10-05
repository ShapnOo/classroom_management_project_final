"use client";

import {
  PlaySquare, CheckCircle2, History, ArrowRight, Clock,
  Calendar, Users2, Check, X, AlertCircle, Save,
  BookOpen, ArrowLeft, CalendarDays, ChevronDown, ListTodo, Mic, Search, Filter, Layers
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
    classSessions, attendanceRecords,
    fetchClassrooms, fetchCourses, fetchBatches, fetchStudents,
    fetchSyllabusTopics, fetchClassSessions, fetchAttendanceRecords,
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchStudents();
    fetchSyllabusTopics();
    fetchClassSessions();
    fetchAttendanceRecords();
  }, []);

  const myClassrooms = getMyClassroomViews();

  const [selectedId, setSelectedId]   = useState(preselectedId || (myClassrooms[0]?.classroom.id ?? ""));
  const [step, setStep]               = useState<"pick" | "session" | "done">("pick");
  const [topic, setTopic]             = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [notes, setNotes]             = useState("");
  const [duration, setDuration]       = useState("1h 30m");
  const [attendance, setAttendance]   = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState("");
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
      const cur = myTopics.find(t => t.teacherStatus === "current") || myTopics.find(t => t.teacherStatus === "pending") || myTopics[0];
      if (cur) setTopic(cur.topic);
    }
  }, [selectedId, selectedView?.students?.length]);

  // Past sessions for selected classroom
  const myPastSessions = classSessions
    .filter(s => s.classroomId === selectedId)
    .sort((a, b) => b.conductedAt.localeCompare(a.conductedAt));

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    selectedView?.students.forEach(s => { next[s.id] = status; });
    setAttendance(next);
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount  = Object.values(attendance).filter(s => s === "absent").length;
  const lateCount    = Object.values(attendance).filter(s => s === "late").length;

  const finalTopicName = topic === "Other / Custom" ? customTopic : topic;

  const handleSave = () => {
    if (!selectedView || !finalTopicName) return;
    const sessionId = Date.now().toString(36);
    addClassSession({
      classroomId: selectedId,
      date: new Date().toISOString().split("T")[0],
      topicCovered: finalTopicName,
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

  const filteredStudents = (selectedView?.students || []).filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Step 3: SUCCESS CONFIRMATION
  if (step === "done") {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Lecture Session Recorded!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Attendance saved for <strong>{presentCount}</strong> present, <strong>{absentCount}</strong> absent, and <strong>{lateCount}</strong> late students.
          </p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 text-left space-y-3 shadow-sm text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Course:</span>
            <span className="font-bold text-slate-900">{selectedView?.course.title}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Topic:</span>
            <span className="font-bold text-slate-900">{finalTopicName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Duration:</span>
            <span className="font-bold text-slate-900">{duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Attendance Rate:</span>
            <span className="font-extrabold text-emerald-600">
              {presentCount}/{selectedView?.students.length} Present ({selectedView?.students.length ? Math.round((presentCount / selectedView.students.length) * 100) : 0}%)
            </span>
          </div>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => { setStep("pick"); setSaved(false); setTopic(""); setCustomTopic(""); setNotes(""); }}
            className="px-5 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm"
          >
            Start Another Session
          </button>
          <Link
            href={`/dashboard/teacher/classrooms/${selectedId}`}
            className="px-5 py-2.5 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-200 transition-all shadow-xs"
          >
            Back to Classroom
          </Link>
        </div>
      </div>
    );
  }

  // Step 1: PICK CLASSROOM
  if (step === "pick") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Start Class Lecture & Attendance</h1>
            <p className="text-xs text-slate-500 mt-1">Select an ongoing classroom to log today&apos;s lecture topic and record student attendance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {myClassrooms.filter(v => v.classroom.status === "ongoing").map(({ classroom: cls, course, batch, students, colors, progress }) => {
            const todayPastCount = classSessions.filter(s => s.classroomId === cls.id && s.date === new Date().toISOString().split("T")[0]).length;
            return (
              <button
                key={cls.id}
                onClick={() => { setSelectedId(cls.id); setStep("session"); }}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 text-left hover:border-slate-400 hover:shadow-md transition-all group space-y-4 relative overflow-hidden"
              >
                <div className={`h-2.5 w-full absolute top-0 left-0 ${colors.color}`} />
                <div className="flex justify-between items-start pt-1">
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${colors.light} ${colors.text}`}>
                    {course.code}
                  </span>
                  {todayPastCount > 0 && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                      ✓ {todayPastCount} done today
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-900 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{batch.name} • {students.length} Enrolled Students</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{cls.classesCompleted}/{cls.totalClasses} Lectures</span>
                    <span className={`font-extrabold ${colors.text}`}>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.color}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Start Live Session</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>

        {myClassrooms.filter(v => v.classroom.status === "ongoing").length === 0 && (
          <div className="py-16 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
            No ongoing classrooms found. Contact administration.
          </div>
        )}

        {/* History Section */}
        {myPastSessions.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Conducted Sessions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {myPastSessions.slice(0, 5).map(sess => {
                const view = myClassrooms.find(v => v.classroom.id === sess.classroomId);
                const sessAttendance = attendanceRecords.filter(r => r.sessionId === sess.id);
                const present = sessAttendance.filter(r => r.status === "present").length;
                return (
                  <div key={sess.id} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{sess.topicCovered}</p>
                        <p className="text-[11px] text-slate-500">{view?.course.code} • {new Date(sess.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-lg">
                      {present} Present
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: LIVE SESSION & ATTENDANCE FORM
  const cls = selectedView!;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
      
      {/* Top Banner & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setStep("pick")}
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${cls.colors.light} ${cls.colors.text}`}>
                {cls.course.code}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{cls.batch.name}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">{cls.course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            {cls.classroom.room || "Room TBA"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Session Information */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-slate-500" /> Lecture Session Info
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Topic Covered <span className="text-red-500">*</span>
              </label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              >
                <option value="">Select topic from syllabus</option>
                {myTopics.map(t => (
                  <option key={t.id} value={t.topic}>{t.topic} (Week {t.week})</option>
                ))}
                <option value="Other / Custom">Other / Custom Topic</option>
              </select>
              {topic === "Other / Custom" && (
                <input
                  type="text"
                  placeholder="Type custom lecture topic..."
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              >
                {["30m","45m","1h","1h 15m","1h 30m","2h"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Lecture Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Write any lesson notes, assignments given, or remarks..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none bg-white"
              />
            </div>
          </div>

          {/* Realtime Attendance Tally Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-center">
              <p className="text-2xl font-extrabold text-emerald-700">{presentCount}</p>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">Present</p>
            </div>
            <div className="rounded-2xl border border-red-200/80 bg-red-50/70 p-4 text-center">
              <p className="text-2xl font-extrabold text-red-700">{absentCount}</p>
              <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider mt-0.5">Absent</p>
            </div>
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-center">
              <p className="text-2xl font-extrabold text-amber-700">{lateCount}</p>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-0.5">Late</p>
            </div>
          </div>

          {/* Save Action Button */}
          <button
            onClick={handleSave}
            disabled={!finalTopicName}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save Session & Attendance
          </button>
        </div>

        {/* Right Column: Student Roster Attendance Marking */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          
          {/* Roster Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Mark Student Attendance
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                {cls.students.length} Enrolled
              </span>
            </div>

            {/* Fast Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAll("present")}
                className="text-xs font-bold px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors"
              >
                All Present
              </button>
              <button
                onClick={() => markAll("absent")}
                className="text-xs font-bold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Student Search Bar */}
          <div className="px-5 py-3 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name or roll number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Student Roster List */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No students found matching your search.
              </div>
            ) : (
              filteredStudents.map((student, idx) => {
                const status = attendance[student.id] ?? "present";
                return (
                  <div
                    key={student.id}
                    className={`px-5 py-3 flex items-center justify-between gap-4 transition-colors ${
                      status === "absent" ? "bg-red-50/30" : status === "late" ? "bg-amber-50/30" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-xs text-slate-400 font-bold w-6 text-right shrink-0">{idx + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-800 shrink-0">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{student.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold">{student.rollNo}</p>
                      </div>
                    </div>

                    {/* Segmented Status Selector */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setStudentStatus(student.id, "present")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          status === "present"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        ✓ Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatus(student.id, "absent")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          status === "absent"
                            ? "bg-red-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        ✕ Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatus(student.id, "late")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          status === "late"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
