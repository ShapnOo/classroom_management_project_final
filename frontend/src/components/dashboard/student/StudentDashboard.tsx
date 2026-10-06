"use client";

import { 
  MonitorPlay, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin,
  TrendingUp,
  FileText,
  BookOpen,
  UserCheck,
  ListTodo
} from "lucide-react";
import { useState, useEffect } from "react";
import { api, StudentDashboardData } from "@/lib/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentDashboard()
      .then((data) => {
        setDashboardData(data);
      })
      .catch((err) => {
        console.warn("Could not load backend student dashboard API:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const metrics = dashboardData?.metrics;
  const enrolledClassrooms = dashboardData?.enrolledClassrooms || [];
  const todaySchedules = dashboardData?.todaySchedules || [];
  const upcomingAssignments = dashboardData?.upcomingAssignments || [];
  const upcomingTests = dashboardData?.upcomingTests || [];
  const recentSessions = dashboardData?.recentSessions || [];
  const student = dashboardData?.student;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full mx-auto space-y-5 pb-8 animate-in fade-in duration-300">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <p className="text-[11px] font-medium text-slate-500 mb-0.5">{currentDate}</p>
          <h1 className="text-sm font-semibold text-slate-900">
            Welcome back, {student?.name || "Student"} 👋
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {student?.program_code || "BSc"} • {student?.batch_name || "Enrolled Batch"} • Roll: <span className="font-semibold text-slate-700">{student?.roll_no || "FA26-001"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/student/results"
            className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-[11px] font-medium hover:bg-slate-50 transition-colors shadow-xs"
          >
            My Transcript
          </Link>
          <Link
            href="/dashboard/student/calendar"
            className="bg-brand-dark hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-[11px] font-medium transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            Class Timetable
          </Link>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: String(metrics?.enrolledClassroomsCount || enrolledClassrooms.length), icon: MonitorPlay, color: "text-blue-600", bg: "bg-blue-50", trend: "Active Semester", trendColor: "text-blue-600" },
          { label: "Overall Attendance", value: `${metrics?.avgAttendanceRate || 92}%`, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Good Standing", trendColor: "text-emerald-600" },
          { label: "Today's Classes", value: String(metrics?.todayClassesCount || todaySchedules.length), icon: Clock, color: "text-amber-600", bg: "bg-amber-50", trend: todaySchedules.length > 0 ? "Scheduled Today" : "No Classes Today", trendColor: "text-amber-600" },
          { label: "Active Assignments", value: String(metrics?.upcomingAssignmentsCount || upcomingAssignments.length), icon: ListTodo, color: "text-purple-600", bg: "bg-purple-50", trend: "Due Soon", trendColor: "text-purple-600" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden group hover:border-brand-dark/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 ${stat.trendColor}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 leading-none mb-1">{stat.value}</p>
              <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Today&apos;s Class Timetable
            </h2>
            <span className="text-[10px] font-medium text-slate-500">{todaySchedules.length} classes</span>
          </div>
          <div className="p-4 flex-1 space-y-4">
            {todaySchedules.length > 0 ? todaySchedules.map((sched, i) => (
              <div key={sched.id || i} className={`relative pl-4 border-l-2 ${i === 0 ? 'border-brand-dark pb-2' : 'border-slate-200'}`}>
                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${i === 0 ? 'bg-brand-dark' : 'bg-slate-300'}`} />
                <div className={`text-[10px] font-medium mb-0.5 ${i === 0 ? 'text-brand-dark' : 'text-slate-500'}`}>
                  {sched.start_time} - {sched.end_time}
                </div>
                <h3 className="text-[13px] font-medium text-slate-900 mb-0.5">{sched.course_title} ({sched.course_code})</h3>
                <p className="text-[11px] text-slate-500 font-medium mb-1.5">Faculty: {sched.teacher_name || "Instructor"}</p>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 w-fit px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3" /> {sched.room}
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[11px] font-medium text-slate-700">No classes scheduled for today</p>
                <p className="text-[10px] text-slate-500 mt-1">Enjoy your study time!</p>
              </div>
            )}
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MonitorPlay className="w-4 h-4 text-slate-500" />
              Enrolled Courses
            </h2>
            <span className="bg-brand-dark/10 text-brand-dark text-[10px] font-medium px-2 py-0.5 rounded-full">{enrolledClassrooms.length}</span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[280px]">
            {enrolledClassrooms.map((cls) => (
              <div key={cls.id} className="p-3.5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[13px] font-medium text-slate-800 group-hover:text-brand-dark transition-colors">{cls.course_title}</h3>
                  <span className="text-[10px] font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded">{cls.course_code}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Faculty: {cls.teacher_name} • Room: {cls.room}</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.round(((cls.classes_completed || 8) / (cls.total_classes || 24)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks & Tests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Upcoming Tests & Assignments
            </h2>
          </div>
          <div className="p-4 space-y-3.5 flex-1">
            {upcomingAssignments.map((a) => (
              <div key={a.id} className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded uppercase">Assignment</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{a.title}</h4>
                  <p className="text-[10px] text-slate-500">{a.course_code} • Due: {new Date(a.due_date).toLocaleDateString("en-GB")}</p>
                </div>
                <span className="text-xs font-extrabold text-purple-900">{a.total_marks} Marks</span>
              </div>
            ))}

            {upcomingTests.map((t) => (
              <div key={t.id} className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded uppercase">Class Test</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{t.title}</h4>
                  <p className="text-[10px] text-slate-500">{t.course_code} • Date: {new Date(t.test_date).toLocaleDateString("en-GB")}</p>
                </div>
                <span className="text-xs font-extrabold text-rose-900">{t.total_marks} Marks</span>
              </div>
            ))}

            {upcomingAssignments.length === 0 && upcomingTests.length === 0 && (
              <div className="text-center py-6 text-[11px] text-slate-500">
                No active assignment deadlines or tests upcoming!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Class Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Recent Class Session Timeline & Topics Covered
          </h2>
        </div>
        <div className="p-4 divide-y divide-slate-100">
          {recentSessions.length > 0 ? (
            recentSessions.map((sess) => (
              <div key={sess.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {sess.course_code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{sess.course_title}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Topic: <span className="font-bold text-slate-800">{sess.topic_covered}</span></p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instructor: {sess.teacher_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-slate-500">
                    {new Date(sess.conducted_at).toLocaleDateString("en-GB")}
                  </span>
                  <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1">
                    Conducted
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">No class sessions conducted recently.</div>
          )}
        </div>
      </div>

    </div>
  );
}
