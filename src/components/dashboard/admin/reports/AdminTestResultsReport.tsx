"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Search, Award, FileText, CheckCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminTestResultsReport() {
  const { students, batches, programs, tests, gradeRecords } = useStore();
  
  const [programFilter, setProgramFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Only consider tests that have been graded (Completed or Active with grades)
  const gradedTests = useMemo(() => tests.filter(t => t.status !== "Upcoming"), [tests]);

  // Filter students based on UI selections
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const batch = batches.find(b => b.id === s.batchId);
      const matchesProgram = programFilter === "all" || batch?.programId === programFilter;
      const matchesBatch = batchFilter === "all" || s.batchId === batchFilter;
      return matchesProgram && matchesBatch;
    });
  }, [students, batches, programFilter, batchFilter]);

  const studentIds = new Set(filteredStudents.map(s => s.id));

  // Compute metrics for the selected students
  const { totalGrades, averageScore, histogramData, batchPerformance } = useMemo(() => {
    const relevantGrades = gradeRecords.filter(g => g.testId && studentIds.has(g.studentId));
    
    let sumPercentage = 0;
    const dist = { "90-100%": 0, "80-89%": 0, "70-79%": 0, "60-69%": 0, "<60%": 0 };
    
    // Batch performance tracking
    const batchAgg: Record<string, { total: number, count: number }> = {};

    relevantGrades.forEach(g => {
      const test = gradedTests.find(t => t.id === g.testId);
      if (test && test.totalMarks > 0) {
        const percent = (g.obtainedMarks / test.totalMarks) * 100;
        sumPercentage += percent;

        // Histogram
        if (percent >= 90) dist["90-100%"]++;
        else if (percent >= 80) dist["80-89%"]++;
        else if (percent >= 70) dist["70-79%"]++;
        else if (percent >= 60) dist["60-69%"]++;
        else dist["<60%"]++;

        // Batch Aggregation
        const student = students.find(s => s.id === g.studentId);
        if (student) {
          if (!batchAgg[student.batchId]) batchAgg[student.batchId] = { total: 0, count: 0 };
          batchAgg[student.batchId].total += percent;
          batchAgg[student.batchId].count += 1;
        }
      }
    });

    const avg = relevantGrades.length > 0 ? Math.round(sumPercentage / relevantGrades.length) : 0;
    const histArr = Object.entries(dist).map(([range, count]) => ({ range, count }));

    const batchPerfArr = Object.entries(batchAgg).map(([batchId, data]) => {
      const batch = batches.find(b => b.id === batchId);
      return {
        name: batch?.code || "Unknown",
        average: Math.round(data.total / data.count)
      };
    }).sort((a, b) => b.average - a.average);

    return { totalGrades: relevantGrades.length, averageScore: avg, histogramData: histArr, batchPerformance: batchPerfArr };
  }, [gradeRecords, studentIds, gradedTests, students, batches]);

  // Compute student-level table data
  const tableData = useMemo(() => {
    const records = gradeRecords.filter(g => g.testId && studentIds.has(g.studentId));
    
    return records.map(g => {
      const student = students.find(s => s.id === g.studentId);
      const test = tests.find(t => t.id === g.testId);
      const batch = batches.find(b => b.id === student?.batchId);
      
      const percentage = test && test.totalMarks > 0 ? Math.round((g.obtainedMarks / test.totalMarks) * 100) : 0;

      return {
        id: g.id,
        studentName: student?.name || "Unknown",
        rollNo: student?.rollNo || "-",
        batchName: batch?.code || "-",
        testTitle: test?.title || "Unknown Test",
        obtainedMarks: g.obtainedMarks,
        totalMarks: test?.totalMarks || 0,
        percentage,
        remarks: g.remarks || "-"
      };
    })
    .filter(d => 
      d.studentName.toLowerCase().includes(search.toLowerCase()) || 
      d.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      d.testTitle.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.percentage - a.percentage);
  }, [gradeRecords, studentIds, students, tests, batches, search]);

  const topBatch = batchPerformance.length > 0 ? batchPerformance[0] : null;

  return (
    <div className="w-full mx-auto space-y-6 pb-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[14px] font-semibold text-slate-900">Test Results Analytics</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Analyze institution-wide academic performance.</p>
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
            <span className="text-[10px] font-bold bg-brand-light px-2 py-0.5 rounded-full">AVERAGE</span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{averageScore}%</h3>
            <p className="text-[11px] font-medium text-slate-500">Overall Test Average</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-blue-500">
            <FileText className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{gradedTests.length}</h3>
            <p className="text-[11px] font-medium text-slate-500">Graded Tests Conducted</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{totalGrades}</h3>
            <p className="text-[11px] font-medium text-slate-500">Total Scores Recorded</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition-all">
          <div className="flex items-center justify-between text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 truncate">{topBatch ? topBatch.name : "-"}</h3>
            <p className="text-[11px] font-medium text-slate-500">Top Performing Batch</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-[12px] font-semibold text-slate-800 mb-4">Score Distribution</h3>
          <div className="h-[250px] w-full">
            {histogramData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">No score data available.</div>
            )}
          </div>
        </div>

        {/* Batch Performance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-[12px] font-semibold text-slate-800 mb-4">Batch Average (%)</h3>
          <div className="h-[250px] w-full">
            {batchPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400">No batch data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-slate-800">Detailed Student Scores</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search student or test..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Student</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Batch</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Test Title</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Marks</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Score %</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.slice(0, 50).map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[11px] text-slate-900">{d.studentName}</div>
                    <div className="text-[10px] text-slate-500">Roll: {d.rollNo}</div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">{d.batchName}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-700 font-medium">{d.testTitle}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 font-medium text-center">
                    {d.obtainedMarks} / {d.totalMarks}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.percentage >= 80 ? 'bg-green-100 text-green-700' : 
                      d.percentage >= 60 ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {d.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">{d.remarks}</td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[11px] text-slate-500">
                    No test records match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {tableData.length > 50 && (
          <div className="p-3 border-t border-slate-200 text-center bg-slate-50 text-[10px] text-slate-500">
            Showing top 50 records. Use search to find specific results.
          </div>
        )}
      </div>
    </div>
  );
}
