"use client";

import { useEffect, useMemo } from "react";
import { 
  ArrowLeft, Users, Clock, CalendarDays, MapPin, BookOpen, 
  TrendingUp, CheckCircle2, Circle, ListTodo, FileText,
  User, Activity, Award
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";

const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminClassroomDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    classSessions, attendanceRecords, getClassroomView,
    fetchClassrooms, fetchCourses, fetchBatches, fetchTeachers, fetchSessions, fetchPrograms,
    fetchSchedules, fetchSyllabusTopics, fetchStudents, fetchAssignments, fetchTests,
    fetchClassSessions, fetchAttendanceRecords,
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchTeachers();
    fetchSessions();
    fetchPrograms();
    fetchSchedules();
    fetchSyllabusTopics();
    fetchStudents();
    fetchAssignments();
    fetchTests();
    fetchClassSessions();
    fetchAttendanceRecords();
  }, []);

  const view = getClassroomView(id);

  // Latest 4 conducted sessions with attendance counts
  const recentSessions = useMemo(() => {
    const sessions = classSessions
      .filter(s => s.classroomId === id)
      .sort((a, b) => new Date(b.conductedAt || b.date).getTime() - new Date(a.conductedAt || a.date).getTime());
    return sessions.slice(0, 4).map((s, idx) => {
      const records = attendanceRecords.filter(r => r.sessionId === s.id);
      const attended = records.filter(r => r.status === "present" || r.status === "late").length;
      return {
        id: s.id,
        number: sessions.length - idx,
        date: formatDate(s.date),
        topic: s.topicCovered,
        attendance: records.length > 0 ? `${attended}/${records.length}` : "—",
      };
    });
  }, [classSessions, attendanceRecords, id]);

  if (!view) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-[13px] font-medium text-slate-800 mb-2">Loading classroom…</h2>
        <p className="text-[11px] text-slate-500 mb-3">If this persists, the classroom may not exist.</p>
        <Link href="/dashboard/admin/academic/classrooms" className="text-[11px] text-brand-dark hover:underline">
          ← Back to All Classrooms
        </Link>
      </div>
    );
  }

  const { classroom: cls, course, batch, teacher, syllabusTopics, assignments, tests, colors, progress, studentCount, scheduleLabel } = view;
  const syllabus = [...syllabusTopics].sort((a, b) => a.week - b.week);

  return (
    <div className="w-full space-y-5 pb-10 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/admin/academic/classrooms"
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>
                {course.code} • {cls.status}
              </span>
            </div>
            <h1 className="text-[13px] font-medium text-slate-900 leading-tight">{course.title}</h1>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Students", value: studentCount, sub: batch.name },
          { icon: BookOpen, label: "Classes Done", value: `${cls.classesCompleted}/${cls.totalClasses}`, sub: "Total sessions" },
          { icon: TrendingUp, label: "Progress", value: `${progress}%`, sub: "Course completion" },
          { icon: User, label: "Teacher", value: teacher.name.split(" ").pop()!, sub: teacher.name },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                <stat.icon className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-[13px] font-semibold text-slate-900 leading-tight">{stat.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-700">Overall Course Progress</span>
          <span className={`text-[11px] font-bold ${colors.text}`}>{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${colors.color} rounded-full transition-all`} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
          <span>{cls.classesCompleted} classes completed</span>
          <span>{Math.max(0, cls.totalClasses - cls.classesCompleted)} remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Classroom Info */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
          <h2 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Classroom Info</h2>
          {[
            { icon: User, label: "Teacher", value: teacher.name },
            { icon: Users, label: "Students", value: `${studentCount} enrolled` },
            { icon: MapPin, label: "Room", value: cls.room },
            { icon: Clock, label: "Schedule", value: scheduleLabel || "Not scheduled" },
            { icon: CalendarDays, label: "Duration", value: `${formatDate(cls.startDate)} – ${formatDate(cls.endDate)}` },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2.5">
              <item.icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-[11px] text-slate-700 font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Syllabus Progress */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h2 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Syllabus Coverage</h2>
          <div className="space-y-2">
            {syllabus.length === 0 && <p className="text-[11px] text-slate-400">No syllabus topics defined.</p>}
            {syllabus.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5">
                {item.teacherStatus === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : item.teacherStatus === "current" ? (
                  <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <span className={`text-[11px] ${item.teacherStatus === "done" ? "text-slate-400 line-through" : item.teacherStatus === "current" ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                  {item.topic}
                </span>
                {item.teacherStatus === "current" && (
                  <span className="ml-auto text-[9px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">In Progress</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h2 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {recentSessions.length === 0 && <p className="text-[11px] text-slate-400">No sessions conducted yet.</p>}
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                  #{session.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-800 truncate">{session.topic}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-400">{session.date}</span>
                    <span className="text-[9px] text-slate-400">•</span>
                    <span className="text-[9px] text-slate-500 font-medium flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> {session.attendance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments & Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Assignments */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h2 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
            <ListTodo className="w-3.5 h-3.5 text-indigo-500" /> Assignments
          </h2>
          <div className="space-y-2">
            {assignments.length === 0 && <p className="text-[11px] text-slate-400">No assignments yet.</p>}
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-slate-800">{a.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Due: {formatDate(a.dueDate)} • {a.submissions}/{studentCount} submitted</p>
                </div>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${a.status === "Active" ? "bg-emerald-50 text-emerald-700" : a.status === "Completed" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tests */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h2 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-pink-500" /> Tests & Exams
          </h2>
          <div className="space-y-2">
            {tests.length === 0 && <p className="text-[11px] text-slate-400">No tests yet.</p>}
            {tests.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-slate-800">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-slate-500">{formatDate(t.testDate)}</p>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <Award className="w-3 h-3" />{t.totalMarks} Marks
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${t.status === "Active" ? "bg-emerald-50 text-emerald-700" : t.status === "Completed" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
