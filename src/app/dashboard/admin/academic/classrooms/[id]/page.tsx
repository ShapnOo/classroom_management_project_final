"use client";

import { 
  ArrowLeft, Users, Clock, CalendarDays, MapPin, BookOpen, 
  TrendingUp, CheckCircle2, Circle, ListTodo, FileText,
  User, Activity, Award
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Shared mock data — in a real app this would come from a DB
const allClassrooms: Record<string, {
  id: string; courseCode: string; courseTitle: string; program: string;
  batch: string; room: string; schedule: string; startDate: string;
  endDate: string; students: number; classesCompleted: number; totalClasses: number;
  progress: number; teacher: string; color: string; lightColor: string;
  textColor: string; status: string;
}> = {
  "cls-1": {
    id: "cls-1", courseCode: "CSE-305", courseTitle: "Database Management Systems",
    program: "B.Sc. CS", batch: "Spring 2026 - A", room: "Room 402, Bldg C",
    schedule: "Mon, Wed • 10:00 AM - 11:30 AM", startDate: "2026-01-15", endDate: "2026-05-20",
    students: 42, classesCompleted: 18, totalClasses: 26, progress: 68,
    teacher: "Prof. Dr. Shamim Al Mamun", color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-700", status: "ongoing"
  },
  "cls-2": {
    id: "cls-2", courseCode: "CSE-412", courseTitle: "Software Engineering",
    program: "B.Sc. CS", batch: "Spring 2026 - B", room: "Room 305, Bldg A",
    schedule: "Tue, Thu • 02:00 PM - 03:30 PM", startDate: "2026-01-16", endDate: "2026-05-22",
    students: 38, classesCompleted: 15, totalClasses: 20, progress: 74,
    teacher: "Prof. Dr. Risala Tasin Khan", color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-700", status: "ongoing"
  },
  "cls-3": {
    id: "cls-3", courseCode: "CSE-101", courseTitle: "Introduction to Computer Science",
    program: "B.Sc. CS", batch: "Fall 2025 - A", room: "Room 201, Bldg B",
    schedule: "Mon, Wed • 08:00 AM - 09:30 AM", startDate: "2025-08-15", endDate: "2025-12-20",
    students: 50, classesCompleted: 24, totalClasses: 24, progress: 100,
    teacher: "Prof. Md. Fazlul Karim Patwary", color: "bg-slate-500", lightColor: "bg-slate-50", textColor: "text-slate-700", status: "completed"
  },
  "cls-4": {
    id: "cls-4", courseCode: "CSE-425", courseTitle: "Artificial Intelligence",
    program: "B.Sc. CS", batch: "Spring 2026 - A", room: "Lab 2, Bldg D",
    schedule: "Mon, Wed • 12:00 PM - 01:30 PM", startDate: "2026-01-15", endDate: "2026-05-20",
    students: 35, classesCompleted: 8, totalClasses: 24, progress: 33,
    teacher: "Prof. Dr. Mohammad Shahidul Islam", color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-700", status: "ongoing"
  },
  "cls-5": {
    id: "cls-5", courseCode: "CSE-201", courseTitle: "Data Structures",
    program: "B.Sc. CS", batch: "Fall 2026 - C", room: "Room 101, Bldg B",
    schedule: "Fri • 09:00 AM - 12:00 PM", startDate: "2026-08-15", endDate: "2026-12-20",
    students: 45, classesCompleted: 0, totalClasses: 24, progress: 0,
    teacher: "Prof. Dr. Risala Tasin Khan", color: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-700", status: "upcoming"
  },
};

const syllabus = [
  { topic: "Introduction & ER Model", status: "done" },
  { topic: "Relational Model & SQL Basics", status: "done" },
  { topic: "Functional Dependencies", status: "done" },
  { topic: "Normalization (1NF, 2NF, 3NF)", status: "done" },
  { topic: "BCNF & Denormalization", status: "current" },
  { topic: "Transactions & Concurrency Control", status: "pending" },
  { topic: "Indexing & Query Optimization", status: "pending" },
  { topic: "Final Review", status: "pending" },
];

const recentSessions = [
  { number: 18, date: "Aug 12, 2026", topic: "Normalization (3NF)", attendance: "40/42", status: "done" },
  { number: 17, date: "Aug 10, 2026", topic: "Functional Dependencies", attendance: "38/42", status: "done" },
  { number: 16, date: "Aug 07, 2026", topic: "Relational Algebra", attendance: "41/42", status: "done" },
  { number: 15, date: "Aug 05, 2026", topic: "SQL Joins & Subqueries", attendance: "42/42", status: "done" },
];

const assignments = [
  { title: "ER Diagram Design", dueDate: "Oct 25, 2026", submissions: 38, total: 42, status: "Active" },
  { title: "SQL Queries Practice", dueDate: "Nov 02, 2026", submissions: 0, total: 42, status: "Upcoming" },
];

const tests = [
  { title: "Midterm: Normalization", date: "Oct 15, 2026", submissions: 40, total: 42, marks: 50, status: "Active" },
  { title: "Final Exam", date: "Dec 15, 2026", submissions: 0, total: 42, marks: 100, status: "Upcoming" },
];

export default function AdminClassroomDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const cls = allClassrooms[id];

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-[13px] font-medium text-slate-800 mb-2">Classroom not found</h2>
        <Link href="/dashboard/admin/academic/classrooms" className="text-[11px] text-brand-dark hover:underline">
          ← Back to All Classrooms
        </Link>
      </div>
    );
  }

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
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${cls.lightColor} ${cls.textColor}`}>
                {cls.courseCode} • {cls.status}
              </span>
            </div>
            <h1 className="text-[13px] font-medium text-slate-900 leading-tight">{cls.courseTitle}</h1>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Students", value: cls.students, sub: cls.batch },
          { icon: BookOpen, label: "Classes Done", value: `${cls.classesCompleted}/${cls.totalClasses}`, sub: "Total sessions" },
          { icon: TrendingUp, label: "Progress", value: `${cls.progress}%`, sub: "Course completion" },
          { icon: User, label: "Teacher", value: cls.teacher.split(' ').pop()!, sub: cls.teacher },
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
          <span className={`text-[11px] font-bold ${cls.textColor}`}>{cls.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${cls.color} rounded-full transition-all`} style={{ width: `${cls.progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
          <span>{cls.classesCompleted} classes completed</span>
          <span>{cls.totalClasses - cls.classesCompleted} remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Classroom Info */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
          <h2 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Classroom Info</h2>
          {[
            { icon: User, label: "Teacher", value: cls.teacher },
            { icon: Users, label: "Students", value: `${cls.students} enrolled` },
            { icon: MapPin, label: "Room", value: cls.room },
            { icon: Clock, label: "Schedule", value: cls.schedule },
            { icon: CalendarDays, label: "Duration", value: `${new Date(cls.startDate).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})} – ${new Date(cls.endDate).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}` },
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
            {syllabus.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {item.status === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : item.status === "current" ? (
                  <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <span className={`text-[11px] ${item.status === "done" ? "text-slate-400 line-through" : item.status === "current" ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                  {item.topic}
                </span>
                {item.status === "current" && (
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
            {recentSessions.map((session) => (
              <div key={session.number} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0">
                  #{session.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-800 truncate">{session.topic}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-400">{session.date}</span>
                    <span className="text-[9px] text-slate-400">•</span>
                    <span className="text-[9px] text-slate-500 font-medium">👥 {session.attendance}</span>
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
            {assignments.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-slate-800">{a.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Due: {a.dueDate} • {a.submissions}/{a.total} submitted</p>
                </div>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${a.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
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
            {tests.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-slate-800">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-slate-500">{t.date}</p>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <Award className="w-3 h-3" />{t.marks} Marks
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${t.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
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
