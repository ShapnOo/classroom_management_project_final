"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, ListTodo, GraduationCap, Building2, BookOpen, 
  Layers, Filter, Search, CheckCircle2, Clock, Sparkles, ChevronRight,
  BookMarked, LayoutGrid, Table, Check, Eye
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { SyllabusTopic, Course, Program, Batch } from "@/lib/types";

type FormState = {
  programId: string;
  batchId: string;
  semester: number;
  courseId: string;
  topic: string;
  week: number;
  subTopics: string[];
  totalSlides: number;
  completedSlides: number;
  teacherStatus: "pending" | "current" | "done";
  adminStatus: "Published" | "Draft" | "Archived";
};

const EMPTY_FORM: FormState = {
  programId: "",
  batchId: "",
  semester: 1,
  courseId: "",
  topic: "",
  week: 1,
  subTopics: ["", ""],
  totalSlides: 15,
  completedSlides: 0,
  teacherStatus: "pending",
  adminStatus: "Published",
};

const statusColors = {
  Published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Draft:     "bg-amber-100  text-amber-800  border-amber-200",
  Archived:  "bg-slate-100  text-slate-700  border-slate-200",
};

export default function AdminSyllabusPage() {
  const { 
    syllabusTopics, courses, programs, batches,
    addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic,
    fetchSyllabusTopics, fetchCourses, fetchPrograms, fetchBatches 
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");

  // Hierarchical Filter States: Program -> Batch -> Semester -> Course
  const [selectedProgramId, setSelectedProgramId] = useState<string>("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [actionToast, setActionToast] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSyllabusTopics(),
      fetchCourses(),
      fetchPrograms(),
      fetchBatches()
    ]);
    setLoading(false);
  };

  // Filtered Batches based on Selected Program
  const availableBatches = selectedProgramId === "all"
    ? batches
    : batches.filter((b) => b.programId === selectedProgramId);

  // Filtered Courses based on Selected Program
  const availableCourses = selectedProgramId === "all"
    ? courses
    : courses.filter((c) => c.programId === selectedProgramId);

  // Filtering Logic for Syllabus Topics
  const filteredTopics = syllabusTopics.filter((item) => {
    const course = courses.find((c) => c.id === item.courseId);
    
    // Filter by Program
    if (selectedProgramId !== "all") {
      const topicProgId = item.programId || course?.programId;
      if (topicProgId && topicProgId !== selectedProgramId) return false;
    }

    // Filter by Batch
    if (selectedBatchId !== "all" && item.batchId && item.batchId !== selectedBatchId) {
      return false;
    }

    // Filter by Semester
    if (selectedSemester !== "all") {
      const targetSem = Number(selectedSemester);
      if (item.semester && item.semester !== targetSem) return false;
      // Fallback course code semester mapping (e.g. CSE-101 -> Sem 1, CSE-201 -> Sem 3)
      if (!item.semester && course?.code) {
        const codeNum = parseInt(course.code.replace(/\D/g, ""));
        if (!isNaN(codeNum)) {
          const estimatedSem = Math.min(8, Math.max(1, Math.ceil(codeNum / 50)));
          if (estimatedSem !== targetSem) return false;
        }
      }
    }

    // Filter by Course
    if (selectedCourseId !== "all" && item.courseId !== selectedCourseId) {
      return false;
    }

    // Filter by Keyword Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.topic.toLowerCase().includes(searchLower) ||
      course?.title.toLowerCase().includes(searchLower) ||
      course?.code.toLowerCase().includes(searchLower) ||
      item.subTopics.some((sub) => sub.toLowerCase().includes(searchLower));

    return matchesSearch;
  });

  // Group topics by Course
  const groupedByCourse = courses
    .map((course) => {
      const topics = filteredTopics.filter((t) => t.courseId === course.id);
      const program = programs.find((p) => p.id === course.programId);

      // Estimate semester from course code if needed
      const codeNum = parseInt(course.code.replace(/\D/g, ""));
      const estimatedSemester = !isNaN(codeNum) ? Math.min(8, Math.max(1, Math.ceil(codeNum / 50))) : 1;

      return {
        course,
        program,
        semester: estimatedSemester,
        topics: topics.sort((a, b) => a.week - b.week),
      };
    })
    .filter((group) => group.topics.length > 0);

  // Modal Handlers
  const openAddModal = () => {
    setEditingTopic(null);
    const defaultProg = selectedProgramId !== "all" ? selectedProgramId : programs[0]?.id || "";
    const defaultBatch = selectedBatchId !== "all" ? selectedBatchId : batches[0]?.id || "";
    const defaultCourse = selectedCourseId !== "all" ? selectedCourseId : courses[0]?.id || "";
    const defaultSem = selectedSemester !== "all" ? Number(selectedSemester) : 1;

    setForm({
      ...EMPTY_FORM,
      programId: defaultProg,
      batchId: defaultBatch,
      courseId: defaultCourse,
      semester: defaultSem,
    });
    setIsOpen(true);
  };

  const openEditModal = (item: SyllabusTopic) => {
    setEditingTopic(item);
    const course = courses.find((c) => c.id === item.courseId);
    setForm({
      programId: item.programId || course?.programId || "",
      batchId: item.batchId || "",
      semester: item.semester || 1,
      courseId: item.courseId,
      topic: item.topic,
      week: item.week,
      subTopics: item.subTopics ? [...item.subTopics] : ["", ""],
      totalSlides: item.totalSlides || 15,
      completedSlides: item.completedSlides || 0,
      teacherStatus: item.teacherStatus,
      adminStatus: item.adminStatus,
    });
    setIsOpen(true);
  };

  const handleSaveTopic = () => {
    if (!form.topic || !form.courseId) {
      alert("Please provide both Topic Title and select a Course.");
      return;
    }
    const cleanSubTopics = form.subTopics.filter((t) => t.trim().length > 0);

    const payload = {
      courseId: form.courseId,
      programId: form.programId,
      batchId: form.batchId,
      semester: form.semester,
      topic: form.topic,
      week: form.week,
      subTopics: cleanSubTopics,
      totalSlides: form.totalSlides,
      completedSlides: form.completedSlides,
      teacherStatus: form.teacherStatus,
      adminStatus: form.adminStatus,
    };

    if (editingTopic) {
      updateSyllabusTopic(editingTopic.id, payload);
      setActionToast(`Syllabus topic '${form.topic}' updated successfully!`);
    } else {
      addSyllabusTopic(payload);
      setActionToast(`Syllabus topic '${form.topic}' added successfully!`);
    }

    setIsOpen(false);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete syllabus topic '${title}'?`)) return;
    deleteSyllabusTopic(id);
    setActionToast(`Syllabus topic deleted successfully.`);
    setTimeout(() => setActionToast(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <PageHeader 
        title="Curriculum & Syllabus Management" 
        description="Organize week-by-week course syllabus outlines hierarchically by Program, Batch, Semester, and Course."
      />

      {/* Action Toast Alert */}
      {actionToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Programs</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{programs.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Degree Programs</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Batches</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{batches.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Active Student Batches</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Syllabus Topics</span>
            <BookMarked className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{syllabusTopics.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Defined Modules</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {syllabusTopics.filter((t) => t.adminStatus === "Published").length}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Visible to Faculty</p>
        </div>
      </div>

      {/* ── HIERARCHICAL FILTER BAR (Program ➔ Batch ➔ Semester ➔ Course) ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-brand-dark" /> Hierarchical Syllabus Filters
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredTopics.length}</strong> Topics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Program Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">1. Degree Program</label>
            <select
              value={selectedProgramId}
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
                setSelectedBatchId("all");
                setSelectedCourseId("all");
              }}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-dark"
            >
              <option value="all">All Degree Programs ({programs.length})</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          {/* 2. Batch Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">2. Academic Batch</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-dark"
            >
              <option value="all">All Batches ({availableBatches.length})</option>
              {availableBatches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          {/* 3. Semester Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">3. Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-dark"
            >
              <option value="all">All Semesters (1 to 8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          {/* 4. Course Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">4. Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-dark"
            >
              <option value="all">All Courses ({availableCourses.length})</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic or concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-dark"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 inline-flex text-xs font-semibold">
              <button
                onClick={() => setViewMode("grouped")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === "grouped" ? "bg-white text-slate-900 shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grouped View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Table className="w-3.5 h-3.5" /> Table View
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="px-3.5 py-2 text-xs font-bold text-white bg-brand-dark hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Topic
            </button>
          </div>
        </div>
      </div>

      {/* ── VIEW MODE 1: GROUPED COURSE & SEMESTER ACCORDION ── */}
      {viewMode === "grouped" && (
        <div className="space-y-5">
          {groupedByCourse.length > 0 ? (
            groupedByCourse.map(({ course, program, semester, topics }) => {
              const doneCount = topics.filter((t) => t.teacherStatus === "done").length;
              const progressPct = Math.round((doneCount / topics.length) * 100);

              return (
                <div key={course.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  {/* Course Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs bg-brand-dark/5 text-brand-dark px-2.5 py-0.5 rounded-md border border-brand-dark/10">
                          {course.code}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900">{course.title}</h3>
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 rounded-full">
                          Semester {semester}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Program: <strong className="text-slate-700">{program?.name || "Degree Program"}</strong> | Credits: <strong className="text-slate-700">{course.credits} Credits</strong> | Total Syllabus Modules: <strong className="text-slate-900">{topics.length} Topics</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900">{progressPct}% Complete</span>
                        <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Topics List Table */}
                  <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                        <tr>
                          <th className="py-3 px-4 w-24">Timeline</th>
                          <th className="py-3 px-4">Syllabus Topic Title & Key Concepts</th>
                          <th className="py-3 px-3">Slides</th>
                          <th className="py-3 px-3">Faculty Progress</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {topics.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                              <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200 text-[10px]">
                                Week {item.week}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{item.topic}</div>
                              {item.subTopics && item.subTopics.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {item.subTopics.map((sub, i) => (
                                    <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                      • {sub}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-3 font-semibold text-slate-700">
                              {item.completedSlides || 0} / {item.totalSlides || 15} Slides
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-full ${
                                item.teacherStatus === "done"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : item.teacherStatus === "current"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {item.teacherStatus === "done" ? "Done" : item.teacherStatus === "current" ? "In Progress" : "Pending"}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <StatusBadge status={item.adminStatus} colorMap={statusColors} />
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1.5 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Edit Topic"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.topic)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Syllabus Topics Found</h3>
              <p className="text-xs text-slate-500 mt-1">No topics match the selected Program, Batch, Semester, or Course filters.</p>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW MODE 2: FLAT MASTER TABLE VIEW ── */}
      {viewMode === "table" && (
        <DataTable 
          columns={["Course", "Semester", "Week", "Topic Title & Concepts", "Teacher Status", "Visibility", "Actions"]}
          isEmpty={filteredTopics.length === 0}
          emptyStateIcon={ListTodo}
          emptyStateTitle="No syllabus topics found"
          emptyStateDescription="Click 'Add Topic' to create syllabus outline modules."
        >
          {filteredTopics.map((item) => {
            const course = courses.find((c) => c.id === item.courseId);

            return (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-5 py-4 font-medium">
                  <div className="font-bold text-slate-900">{course?.title || "—"}</div>
                  <div className="text-[10px] font-mono text-brand-dark">{course?.code}</div>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-700 text-xs">
                  Semester {item.semester || 1}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-700 text-xs">
                  Week {item.week}
                </td>
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-900 text-xs">{item.topic}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {item.subTopics.join(", ")}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                    item.teacherStatus === "done" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.teacherStatus}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={item.adminStatus} colorMap={statusColors} />
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-500 hover:text-brand-dark rounded-lg hover:bg-slate-100">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id, item.topic)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}

      {/* ── MODAL: ADD / EDIT SYLLABUS TOPIC ── */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingTopic ? "Edit Syllabus Topic" : "Add Course Syllabus Topic"}
        footer={
          <>
            <button 
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveTopic}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-dark hover:bg-slate-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {editingTopic ? "Update Topic" : "Save Syllabus Topic"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Program & Batch Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Degree Program</label>
              <select 
                value={form.programId}
                onChange={(e) => setForm({ ...form, programId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark"
              >
                <option value="">Select Program...</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Batch Target</label>
              <select 
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark"
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester & Course Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Semester <span className="text-red-500">*</span></label>
              <select 
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Course <span className="text-red-500">*</span></label>
              <select 
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark"
              >
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic Title & Week */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Topic Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. Normalization (1NF–3NF) & Functional Dependencies" 
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-dark" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Week Number</label>
              <input 
                type="number" 
                min={1} 
                max={16}
                value={form.week}
                onChange={(e) => setForm({ ...form, week: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-dark" 
              />
            </div>
          </div>

          {/* Subtopics Checklist */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Key Concepts (Sub-topics Checklist)</label>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, subTopics: [...form.subTopics, ""] })} 
                className="text-xs text-brand-dark hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Concept
              </button>
            </div>

            <div className="space-y-2">
              {form.subTopics.map((sub, i) => (
                <input 
                  key={i} 
                  type="text" 
                  placeholder={`Concept #${i + 1}`} 
                  value={sub} 
                  onChange={(e) => {
                    const newSubs = [...form.subTopics];
                    newSubs[i] = e.target.value;
                    setForm({ ...form, subTopics: newSubs });
                  }} 
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-dark" 
                />
              ))}
            </div>
          </div>

          {/* Slides & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Total Slides</label>
              <input 
                type="number" 
                min={1} 
                value={form.totalSlides}
                onChange={(e) => setForm({ ...form, totalSlides: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-dark" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Admin Status</label>
              <select 
                value={form.adminStatus} 
                onChange={(e) => setForm({ ...form, adminStatus: e.target.value as any })} 
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
