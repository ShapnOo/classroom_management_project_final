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
  ListTodo,
  Award,
  GraduationCap,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Bell,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { api, StudentDashboardData } from "@/lib/api";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleView, setScheduleView] = useState<"today" | "week">("today");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = () => {
    setLoading(true);
    api.getStudentDashboard()
      .then((data) => {
        setDashboardData(data);
      })
      .catch((err) => {
        console.warn("Could not load backend student dashboard API:", err);
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const metrics = dashboardData?.metrics;
  const enrolledClassrooms = dashboardData?.enrolledClassrooms || [];
  const todaySchedules = dashboardData?.todaySchedules || [];
  const weeklySchedules = dashboardData?.weeklySchedules || [];
  const upcomingAssignments = dashboardData?.upcomingAssignments || [];
  const upcomingTests = dashboardData?.upcomingTests || [];
  const recentSessions = dashboardData?.recentSessions || [];
  const announcements = dashboardData?.announcements || [];
  const student = dashboardData?.student;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const displaySchedules = scheduleView === "today" ? todaySchedules : weeklySchedules;

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Welcome & Identity Banner ────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-dark to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Academic Session
              </span>
              <span className="text-xs text-slate-400">• {currentDate}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Welcome back, {student?.name || "Student"} 👋
            </h1>

            <p className="text-xs sm:text-[13px] text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Degree: <strong className="text-white font-semibold">{student?.program_name || "B.Sc. in CSE"}</strong></span>
              <span>•</span>
              <span>Batch: <strong className="text-white font-semibold">{student?.batch_name || "Spring 2026 - Section A"}</strong> ({student?.batch_code || "SP26-A"})</span>
              <span>•</span>
              <span>Roll: <strong className="text-emerald-400 font-mono font-semibold">{student?.roll_no || "SP26A001"}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
            <Link
              href="/dashboard/student/results"
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 backdrop-blur-xs"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>CGPA {student?.cgpa || metrics?.cgpa || "3.85"}</span>
            </Link>
            <Link
              href="/dashboard/student/calendar"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              Class Timetable
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Performance Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Enrolled Courses",
            value: String(metrics?.enrolledClassroomsCount || enrolledClassrooms.length),
            subtext: "Active Semester",
            icon: MonitorPlay,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-100",
            badge: "Current Semester",
            badgeColor: "bg-blue-100 text-blue-700",
          },
          {
            label: "Overall Attendance",
            value: `${metrics?.avgAttendanceRate || 92}%`,
            subtext: `${metrics?.presentCount || 0} Present • ${metrics?.absentCount || 0} Absent`,
            icon: UserCheck,
            color: (metrics?.avgAttendanceRate || 92) >= 75 ? "text-emerald-600" : "text-amber-600",
            bg: (metrics?.avgAttendanceRate || 92) >= 75 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100",
            badge: (metrics?.avgAttendanceRate || 92) >= 75 ? "UGC Eligible (≥75%)" : "At Risk (<75%)",
            badgeColor: (metrics?.avgAttendanceRate || 92) >= 75 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
          },
          {
            label: "Class Schedule",
            value: `${todaySchedules.length} Today`,
            subtext: `${metrics?.weeklyClassesCount || weeklySchedules.length} Lectures / Week`,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-100",
            badge: todaySchedules.length > 0 ? "Active Day" : "No Classes Today",
            badgeColor: todaySchedules.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
          },
          {
            label: "Active Deadlines",
            value: String((metrics?.upcomingAssignmentsCount || upcomingAssignments.length) + (metrics?.upcomingTestsCount || upcomingTests.length)),
            subtext: `${upcomingAssignments.length} Assignments • ${upcomingTests.length} Tests`,
            icon: ListTodo,
            color: "text-purple-600",
            bg: "bg-purple-50 border-purple-100",
            badge: "Pending Tasks",
            badgeColor: "bg-purple-100 text-purple-700",
          },
        ].map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative overflow-hidden hover:border-slate-300 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg border ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-none mb-1">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-700">{stat.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Announcements Banner (if any) ─────────────────────────────────── */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 rounded-xl border border-blue-200/80 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-2 py-0.5 rounded">
                  Latest Academic Notice
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(announcements[0].date).toLocaleDateString("en-GB")}
                </span>
              </div>
              <h2 className="text-xs font-bold text-slate-900">{announcements[0].title}</h2>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {announcements[0].content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Grid: 2 Columns (Timetable & Tasks + Enrolled Classrooms) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1 & 2: Class Timetable & Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Class Timetable Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-dark" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Class Timetable Schedule
                </h2>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setScheduleView("today")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    scheduleView === "today"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Today ({todaySchedules.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView("week")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    scheduleView === "week"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Full Week ({weeklySchedules.length})
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {displaySchedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {displaySchedules.map((sched, idx) => (
                    <div 
                      key={sched.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-brand-dark/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                            {sched.day}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 font-mono">
                            {sched.start_time} - {sched.end_time}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {sched.course_title}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {sched.course_code} • Faculty: {sched.teacher_name}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {sched.room || sched.classroom_room || "Lecture Hall"}
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                          Scheduled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">No classes scheduled for today ({currentDate.split(",")[0]})</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Switch to &apos;Full Week&apos; view above to see your complete weekly timetable.</p>
                </div>
              )}
            </div>
          </div>

          {/* Enrolled Courses Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-brand-dark" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Enrolled Course Classrooms ({enrolledClassrooms.length})
                </h2>
              </div>
              <Link 
                href="/dashboard/student/classrooms"
                className="text-[11px] font-semibold text-brand-dark hover:text-slate-900 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {enrolledClassrooms.map((cls) => {
                const totalTopics = cls.total_topics || 12;
                const doneTopics = cls.completed_topics || 6;
                const progressPct = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 50;

                return (
                  <div key={cls.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {cls.course_code}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">
                          {cls.course_title}
                        </h3>
                        {cls.credits && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                            {cls.credits} Credits
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Instructor: <strong className="text-slate-700">{cls.teacher_name}</strong> • Room: {cls.room}
                      </p>
                    </div>

                    <div className="w-full sm:w-48 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-slate-500">Syllabus Progress</span>
                        <span className="text-brand-dark">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>{doneTopics} / {totalTopics} Topics Covered</span>
                        <span>{cls.classes_completed || 12} Lectures Done</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/student/materials`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Materials</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Col 3: Upcoming Tasks, Tests & Recent Activity */}
        <div className="space-y-6">
          
          {/* Upcoming Assignments & Tests Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-dark" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Deadlines
                </h2>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {upcomingAssignments.length + upcomingTests.length} Total
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Assignments */}
              {upcomingAssignments.map((asgn) => {
                const isSubmitted = asgn.submission_id || asgn.submission_status === "Submitted" || asgn.submission_status === "Graded";

                return (
                  <div 
                    key={asgn.id}
                    className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded uppercase">
                        Assignment
                      </span>
                      <span className="text-[10px] font-bold text-slate-900">
                        {asgn.total_marks} Marks
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">
                      {asgn.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{asgn.course_code}</span>
                      <span className="font-medium text-slate-600">
                        Due: {new Date(asgn.due_date).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-purple-200/60 flex items-center justify-between text-[10px]">
                      {isSubmitted ? (
                        <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
                          Pending Submission
                        </span>
                      )}

                      <Link
                        href="/dashboard/student/assignments"
                        className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-0.5"
                      >
                        <span>Submit Work</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Tests */}
              {upcomingTests.map((tst) => (
                <div 
                  key={tst.id}
                  className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                      Class Test
                    </span>
                    <span className="text-[10px] font-bold text-slate-900">
                      {tst.total_marks} Marks
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">
                    {tst.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{tst.course_code}</span>
                    <span className="font-semibold text-rose-700">
                      Exam: {new Date(tst.test_date).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-rose-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Duration: {tst.duration || "45m"}
                    </span>
                    <Link
                      href="/dashboard/student/tests"
                      className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-0.5"
                    >
                      <span>Syllabus & Info</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {upcomingAssignments.length === 0 && upcomingTests.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  No upcoming deadlines or tests. You are all caught up!
                </div>
              )}
            </div>
          </div>

          {/* Recent Lecture Topics & Attendance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-dark" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Recent Lecture History
                </h2>
              </div>
              <Link 
                href="/dashboard/student/attendance"
                className="text-[11px] font-semibold text-brand-dark hover:text-slate-900 flex items-center gap-1"
              >
                <span>Full Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {recentSessions.length > 0 ? (
                recentSessions.map((sess) => (
                  <div key={sess.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {sess.course_code}
                      </span>
                      <span className="text-slate-400">
                        {new Date(sess.conducted_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-900 leading-snug">
                      {sess.topic_covered}
                    </h3>

                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-slate-500 text-[10px]">
                        Faculty: {sess.teacher_name}
                      </span>
                      
                      {sess.my_attendance_status ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          sess.my_attendance_status === 'present' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : sess.my_attendance_status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sess.my_attendance_status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Conducted
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No recent lectures conducted yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
