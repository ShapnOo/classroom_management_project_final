"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Search, TrendingUp, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

const PIE_COLORS = {
  Present: "#10b981", // green-500
  Absent: "#ef4444",  // red-500
  Late: "#f59e0b",    // amber-500
};

export default function AdminAttendanceReport() {
  const { students, batches, programs, attendanceRecords, classSessions, classrooms } = useStore();
  
  const [programFilter, setProgramFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Filter students based on UI selections
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const batch = batches.find(b => b.id === s.batchId);
      const matchesProgram = programFilter === "all" || batch?.programId === programFilter;
      const matchesBatch = batchFilter === "all" || s.batchId === batchFilter;
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                            s.rollNo.toLowerCase().includes(search.toLowerCase());
      return matchesProgram && matchesBatch && matchesSearch;
    });
  }, [students, batches, programFilter, batchFilter, search]);

  const studentIds = new Set(filteredStudents.map(s => s.id));

  // Compute metrics for the selected students
  const metrics = useMemo(() => {
    const relevantRecords = attendanceRecords.filter(r => studentIds.has(r.studentId));
    
    let present = 0;
    let absent = 0;
    let late = 0;

    relevantRecords.forEach(r => {
      if (r.status === "present") present++;
      if (r.status === "absent") absent++;
      if (r.status === "late") late++;
    });

    const total = present + absent + late;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { present, absent, late, total, percentage };
  }, [attendanceRecords, studentIds]);

  // Compute student-level table data
  const studentData = useMemo(() => {
    return filteredStudents.map(s => {
      const records = attendanceRecords.filter(r => r.studentId === s.id);
      const present = records.filter(r => r.status === "present").length;
      const late = records.filter(r => r.status === "late").length;
      const absent = records.filter(r => r.status === "absent").length;
      const total = records.length;
      const attended = present + late;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
      const batch = batches.find(b => b.id === s.batchId);

      return {
        ...s,
        batchName: batch?.code || "Unknown",
        present,
        late,
        absent,
        total,
        percentage
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [filteredStudents, attendanceRecords, batches]);

  // Compute batch-wise data for Bar Chart
  const batchChartData = useMemo(() => {
    // Only care about batches currently in the filter
    const activeBatches = batches.filter(b => {
      return programFilter === "all" || b.programId === programFilter;
    });

    return activeBatches.map(b => {
      // Find all students in this batch
      const bStudents = new Set(students.filter(s => s.batchId === b.id).map(s => s.id));
      const records = attendanceRecords.filter(r => bStudents.has(r.studentId));
      
      let present = 0;
      let late = 0;
      records.forEach(r => {
        if (r.status === "present") present++;
        if (r.status === "late") late++;
      });
      const total = records.length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      return {
        name: b.code,
        percentage
      };
    }).filter(d => d.percentage > 0); // Hide batches with no data
  }, [batches, students, attendanceRecords, programFilter]);

  const pieData = [
    { name: "Present", value: metrics.present },
    { name: "Absent", value: metrics.absent },
    { name: "Late", value: metrics.late },
  ].filter(d => d.value > 0);

  return (
    <div className="w-full mx-auto space-y-6 pb-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[14px] font-semibold text-slate-900">Attendance Report</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Track student participation and overall attendance metrics.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select value={programFilter} onChange={e => { setProgramFilter(e.target.value); setBatchFilter("all"); }} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer">
            <option value="all">All Programs</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.code}</option>
            ))}
          </select>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} disabled={programFilter === "all"} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer disabled:bg-slate-50 disabled:text-slate-400">
            <option value="all">All Batches</option>
            {batches.filter(b => b.programId === programFilter).map(b => (
              <option key={b.id} value={b.id}>{b.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-brand-dark">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-brand-light px-2 py-0.5 rounded-full">OVERALL</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{metrics.percentage}%</h3>
            <p className="text-[11px] font-medium text-slate-500">Average Attendance</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-green-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{metrics.present + metrics.late}</h3>
            <p className="text-[11px] font-medium text-slate-500">Total Present & Late</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-red-500">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{metrics.absent}</h3>
            <p className="text-[11px] font-medium text-slate-500">Total Absences</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-slate-700">
            <Users className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{filteredStudents.length}</h3>
            <p className="text-[11px] font-medium text-slate-500">Filtered Students</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-[12px] font-semibold text-slate-800 mb-4">Overall Distribution</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[11px] text-slate-400">No attendance data available.</p>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-[12px] font-semibold text-slate-800 mb-4">Batch-wise Average (%)</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            {batchChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="percentage" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[11px] text-slate-400">No batch data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-slate-800">Student Attendance Detail</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search by name or roll..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Student</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Roll No</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Batch</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Classes</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Present</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Absent</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentData.slice(0, 50).map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[11px] text-slate-900">{s.name}</div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 font-medium">{s.rollNo}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">{s.batchName}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 font-medium text-center">{s.total}</td>
                  <td className="px-4 py-3 text-[11px] text-green-600 font-medium text-center">{s.present + s.late}</td>
                  <td className="px-4 py-3 text-[11px] text-red-500 font-medium text-center">{s.absent}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.percentage >= 80 ? 'bg-green-100 text-green-700' : 
                      s.percentage >= 60 ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {s.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
              {studentData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[11px] text-slate-500">
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {studentData.length > 50 && (
          <div className="p-3 border-t border-slate-200 text-center bg-slate-50 text-[10px] text-slate-500">
            Showing top 50 students. Use search to find specific records.
          </div>
        )}
      </div>
    </div>
  );
}
