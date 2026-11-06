"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, MoreVertical, CalendarDays, BookOpen, LayoutGrid,
  List as ListIcon, Info, MapPin, ArrowLeft, ArrowRight,
  TrendingUp, Sparkles, Filter, ChevronRight, GraduationCap,
  Layers, CheckCircle2, Bookmark, Check
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { GridSkeleton } from "@/components/ui/Skeleton";

export default function TeacherClassrooms() {
  const {
    getMyClassroomViews, isLoading,
    fetchClassrooms, fetchCourses, fetchBatches, fetchSessions, fetchPrograms,
    fetchSchedules, fetchStudents, fetchSyllabusTopics,
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchSessions();
    fetchPrograms();
    fetchSchedules();
    fetchStudents();
    fetchSyllabusTopics();
  }, []);

  const myClassrooms = getMyClassroomViews();

  // ── Hierarchical Navigation State: Program -> Batch -> Semester -> Course ──
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFlatAll, setShowFlatAll] = useState(false);

  // Unique Programs from assigned classrooms
  const uniquePrograms = useMemo(() => {
    const pMap = new Map();
    myClassrooms.forEach((c) => {
      if (c.program && !pMap.has(c.program.id)) {
        pMap.set(c.program.id, c.program);
      }
    });
    return Array.from(pMap.values());
  }, [myClassrooms]);

  // Unique Batches filtered by selected program
  const uniqueBatches = useMemo(() => {
    const bMap = new Map();
    myClassrooms.forEach((c) => {
      if (c.batch && !bMap.has(c.batch.id)) {
        if (!selectedProgramId || c.program.id === selectedProgramId) {
          bMap.set(c.batch.id, c.batch);
        }
      }
    });
    return Array.from(bMap.values());
  }, [myClassrooms, selectedProgramId]);

  // Unique Semesters filtered by selected batch
  const uniqueSemesters = useMemo(() => {
    if (!selectedBatchId) return [];
    const sMap = new Set<string>();
    myClassrooms.forEach((c) => {
      if (c.batch.id === selectedBatchId) {
        sMap.add(c.semester || "Semester 1");
      }
    });
    // Sort semesters naturally
    const sorted = Array.from(sMap).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
    return sorted;
  }, [myClassrooms, selectedBatchId]);

  // Selected entities for breadcrumb and header context
  const currentProgram = uniquePrograms.find((p) => p.id === selectedProgramId);
  const currentBatch = uniqueBatches.find((b) => b.id === selectedBatchId);

  // Final filtered classrooms for Course list (Tier 4)
  const filteredClassrooms = useMemo(() => {
    return myClassrooms.filter((v) => {
      if (!showFlatAll) {
        if (selectedProgramId && v.program.id !== selectedProgramId) return false;
        if (selectedBatchId && v.batch.id !== selectedBatchId) return false;
        if (selectedSemester && selectedSemester !== "all" && v.semester !== selectedSemester) return false;
      }
      const matchSearch =
        v.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.program.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || v.classroom.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [myClassrooms, selectedProgramId, selectedBatchId, selectedSemester, searchTerm, statusFilter, showFlatAll]);

  if (isLoading && myClassrooms.length === 0) {
    return <GridSkeleton count={6} />;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TOP BREADCRUMB COMPONENT
  // ───────────────────────────────────────────────────────────────────────────
  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2">
        <button
          type="button"
          onClick={() => {
            setSelectedProgramId(null);
            setSelectedBatchId(null);
            setSelectedSemester(null);
            setShowFlatAll(false);
          }}
          className={`font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
            !selectedProgramId && !showFlatAll ? "text-brand-dark font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Programs</span>
        </button>

        {selectedProgramId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => {
                setSelectedBatchId(null);
                setSelectedSemester(null);
                setShowFlatAll(false);
              }}
              className={`font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                !selectedBatchId && !showFlatAll ? "text-brand-dark font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currentProgram?.code || "Program"}</span>
            </button>
          </>
        )}

        {selectedBatchId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => {
                setSelectedSemester(null);
                setShowFlatAll(false);
              }}
              className={`font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                !selectedSemester && !showFlatAll ? "text-brand-dark font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{currentBatch?.code || "Batch"}</span>
            </button>
          </>
        )}

        {selectedSemester && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-brand-dark flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>{selectedSemester === "all" ? "All Semesters" : selectedSemester}</span>
            </span>
          </>
        )}

        {showFlatAll && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-brand-dark">Flat Directory ({myClassrooms.length} Classrooms)</span>
          </>
        )}
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 1: PROGRAM VIEW (If no program is selected and not in flat view)
  // ───────────────────────────────────────────────────────────────────────────
  if (!selectedProgramId && !showFlatAll) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-12">
        {renderBreadcrumbs()}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-dark/10 text-brand-dark uppercase tracking-wider">
                Step 1: Academic Programs
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">Select Academic Program</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose a degree program to inspect assigned student batches, curriculum semesters, and course classrooms.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="Grid / Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFlatAll(true)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>View Flat All ({myClassrooms.length})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniquePrograms.map((prog) => {
            const progClassrooms = myClassrooms.filter((c) => c.program.id === prog.id);
            const progBatches = Array.from(new Set(progClassrooms.map((c) => c.batch.id)));
            const totalStudents = progClassrooms.reduce((acc, c) => acc + (c.studentCount || 0), 0);
            const ongoingCount = progClassrooms.filter((c) => c.classroom.status === "ongoing").length;

            return (
              <div
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 bg-brand-dark/5 rounded-xl border border-brand-dark/10 group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-6 h-6 text-brand-dark" />
                    </div>
                    <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                      {prog.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-1">
                      {prog.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {prog.duration || "4 Years (8 Semesters)"} • Academic Degree
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Enrolled Batches</span>
                      <strong className="text-slate-800 text-xs font-bold">{progBatches.length} Batch{progBatches.length > 1 ? "es" : ""}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Courses</span>
                      <strong className="text-slate-800 text-xs font-bold">{progClassrooms.length} Classroom{progClassrooms.length > 1 ? "s" : ""}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {ongoingCount} Active Course{ongoingCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-bold text-brand-dark group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Select Program <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 2: BATCH VIEW (If Program selected, but Batch not selected)
  // ───────────────────────────────────────────────────────────────────────────
  if (selectedProgramId && !selectedBatchId && !showFlatAll) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-12">
        {renderBreadcrumbs()}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedProgramId(null)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Back to Programs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-dark/10 text-brand-dark uppercase tracking-wider">
                  Step 2: Program Batches
                </span>
                <span className="text-xs text-slate-500 font-semibold">• {currentProgram?.name}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">Select Batch in {currentProgram?.code}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an academic batch to explore its semesters and assigned subject classrooms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowFlatAll(true)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>View All Program Courses</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueBatches.map((batch) => {
            const batchClasses = myClassrooms.filter((c) => c.batch.id === batch.id);
            const totalStudents = batchClasses[0]?.studentCount || 42;
            const ongoingCount = batchClasses.filter((c) => c.classroom.status === "ongoing").length;
            const batchSemesters = Array.from(new Set(batchClasses.map((c) => c.semester || "Semester 1")));

            return (
              <div
                key={batch.id}
                onClick={() => setSelectedBatchId(batch.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 group-hover:scale-105 transition-transform">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
                      {batch.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-1">
                      {batch.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Section {batch.section || "A"} • {batch.status || "Active"} Academic Batch
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Semesters</span>
                      <strong className="text-slate-800 text-xs font-bold">{batchSemesters.length} Semester{batchSemesters.length > 1 ? "s" : ""}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Assigned Courses</span>
                      <strong className="text-slate-800 text-xs font-bold">{batchClasses.length} Course{batchClasses.length > 1 ? "s" : ""}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {ongoingCount} Active Course{ongoingCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-bold text-brand-dark group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Select Batch <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: SEMESTER VIEW (If Program and Batch selected, but Semester not selected)
  // ───────────────────────────────────────────────────────────────────────────
  if (selectedProgramId && selectedBatchId && !selectedSemester && !showFlatAll) {
    const batchClasses = myClassrooms.filter((c) => c.batch.id === selectedBatchId);

    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-12">
        {renderBreadcrumbs()}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedBatchId(null)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Back to Batches"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-dark/10 text-brand-dark uppercase tracking-wider">
                  Step 3: Curriculum Semesters
                </span>
                <span className="text-xs text-slate-500 font-semibold">• {currentBatch?.name}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">Select Academic Semester</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a semester to see assigned subjects, classrooms, schedule slots, and syllabus topics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedSemester("all")}
              className="px-3.5 py-1.5 bg-brand-dark text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer hover:bg-slate-800"
            >
              <span>View All Semesters ({batchClasses.length} Courses)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Semesters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueSemesters.map((sem) => {
            const semCourses = batchClasses.filter((c) => (c.semester || "Semester 1") === sem);
            const totalCredits = semCourses.reduce((acc, c) => acc + Number(c.course.credits || 3), 0);
            const ongoingCount = semCourses.filter((c) => c.classroom.status === "ongoing").length;

            return (
              <div
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 group-hover:scale-105 transition-transform">
                      <Bookmark className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {totalCredits} Credits
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                      {sem}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curriculum Level • {semCourses.length} Assigned Course{semCourses.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Course Previews in this Semester */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {semCourses.map((c) => (
                      <div key={c.classroom.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 px-2.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-800">{c.course.code}</span>
                        <span className="text-slate-500 truncate max-w-[160px]">{c.course.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {ongoingCount} Active Course{ongoingCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-bold text-brand-dark group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Enter Semester <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 4: COURSES / CLASSROOMS VIEW (Final level under Program -> Batch -> Semester)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full mx-auto space-y-4 pb-8 relative animate-in fade-in duration-300">
      {renderBreadcrumbs()}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {!showFlatAll && (
            <button
              type="button"
              onClick={() => setSelectedSemester(null)}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Back to Semesters"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-dark/10 text-brand-dark uppercase tracking-wider">
                Step 4: Assigned Courses ({filteredClassrooms.length})
              </span>
              {currentBatch && (
                <span className="text-xs text-slate-500 font-semibold">• {currentBatch.code}</span>
              )}
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-0.5">
              {showFlatAll
                ? "All My Assigned Classrooms"
                : `${selectedSemester === "all" ? "All Semesters" : selectedSemester} Courses in ${currentBatch?.name || "Batch"}`}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Click &quot;Enter Classroom&quot; to manage syllabus, live sessions, materials, and student grades.
            </p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-dark placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-brand-dark shadow-2xs cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="Grid / Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid or List Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassrooms.map((v) => {
            const isOngoing = v.classroom.status === "ongoing";
            const isCompleted = v.classroom.status === "completed";

            return (
              <div
                key={v.classroom.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                        {v.course.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {v.semester}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isOngoing
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : isCompleted
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-50 text-amber-700 border border-amber-200/60"
                      }`}
                    >
                      {v.classroom.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-1">
                      {v.course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {v.batch.name} • {v.program.code}
                    </p>
                  </div>

                  {/* Room & Schedule */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{v.classroom.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{v.scheduleLabel || "Mon, Wed • 10:00 AM"}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Syllabus Covered</span>
                      <strong className="text-slate-800 font-bold">{v.progress}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-dark h-full rounded-full transition-all duration-300"
                        style={{ width: `${v.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.studentCount} Students</span>
                  </div>

                  <Link
                    href={`/dashboard/teacher/classrooms/${v.classroom.id}`}
                    className="px-3.5 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Enter Classroom</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Course Info</th>
                  <th className="py-3 px-4">Semester & Batch</th>
                  <th className="py-3 px-4">Room & Timetable</th>
                  <th className="py-3 px-4">Syllabus Progress</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassrooms.map((v) => (
                  <tr key={v.classroom.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{v.course.title}</div>
                      <div className="text-[11px] font-mono text-brand-dark font-semibold">{v.course.code} • {v.course.credits} Credits</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{v.semester}</span>
                      <div className="text-[11px] text-slate-500">{v.batch.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{v.classroom.room}</div>
                      <div className="text-[11px] font-mono text-slate-400">{v.scheduleLabel}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-dark h-full rounded-full" style={{ width: `${v.progress}%` }} />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px]">{v.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {v.studentCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/teacher/classrooms/${v.classroom.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-dark text-white rounded-lg font-bold text-[11px] hover:bg-slate-800 shadow-xs"
                      >
                        Enter
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredClassrooms.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Classrooms Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or select a different semester.</p>
        </div>
      )}
    </div>
  );
}
