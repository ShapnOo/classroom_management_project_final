"use client";

import { 
  MonitorPlay, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Play, 
  Clock, 
  MapPin,
  Flame,
  TrendingUp,
  FileText,
  AlertCircle,
  MoreVertical,
  Plus,
  Loader2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useState, useEffect } from "react";
import { api, TeacherDashboardData } from "@/lib/api";

import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Single consolidated Teacher Dashboard API call
    api.getTeacherDashboard()
      .then(data => {
        setDashboardData(data);
      })
      .catch(err => {
        console.warn("Could not load backend teacher dashboard API:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const metrics = dashboardData?.metrics;
  const myClassrooms = dashboardData?.myClassrooms || [];
  const todaySchedules = dashboardData?.todaySchedules || [];
  const syllabusProgress = dashboardData?.syllabusProgress || [];
  const recentSessions = dashboardData?.recentSessions || [];

  const totalClassroomsCount = metrics?.totalClassrooms ?? myClassrooms.length;
  const totalStudents = metrics?.totalStudents ?? 0;
  const ongoingClassrooms = myClassrooms.filter(c => c.status === "ongoing").length;
  const todayClassesCount = metrics?.todayClassesCount ?? todaySchedules.length;
  const totalAssignmentsCount = metrics?.totalAssignments ?? 0;

  // Build performance data from real API syllabus progress
  const performanceData = syllabusProgress.map(sp => ({
    name: sp.courseCode,
    attendance: metrics?.avgAttendanceRate || 92,
    avgScore: sp.progress,
  }));

  const upNext = syllabusProgress.find(sp => sp.progress < 100);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full mx-auto space-y-5 pb-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <p className="text-[11px] font-medium text-slate-500 mb-0.5">{currentDate}</p>
          <h1 className="text-sm font-semibold text-slate-900">Welcome, {dashboardData?.teacher?.name || "Faculty Member"}</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Here is your consolidated classroom overview.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-[11px] font-medium hover:bg-slate-50 transition-colors shadow-sm">
            View Reports
          </button>
          <button className="bg-brand-dark hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-[11px] font-medium transition-colors shadow-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Classrooms", value: String(totalClassroomsCount), icon: MonitorPlay, color: "text-blue-600", bg: "bg-blue-50", trend: `${ongoingClassrooms} ongoing`, trendColor: "text-blue-600" },
          { label: "Total Students", value: String(totalStudents), icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Enrolled", trendColor: "text-emerald-600" },
          { label: "Today's Classes", value: String(todayClassesCount), icon: Calendar, color: "text-amber-600", bg: "bg-amber-50", trend: todayClassesCount > 0 ? "Scheduled" : "None today", trendColor: "text-amber-600" },
          { label: "Assignments & Reviews", value: String(totalAssignmentsCount), icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50", trend: "active tasks", trendColor: "text-purple-600" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden group hover:border-brand-dark/30 transition-colors">
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
            <div className="absolute -bottom-4 -right-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform">
              <stat.icon className="w-16 h-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area - Middle Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Graphical View - Course Performance */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Class Performance & Progress
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Average attendance rate and syllabus coverage per course</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                <Bar dataKey="attendance" name="Attendance %" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={24} />
                <Bar dataKey="avgScore" name="Coverage %" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Priority - Up Next */}
        <div className="bg-brand-dark rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col text-white relative">
          <div className="absolute top-0 right-0 p-20 bg-white/5 rounded-full blur-3xl" />
          
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500/20 p-1.5 rounded-md">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-200">Up Next Focus</h2>
            </div>
            {upNext && <span className="text-[10px] font-medium bg-white/10 px-2 py-0.5 rounded-md text-white">{upNext.courseCode}</span>}
          </div>
          
          <div className="p-5 relative z-10 flex flex-col h-full justify-between">
            {upNext ? (
              <div>
                <p className="text-[10px] font-medium mb-1.5 uppercase tracking-widest text-blue-300">{upNext.courseCode}</p>
                <h3 className="text-xs font-medium mb-3">{upNext.courseTitle}</h3>
                
                <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] text-slate-300 mb-1.5 uppercase tracking-wide font-medium">Syllabus Completion</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-100 mb-1">
                    <span>Progress</span>
                    <span className="font-bold">{upNext.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${upNext.progress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
                <p className="text-[11px] text-slate-300">All course topics completed!</p>
              </div>
            )}
            
            <button className="w-full bg-white hover:bg-slate-100 text-brand-dark font-medium py-2.5 px-4 rounded-lg text-[11px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20">
              <Play className="w-3.5 h-3.5 fill-brand-dark" />
              Start Class Session
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Today's Schedule
            </h2>
            <span className="text-[10px] font-medium text-slate-500">{todaySchedules.length} classes</span>
          </div>
          <div className="p-4 flex-1 space-y-4">
            {todaySchedules.length > 0 ? todaySchedules.map((sched, i) => (
              <div key={sched.id || i} className={`relative pl-4 border-l-2 ${i === 0 ? 'border-brand-dark pb-2' : 'border-slate-200'}`}>
                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${i === 0 ? 'bg-brand-dark' : 'bg-slate-300'}`} />
                <div className={`text-[10px] font-medium mb-0.5 ${i === 0 ? 'text-brand-dark' : 'text-slate-500'}`}>{sched.start_time} - {sched.end_time}</div>
                <h3 className="text-[13px] font-medium text-slate-900 mb-0.5">{sched.course_title} ({sched.course_code})</h3>
                <p className="text-[11px] text-slate-500 font-medium mb-1.5">{sched.batch_name}</p>
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 w-fit px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3" /> {sched.room}
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[11px] font-medium text-slate-700">No classes today</p>
                <p className="text-[10px] text-slate-500 mt-1">Enjoy your day off!</p>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Classrooms List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MonitorPlay className="w-4 h-4 text-slate-500" />
              Assigned Classrooms
            </h2>
            <span className="bg-brand-dark/10 text-brand-dark text-[10px] font-medium px-2 py-0.5 rounded-full">{myClassrooms.length}</span>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[280px]">
            {myClassrooms.map((cls) => (
              <div key={cls.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[13px] font-medium text-slate-800 group-hover:text-brand-dark transition-colors">{cls.course_title}</h3>
                  <span className="text-[10px] font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded">{cls.course_code}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{cls.batch_name} • {cls.room} • {cls.student_count} Students</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-dark h-full rounded-full" style={{ width: `${cls.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Class Sessions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              Recent Conducted Sessions
            </h2>
          </div>
          <div className="p-4 space-y-4 flex-1">
            {recentSessions.length > 0 ? recentSessions.map((sess) => (
              <div key={sess.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-800">{sess.course_code}: <span className="font-semibold">{sess.topic_covered}</span></p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{sess.batch_name} • Attended: {sess.present_count}/{sess.total_attendance_count}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-[11px] text-slate-500">No recent sessions recorded yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
