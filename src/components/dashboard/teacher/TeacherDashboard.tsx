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
  Plus
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

import { getTodaysSchedule, getUpNextTopic, myClassrooms } from "@/lib/mockData";

const performanceData = [
  { name: 'DBMS', attendance: 92, avgScore: 85 },
  { name: 'Software Eng', attendance: 88, avgScore: 78 },
  { name: 'Networking', attendance: 95, avgScore: 88 },
  { name: 'AI Basics', attendance: 82, avgScore: 75 },
];

export default function TeacherDashboard() {
  const todaysSchedule = getTodaysSchedule();
  const upNext = getUpNextTopic();
  const totalStudents = myClassrooms.reduce((sum, c) => sum + c.students, 0);
  const ongoingClassrooms = myClassrooms.filter(c => c.status === "ongoing").length;

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
          
          <p className="text-[13px] text-slate-500 mt-0.5">Here is what's happening in your classrooms today.</p>
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
          { label: "My Classrooms", value: String(myClassrooms.length), icon: MonitorPlay, color: "text-blue-600", bg: "bg-blue-50", trend: `${ongoingClassrooms} ongoing`, trendColor: "text-blue-600" },
          { label: "Total Students", value: String(totalStudents), icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Enrolled", trendColor: "text-emerald-600" },
          { label: "Today's Classes", value: String(todaysSchedule.length), icon: Calendar, color: "text-amber-600", bg: "bg-amber-50", trend: todaysSchedule.length > 0 ? todaysSchedule[0].startTime : "None today", trendColor: "text-amber-600" },
          { label: "Pending Reviews", value: "12", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50", trend: "3 urgent", trendColor: "text-red-500" },
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
                Class Performance Overview
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Average attendance and scores across your courses</p>
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
                <Bar dataKey="avgScore" name="Avg Score %" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={24} />
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
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-slate-200">Up Next</h2>
            </div>
            {upNext && <span className="text-[10px] font-medium bg-white/10 px-2 py-0.5 rounded-md text-white">Week {upNext.week}</span>}
          </div>
          
          <div className="p-5 relative z-10 flex flex-col h-full justify-between">
            {upNext ? (
              <div>
                <p className="text-[10px] font-medium mb-1.5 uppercase tracking-widest text-blue-300">{upNext.course}</p>
                <h3 className="text-xs font-medium mb-3">{upNext.topic}</h3>
                
                <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm border border-white/10">
                  <p className="text-[10px] text-slate-300 mb-1.5 uppercase tracking-wide font-medium">Key Concepts</p>
                  <ul className="space-y-1.5">
                    {upNext.subTopics.map((sub, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] text-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
                <p className="text-[11px] text-slate-300">All topics completed!</p>
              </div>
            )}
            
            <button className="w-full bg-white hover:bg-slate-100 text-brand-dark font-medium py-2.5 px-4 rounded-lg text-[11px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20">
              <Play className="w-3.5 h-3.5 fill-brand-dark" />
              Start Class Now
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
            <span className="text-[10px] font-medium text-slate-500">{todaysSchedule.length} classes</span>
          </div>
          <div className="p-4 flex-1 space-y-4">
            {todaysSchedule.length > 0 ? todaysSchedule.map((sched, i) => (
              <div key={sched.id} className={`relative pl-4 border-l-2 ${i === 0 ? 'border-brand-dark pb-2' : 'border-slate-200'}`}>
                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${i === 0 ? 'bg-brand-dark' : 'bg-slate-300'}`} />
                <div className={`text-[10px] font-medium mb-0.5 ${i === 0 ? 'text-brand-dark' : 'text-slate-500'}`}>{sched.startTime} - {sched.endTime}</div>
                <h3 className="text-[13px] font-medium text-slate-900 mb-0.5">{sched.courseTitle}</h3>
                <p className="text-[11px] text-slate-500 font-medium mb-1.5">{sched.batch} • {sched.students} Students</p>
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

        {/* Pending Evaluations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Needs Evaluation
            </h2>
            <span className="bg-red-100 text-red-700 text-[10px] font-medium px-2 py-0.5 rounded-full">12</span>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { title: "ER Diagram Assignment", course: "DBMS", students: 6, time: "Due yesterday" },
              { title: "Project Proposal", course: "Software Eng", students: 4, time: "Due 2 days ago" },
              { title: "Network Setup Lab", course: "Networking", students: 2, time: "Due today" },
            ].map((task, i) => (
              <div key={i} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                <h3 className="text-[13px] font-medium text-slate-800 group-hover:text-brand-dark transition-colors">{task.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-1.5">{task.course}</p>
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {task.students} submissions
                  </span>
                  <span className="text-slate-400">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MonitorPlay className="w-4 h-4 text-slate-500" />
              Recent Activity
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-800">You graded <span className="font-medium">Normalization Test</span></p>
                <p className="text-[10px] text-slate-500 mt-0.5">2 hours ago • DBMS</p>
              </div>
            </div>
            
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-800">Published new material: <span className="font-medium">Ch 4 Slides</span></p>
                <p className="text-[10px] text-slate-500 mt-0.5">Yesterday • Software Engineering</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-800">Added 5 new students to <span className="font-medium">PGDIT Spring</span></p>
                <p className="text-[10px] text-slate-500 mt-0.5">Yesterday</p>
              </div>
            </div>
            
            <button className="w-full mt-2 py-1.5 text-[11px] font-medium text-brand-dark border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              View All Activity
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
