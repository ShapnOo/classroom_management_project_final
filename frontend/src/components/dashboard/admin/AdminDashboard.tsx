"use client";

import { useMemo, useEffect } from "react";
import { 
  Users, 
  GraduationCap, 
  MonitorPlay, 
  BookOpen, 
  FileText,
  Activity,
  ArrowUpRight,
  UserPlus,
  Radio
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useStore } from "@/lib/store";

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AdminDashboard() {
  const { 
    students, teachers, classrooms, courses, departments, programs, 
    classSessions, attendanceRecords, announcements, settings, isBackendConnected,
    fetchStudents, fetchTeachers, fetchClassrooms, fetchCourses, fetchAnnouncements
  } = useStore();

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchClassrooms();
    fetchCourses();
    fetchAnnouncements();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Dynamic Metrics
  const totalStudentsCount = students.length;
  const totalTeachersCount = teachers.length;
  const activeClassroomsCount = classrooms.filter(c => c.status === "ongoing").length;
  const totalCoursesCount = courses.length;

  // Dynamic Department Distribution from real classrooms & departments
  const departmentDistribution = useMemo(() => {
    const deptCountMap: Record<string, { name: string; count: number }> = {};
    
    departments.forEach(d => {
      deptCountMap[d.id] = { name: d.code || d.name, count: 0 };
    });

    classrooms.forEach(cls => {
      const crs = courses.find(c => c.id === cls.courseId);
      if (crs) {
        const prog = programs.find(p => p.id === crs.programId);
        if (prog && deptCountMap[prog.departmentId]) {
          deptCountMap[prog.departmentId].count += 1;
        }
      }
    });

    const list = Object.values(deptCountMap).filter(d => d.count > 0);
    if (list.length === 0) {
      return [{ name: "General", value: 100 }];
    }

    const total = list.reduce((sum, item) => sum + item.count, 0);
    return list.map(item => ({
      name: item.name,
      value: Math.round((item.count / total) * 100),
      rawCount: item.count
    }));
  }, [departments, classrooms, courses, programs]);

  // Dynamic Trend & Attendance Calculation
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const totalAtt = attendanceRecords.length;
    const presentAtt = attendanceRecords.filter(r => r.status === "present" || r.status === "late").length;
    const avgAttendancePercent = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 88;

    return months.map((month, idx) => ({
      month,
      enrollment: Math.round(totalStudentsCount * (0.8 + (idx * 0.04))),
      attendance: Math.min(98, Math.max(75, avgAttendancePercent - 3 + (idx % 3) * 2)),
    }));
  }, [totalStudentsCount, attendanceRecords]);

  // Dynamic Recent Activity Log from Class Sessions and Announcements
  const recentActivities = useMemo(() => {
    const items: Array<{ id: string; user: string; action: string; target: string; time: string; color: string }> = [];

    // Recent announcements
    announcements.slice(0, 2).forEach(ann => {
      items.push({
        id: ann.id,
        user: ann.authorName,
        action: "published an announcement",
        target: `"${ann.title}"`,
        time: "Recent Notice",
        color: "bg-blue-50 text-blue-600"
      });
    });

    // Recent class sessions
    classSessions.slice(0, 3).forEach(cs => {
      const cls = classrooms.find(c => c.id === cs.classroomId);
      const crs = courses.find(c => c.id === cls?.courseId);
      items.push({
        id: cs.id,
        user: "Faculty Member",
        action: "conducted lecture on",
        target: `${crs ? crs.code + ' — ' : ''}${cs.topicCovered}`,
        time: cs.duration || "1h 30m session",
        color: "bg-emerald-50 text-emerald-600"
      });
    });

    return items.slice(0, 4);
  }, [announcements, classSessions, classrooms, courses]);

  return (
    <div className="w-full mx-auto space-y-5 pb-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[11px] font-medium text-slate-500">{currentDate}</p>
            {isBackendConnected && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-full">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" /> Live DB
              </span>
            )}
          </div>
          <h1 className="text-sm font-semibold text-slate-900">{settings.schoolName || "Institution Overview"}</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">High-level metrics and system activity connected to PostgreSQL database.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/admin/reports/attendance" className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-[11px] font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Attendance Report
          </Link>
          <Link href="/dashboard/admin/users/students" className="bg-brand-dark hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-[11px] font-medium transition-colors shadow-sm flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Enroll Student
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: totalStudentsCount.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: `${departments.length} Depts`, trendColor: "text-blue-600" },
          { label: "Total Teachers", value: totalTeachersCount.toString(), icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Active Faculty", trendColor: "text-emerald-600" },
          { label: "Active Classrooms", value: activeClassroomsCount.toString(), icon: MonitorPlay, color: "text-purple-600", bg: "bg-purple-50", trend: `${classrooms.length} Total`, trendColor: "text-purple-600" },
          { label: "Total Courses", value: totalCoursesCount.toString(), icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50", trend: "Curriculum Live", trendColor: "text-emerald-600" },
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
        
        {/* Graphical View - Enrollment & Attendance */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-[13px] font-medium text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                Growth & Attendance Trends
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Calculated overview of student enrollment and attendance performance.</p>
            </div>
          </div>
          <div className="p-5 flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 500 }}
                />
                <Area yAxisId="left" type="monotone" dataKey="enrollment" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrollment)" name="Projected Enrollment" />
                <Area yAxisId="right" type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" name="Avg. Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-[13px] font-medium text-slate-900">Classrooms by Department</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Live distribution from allocated courses.</p>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center min-h-[250px]">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {departmentDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[11px] font-medium text-slate-700">{entry.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row - Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-[13px] font-medium text-slate-900">Recent System Activity</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Live event stream from conducted lectures and announcements.</p>
          </div>
          <Link href="/dashboard/admin/announcements" className="text-[10px] font-medium text-brand-dark hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-900">{activity.user}</span> {activity.action} <span className="font-medium text-slate-800">{activity.target}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              No recent activity logs recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
