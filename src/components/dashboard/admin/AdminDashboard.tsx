"use client";

import { 
  Users, 
  GraduationCap, 
  MonitorPlay, 
  BookOpen, 
  Plus, 
  FileText,
  Activity,
  ArrowUpRight,
  UserPlus
} from "lucide-react";
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

const enrollmentData = [
  { month: 'Jan', enrollment: 1200, attendance: 85 },
  { month: 'Feb', enrollment: 1250, attendance: 88 },
  { month: 'Mar', enrollment: 1300, attendance: 86 },
  { month: 'Apr', enrollment: 1350, attendance: 90 },
  { month: 'May', enrollment: 1400, attendance: 92 },
  { month: 'Jun', enrollment: 1420, attendance: 89 },
];

const departmentData = [
  { name: 'CSE', value: 45 },
  { name: 'EEE', value: 25 },
  { name: 'BBA', value: 20 },
  { name: 'ENG', value: 10 },
];
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

const recentActivity = [
  { id: 1, user: 'Dr. Smith', action: 'created a new classroom', target: 'CS101 - Database Systems', time: '10 mins ago', color: 'bg-emerald-50 text-emerald-600' },
  { id: 2, user: 'Admin', action: 'updated global grading policy', target: 'Academic Rules', time: '1 hour ago', color: 'bg-blue-50 text-blue-600' },
  { id: 3, user: 'Prof. Johnson', action: 'published final results for', target: 'ENG201 - Literature', time: '3 hours ago', color: 'bg-purple-50 text-purple-600' },
  { id: 4, user: 'System', action: 'completed automated backup', target: 'Database', time: '5 hours ago', color: 'bg-slate-100 text-slate-600' },
];

export default function AdminDashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full mx-auto space-y-5 pb-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <p className="text-[11px] font-medium text-slate-500 mb-0.5">{currentDate}</p>
          <h1 className="text-sm font-semibold text-slate-900">Institution Overview</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">High-level metrics and system activity for your institution.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-[11px] font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            System Report
          </button>
          <button className="bg-brand-dark hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-[11px] font-medium transition-colors shadow-sm flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            Add User
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "1,420", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12% YTD", trendColor: "text-emerald-600" },
          { label: "Total Teachers", value: "85", icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+3 new", trendColor: "text-emerald-600" },
          { label: "Active Classrooms", value: "124", icon: MonitorPlay, color: "text-purple-600", bg: "bg-purple-50", trend: "12 pending", trendColor: "text-amber-500" },
          { label: "Total Courses", value: "48", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50", trend: "Fully mapped", trendColor: "text-blue-600" },
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
              <p className="text-[10px] text-slate-500 mt-0.5">6-month overview of student enrollment and average attendance.</p>
            </div>
          </div>
          <div className="p-5 flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Area yAxisId="left" type="monotone" dataKey="enrollment" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrollment)" name="Total Enrollment" />
                <Area yAxisId="right" type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" name="Avg. Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-[13px] font-medium text-slate-900">Classrooms by Department</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Current active distribution.</p>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center min-h-[250px]">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
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
              {departmentData.map((entry, index) => (
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
            <p className="text-[10px] text-slate-500 mt-0.5">Audit log of latest actions.</p>
          </div>
          <button className="text-[10px] font-medium text-brand-dark hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recentActivity.map((activity) => (
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
          ))}
        </div>
      </div>

    </div>
  );
}
