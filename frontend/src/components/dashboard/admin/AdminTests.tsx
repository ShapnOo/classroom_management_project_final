"use client";

import {
  FileText, Search, Plus, ArrowLeft, Calendar,
  Users, Edit2, Trash2, Clock, CheckCircle2, Eye,
  LayoutGrid, List as ListIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import type { Test } from "@/lib/types";

interface AdminTestsProps {
  courseId?: string; // classroomId
}

function pct(a: number, b: number) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}

export default function AdminTests({ courseId }: AdminTestsProps) {
  const { 
    getAllClassroomViews, tests,
    fetchTests, fetchClassrooms, fetchCourses, fetchBatches
  } = useStore();
  const allClassrooms = getAllClassroomViews();

  useEffect(() => {
    fetchTests();
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
  }, []);

  const [search, setSearch] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  // ── INDIVIDUAL CLASSROOM VIEW (when courseId is passed) ─────────────────────────────
  if (courseId) {
    const view = allClassrooms.find(v => v.classroom.id === courseId);
    if (!view) return <div className="text-[11px] text-slate-500 py-8 text-center">Classroom not found.</div>;

    const { classroom: cls, course, batch, session, students, colors } = view;
    const clsTests = tests.filter(t => t.classroomId === courseId);
    const filteredCls = clsTests.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/academic/tests" className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-2xs shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded uppercase ${colors.light} ${colors.text}`}>{course.code}</span>
                <span className="text-[10px] text-slate-500">{session.name} • {batch.name}</span>
              </div>
              <h1 className="text-[13px] font-semibold text-slate-900 mt-0.5">{course.title} Class Tests</h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Tests", value: clsTests.length, color: "text-slate-700", bg: "bg-slate-50" },
            { label: "Upcoming", value: clsTests.filter(t => t.status === "Upcoming").length, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Active", value: clsTests.filter(t => t.status === "Active").length, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Completed", value: clsTests.filter(t => t.status === "Completed").length, color: "text-emerald-700", bg: "bg-emerald-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
              <p className={`text-[18px] font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2.5 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tests..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-brand-dark"
            >
              <option value="all">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "list" ? "bg-slate-100 text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "cards" ? "bg-slate-100 text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "list" ? (
          <DataTable
            columns={["Test Title", "Test Date", "Duration", "Max Marks", "Submissions", "Status", "Actions"]}
            isEmpty={filteredCls.length === 0}
            emptyStateIcon={FileText}
            emptyStateTitle="No tests found"
            emptyStateDescription="No tests matching your criteria."
          >
            {filteredCls.map(test => (
              <tr key={test.id} className="hover:bg-slate-50/80 transition-colors group text-xs">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{test.title}</p>
                      {test.description && <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{test.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-700">
                  {new Date(test.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-700">{test.duration ?? "N/A"}</td>
                <td className="px-5 py-3.5 font-bold text-slate-900">{test.totalMarks}</td>
                <td className="px-5 py-3.5">
                  <div className="w-32">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-bold text-slate-800">{test.submissions}/{students.length}</span>
                      <span className="text-slate-400">{pct(test.submissions, students.length)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct(test.submissions, students.length)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    test.status === "Active" ? "bg-amber-100 text-amber-700" :
                    test.status === "Upcoming" ? "bg-blue-100 text-blue-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {test.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/dashboard/admin/academic/tests/${courseId}/evaluate/${test.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3 h-3 text-indigo-300" /> Results
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCls.map(test => (
              <div key={test.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden">
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                      test.status === "Active" ? "bg-amber-100 text-amber-700" :
                      test.status === "Upcoming" ? "bg-blue-100 text-blue-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>{test.status}</span>
                  </div>
                  <h3 className="text-[13px] font-medium text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-2 mb-3">{test.title}</h3>
                  {test.description && <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{test.description}</p>}
                  <div className="space-y-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" />Date: <strong className="text-slate-900">{new Date(test.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong></div>
                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" />Duration: <strong className="text-slate-900">{test.duration ?? "N/A"}</strong></div>
                    <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" />Max Marks: <strong className="text-slate-900">{test.totalMarks}</strong></div>
                  </div>
                  {test.status === "Completed" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" />Submissions</span>
                        <span className="font-medium text-brand-dark">{test.submissions}/{students.length}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-dark rounded-full" style={{ width: `${pct(test.submissions, students.length)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/admin/academic/tests/${courseId}/evaluate/${test.id}`} className="flex-1 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-sm text-center flex items-center justify-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" /> View Test Results & Marks
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── GLOBAL CLASS TESTS MONITOR VIEW ──────────────────────────────────────────────
  const uniqueBatches = Array.from(new Map(allClassrooms.map(c => [c.batch.id, c.batch])).values());

  const enrichedTests = tests.map(t => {
    const clsView = allClassrooms.find(v => v.classroom.id === t.classroomId);
    return {
      test: t,
      view: clsView
    };
  }).filter(item => item.view !== undefined);

  const filteredAll = enrichedTests.filter(({ test: t, view: v }) => {
    if (selectedBatchId && selectedBatchId !== "all" && v?.batch.id !== selectedBatchId) return false;
    if (statusFilter && statusFilter !== "all" && t.status !== statusFilter) return false;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      v?.course.title.toLowerCase().includes(search.toLowerCase()) ||
      v?.course.code.toLowerCase().includes(search.toLowerCase()) ||
      v?.batch.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">Class Tests Monitor</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Centralized tracking of quizzes, midterm assessments, and student test evaluation records.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tests", value: tests.length, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Upcoming", value: tests.filter(t => t.status === "Upcoming").length, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Active", value: tests.filter(t => t.status === "Active").length, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Completed", value: tests.filter(t => t.status === "Completed").length, color: "text-emerald-700", bg: "bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className={`text-[18px] font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search test, course, or batch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          <select
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
          >
            <option value="all">All Batches ({tests.length} tests)</option>
            {uniqueBatches.map(b => {
              const bCount = enrichedTests.filter(et => et.view?.batch.id === b.id).length;
              return (
                <option key={b.id} value={b.id}>
                  {b.name} ({bCount})
                </option>
              );
            })}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="List View"
          >
            <ListIcon className="w-3.5 h-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === "cards"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Cards
          </button>
        </div>
      </div>

      {/* Main Content: List (Default) or Cards */}
      {viewMode === "list" ? (
        <DataTable
          columns={["Test Title", "Course", "Batch", "Test Date", "Duration", "Max Marks", "Submissions", "Status", "Actions"]}
          isEmpty={filteredAll.length === 0}
          emptyStateIcon={FileText}
          emptyStateTitle="No tests found"
          emptyStateDescription="Try adjusting your filters or schedule a new test from classroom view."
        >
          {filteredAll.map(({ test: t, view: v }) => {
            const totalStudents = v?.students?.length || 45;
            return (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group text-xs">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{t.title}</p>
                      {t.description && <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{t.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${v?.colors.light} ${v?.colors.text}`}>
                      {v?.course.code}
                    </span>
                    <span className="font-medium text-slate-700 text-xs line-clamp-1">{v?.course.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600 font-medium">
                  {v?.batch.name}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                  {new Date(t.testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-600">
                  {t.duration ?? "N/A"}
                </td>
                <td className="px-5 py-3.5 font-bold text-slate-900">
                  {t.totalMarks}
                </td>
                <td className="px-5 py-3.5">
                  <div className="w-28">
                    <div className="flex justify-between text-[10px] mb-1 font-medium">
                      <span className="text-slate-800 font-bold">{t.submissions}/{totalStudents}</span>
                      <span className="text-slate-400">{pct(t.submissions, totalStudents)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct(t.submissions, totalStudents)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    t.status === "Active" ? "bg-amber-100 text-amber-700" :
                    t.status === "Upcoming" ? "bg-blue-100 text-blue-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/dashboard/admin/academic/tests/${v?.classroom.id}/evaluate/${t.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-medium hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap"
                  >
                    <Eye className="w-3 h-3 text-indigo-300" /> View Results
                  </Link>
                </td>
              </tr>
            );
          })}
        </DataTable>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueBatches.map(b => {
            const batchTests = enrichedTests.filter(et => et.view?.batch.id === b.id);
            const batchClasses = allClassrooms.filter(c => c.batch.id === b.id);
            return (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBatchId(b.id);
                  setViewMode("list");
                }}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group block text-left"
              >
                <div className="h-1 w-full rounded-full bg-slate-100 group-hover:bg-indigo-500 transition-colors mb-4" />
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{b.name}</h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">View List</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{batchClasses.length} courses • {batchTests.length} tests</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
