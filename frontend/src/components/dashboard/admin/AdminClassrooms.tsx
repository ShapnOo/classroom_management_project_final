"use client";

import {
  Users, Clock, Play, FolderOpen, ClipboardCheck,
  Search, MoreVertical, CalendarDays, BookOpen, LayoutGrid,
  List as ListIcon, Info, MapPin, ArrowLeft, ArrowRight,
  TrendingUp, Sparkles, Filter, ChevronRight, GraduationCap,
  Layers, CheckCircle2, Bookmark, Check, Calendar, Activity,
  Plus, Edit2, Trash2, User
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Classroom, Batch, ClassroomView } from "@/lib/types";

const CLASSROOM_COLORS = [
  { name: "Teal", color: "bg-teal-600", light: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
  { name: "Indigo", color: "bg-indigo-600", light: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  { name: "Violet", color: "bg-violet-600", light: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
  { name: "Amber", color: "bg-amber-600", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  { name: "Rose", color: "bg-rose-600", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
];

type Form = Omit<Classroom, "id">;

const EMPTY: Form = {
  courseId: "",
  batchId: "",
  teacherId: "",
  semester: "Semester 1",
  room: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  status: "ongoing",
  classesCompleted: 0,
  totalClasses: 24,
  colorIndex: 0,
};

export default function AdminClassrooms() {
  const {
    classrooms, courses, batches, teachers, sessions, programs,
    addClassroom, updateClassroom, deleteClassroom,
    addSchedule, deleteSchedule, getAllClassroomViews,
    fetchClassrooms, fetchCourses, fetchBatches, fetchTeachers, fetchSessions, fetchPrograms, fetchStudents,
    isLoading
  } = useStore();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchTeachers();
    fetchSessions();
    fetchPrograms();
    fetchStudents();
  }, []);

  const allViews: ClassroomView[] = getAllClassroomViews();

  // ── Hierarchical Navigation State: Program -> Batch -> Semester -> Course ──
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [showFlatAll, setShowFlatAll] = useState(false);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  
  // Status Filters
  const [batchStatusFilter, setBatchStatusFilter] = useState<"all" | "running" | "completed" | "upcoming">("all");
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [semesterStatusFilter, setSemesterStatusFilter] = useState<"all" | "running" | "completed" | "upcoming">("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [modalProgramId, setModalProgramId] = useState<string>("");

  const [schedules, setSchedules] = useState<{ id?: string; day: string; startTime: string; endTime: string }[]>([]);

  // Status Resolvers
  const getBatchStatus = (batch: Batch, batchClassrooms: ClassroomView[]): "Running" | "Completed" | "Upcoming" => {
    if (batch.status) {
      const s = batch.status.toLowerCase();
      if (s === "active" || s === "running") return "Running";
      if (s === "completed") return "Completed";
      if (s === "upcoming") return "Upcoming";
    }
    if (batchClassrooms.length > 0) {
      if (batchClassrooms.some((c) => c.classroom.status === "ongoing")) return "Running";
      if (batchClassrooms.every((c) => c.classroom.status === "completed")) return "Completed";
      if (batchClassrooms.every((c) => c.classroom.status === "upcoming")) return "Upcoming";
    }
    return "Running";
  };

  const getSemesterStatus = (
    sem: string,
    semClassrooms: ClassroomView[],
    batch?: Batch | null
  ): "Running" | "Completed" | "Upcoming" => {
    if (semClassrooms.length > 0) {
      if (semClassrooms.some((c) => c.classroom.status === "ongoing")) return "Running";
      if (semClassrooms.every((c) => c.classroom.status === "completed")) return "Completed";
      if (semClassrooms.every((c) => c.classroom.status === "upcoming")) return "Upcoming";
    }
    const match = sem.match(/\d+/);
    const semNum = match ? parseInt(match[0], 10) : 1;
    if (semNum < 5) return "Completed";
    if (semNum === 5 || semNum === 7) return "Running";
    return "Upcoming";
  };

  // Unique Programs from classrooms or store
  const uniquePrograms = useMemo(() => {
    if (programs.length > 0) return programs;
    const pMap = new Map();
    allViews.forEach((c) => {
      if (c.program && !pMap.has(c.program.id)) {
        pMap.set(c.program.id, c.program);
      }
    });
    return Array.from(pMap.values());
  }, [programs, allViews]);

  // Unique Batches filtered by selected program
  const uniqueBatches = useMemo(() => {
    return batches.filter((b) => !selectedProgramId || b.programId === selectedProgramId);
  }, [batches, selectedProgramId]);

  // Filtered Batches based on status & search
  const filteredBatches = useMemo(() => {
    return uniqueBatches.filter((b) => {
      const batchClasses = allViews.filter((c) => c.batch.id === b.id);
      const st = getBatchStatus(b, batchClasses).toLowerCase();
      if (batchStatusFilter === "running" && st !== "running") return false;
      if (batchStatusFilter === "completed" && st !== "completed") return false;
      if (batchStatusFilter === "upcoming" && st !== "upcoming") return false;

      if (batchSearchTerm.trim()) {
        const q = batchSearchTerm.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [uniqueBatches, allViews, batchStatusFilter, batchSearchTerm]);

  // Unique Semesters filtered by selected batch
  const uniqueSemesters = useMemo(() => {
    if (!selectedBatchId) return [];
    const sMap = new Set<string>();
    allViews.forEach((c) => {
      if (c.batch.id === selectedBatchId) {
        sMap.add(c.semester || "Semester 1");
      }
    });
    const selectedB = batches.find((b) => b.id === selectedBatchId);
    const count = selectedB?.semesterCount || 8;
    for (let i = 1; i <= Math.min(count, 8); i++) {
      sMap.add(`Semester ${i}`);
    }
    return Array.from(sMap).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.replace(/\D/g, "")) || 0;
      return numA - numB;
    });
  }, [allViews, selectedBatchId, batches]);

  // Filtered Semesters based on status
  const filteredSemesters = useMemo(() => {
    const batchClasses = allViews.filter((c) => c.batch.id === selectedBatchId);
    return uniqueSemesters.filter((sem) => {
      const semCourses = batchClasses.filter((c) => (c.semester || "Semester 1") === sem);
      const st = getSemesterStatus(sem, semCourses).toLowerCase();
      if (semesterStatusFilter === "running" && st !== "running") return false;
      if (semesterStatusFilter === "completed" && st !== "completed") return false;
      if (semesterStatusFilter === "upcoming" && st !== "upcoming") return false;
      return true;
    });
  }, [uniqueSemesters, allViews, selectedBatchId, semesterStatusFilter]);

  // Selected program and batch entities
  const currentProgram = uniquePrograms.find((p) => p.id === selectedProgramId);
  const currentBatch = batches.find((b) => b.id === selectedBatchId);

  // Filtered classrooms for tier 4 (Courses / Classrooms)
  const filtered = useMemo(() => {
    return allViews.filter((v) => {
      if (!showFlatAll) {
        if (selectedProgramId && v.program.id !== selectedProgramId) return false;
        if (selectedBatchId && v.batch.id !== selectedBatchId) return false;
        if (selectedSemester && selectedSemester !== "all" && v.semester !== selectedSemester) return false;
      }
      const matchSearch =
        v.course.title.toLowerCase().includes(search.toLowerCase()) ||
        v.course.code.toLowerCase().includes(search.toLowerCase()) ||
        v.teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        v.batch.name.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "ongoing" && v.classroom.status === "ongoing") ||
        (statusFilter === "completed" && v.classroom.status === "completed") ||
        (statusFilter === "upcoming" && v.classroom.status === "upcoming");

      return matchSearch && matchStatus;
    });
  }, [allViews, selectedProgramId, selectedBatchId, selectedSemester, search, statusFilter, showFlatAll]);

  const openAdd = () => {
    setEditing(null);
    const initialProgId = selectedProgramId || (programs[0]?.id || "");
    const initialBatchId = selectedBatchId || (batches.find((b) => b.programId === initialProgId)?.id || "");
    const initialSemester = selectedSemester && selectedSemester !== "all" ? selectedSemester : "Semester 1";

    setForm({
      ...EMPTY,
      batchId: initialBatchId,
      semester: initialSemester,
      colorIndex: classrooms.length % CLASSROOM_COLORS.length,
    });
    setModalProgramId(initialProgId);
    setSchedules([{ day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM" }]);
    setIsOpen(true);
  };

  const openEdit = (cls: Classroom) => {
    setEditing(cls);
    const parentBatch = batches.find((b) => b.id === cls.batchId);
    setModalProgramId(parentBatch?.programId || "");
    setForm({
      courseId: cls.courseId,
      batchId: cls.batchId,
      teacherId: cls.teacherId,
      semester: cls.semester || "Semester 1",
      room: cls.room,
      startDate: cls.startDate,
      endDate: cls.endDate,
      status: cls.status,
      classesCompleted: cls.classesCompleted || 0,
      totalClasses: cls.totalClasses,
      colorIndex: cls.colorIndex,
    });
    const cur = allViews.find((v) => v.classroom.id === cls.id);
    setSchedules(cur?.schedules || []);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let clsId: string | undefined;
    if (editing) {
      updateClassroom(editing.id, form);
      clsId = editing.id;
      const cur = allViews.find((v) => v.classroom.id === editing.id);
      cur?.schedules.forEach((s) => s.id && deleteSchedule(s.id));
    } else {
      clsId = addClassroom(form);
    }
    schedules.forEach((s) =>
      addSchedule({ classroomId: clsId!, day: s.day, startTime: s.startTime, endTime: s.endTime, room: form.room })
    );
    setIsOpen(false);
  };

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
            <span className="font-bold text-brand-dark">Flat Directory ({allViews.length} Classrooms)</span>
          </>
        )}
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // VIEW SWITCHER COMPONENT
  // ───────────────────────────────────────────────────────────────────────────
  const renderViewToggle = () => (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
      <button
        type="button"
        onClick={() => setViewMode("list")}
        className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
        }`}
        title="Compact List View"
      >
        <ListIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => setViewMode("grid")}
        className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
        }`}
        title="Card / Grid View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 1: PROGRAM VIEW (If no program is selected and not in flat view)
  // ───────────────────────────────────────────────────────────────────────────
  if (!selectedProgramId && !showFlatAll) {
    return (
      <div className="w-full mx-auto space-y-5 animate-in fade-in duration-300 pb-12">
        {renderBreadcrumbs()}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-dark/10 text-brand-dark uppercase tracking-wider">
                Step 1: Academic Programs
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 mt-1">Classroom Management — Academic Programs</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an academic degree program to manage student batches, semester curricula, and allocated course classrooms.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {renderViewToggle()}

            <button
              type="button"
              onClick={() => setShowFlatAll(true)}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Flat All ({allViews.length})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Classroom
            </button>
          </div>
        </div>

        {/* Compact List or Grid Display */}
        {viewMode === "list" ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-4">Program & Degree</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Batches</th>
                    <th className="py-2.5 px-4">Allocated Classrooms</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uniquePrograms.map((prog) => {
                    const progBatches = batches.filter((b) => b.programId === prog.id);
                    const progClassrooms = allViews.filter((c) => c.program.id === prog.id);
                    const ongoingCount = progClassrooms.filter((c) => c.classroom.status === "ongoing").length;

                    return (
                      <tr
                        key={prog.id}
                        onClick={() => setSelectedProgramId(prog.id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                              {prog.code}
                            </span>
                            <span className="font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                              {prog.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-medium">
                          {prog.duration || "4 Years (8 Semesters)"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-slate-800">{progBatches.length}</span>
                          <span className="text-slate-500 text-[11px] ml-1">Batch{progBatches.length > 1 ? "es" : ""}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-slate-800">{progClassrooms.length}</span>
                          <span className="text-slate-500 text-[11px] ml-1">Classroom{progClassrooms.length > 1 ? "s" : ""}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {ongoingCount} Active Course{ongoingCount > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark group-hover:translate-x-0.5 transition-transform">
                            Select Program <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniquePrograms.map((prog) => {
              const progBatches = batches.filter((b) => b.programId === prog.id);
              const progClassrooms = allViews.filter((c) => c.program.id === prog.id);
              const ongoingCount = progClassrooms.filter((c) => c.classroom.status === "ongoing").length;

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 bg-brand-dark/5 rounded-lg border border-brand-dark/10 group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-5 h-5 text-brand-dark" />
                      </div>
                      <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                        {prog.code}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-1">
                        {prog.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {prog.duration || "4 Years (8 Semesters)"} • Academic Degree Program
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Batches</span>
                        <strong className="text-slate-800 text-xs font-bold">{progBatches.length} Batch{progBatches.length > 1 ? "es" : ""}</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Classrooms</span>
                        <strong className="text-slate-800 text-xs font-bold">{progClassrooms.length} Allocated</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
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
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 2: BATCH VIEW (If Program selected, but Batch not selected)
  // ───────────────────────────────────────────────────────────────────────────
  if (selectedProgramId && !selectedBatchId && !showFlatAll) {
    const runningBatchesCount = uniqueBatches.filter((b) => {
      const cls = allViews.filter((c) => c.batch.id === b.id);
      return getBatchStatus(b, cls) === "Running";
    }).length;
    const completedBatchesCount = uniqueBatches.filter((b) => {
      const cls = allViews.filter((c) => c.batch.id === b.id);
      return getBatchStatus(b, cls) === "Completed";
    }).length;
    const upcomingBatchesCount = uniqueBatches.filter((b) => {
      const cls = allViews.filter((c) => c.batch.id === b.id);
      return getBatchStatus(b, cls) === "Upcoming";
    }).length;

    return (
      <div className="w-full mx-auto space-y-4 animate-in fade-in duration-300 pb-12">
        {renderBreadcrumbs()}

        {/* Level Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
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
              <h1 className="text-base font-bold text-slate-900 mt-1">Select Batch in {currentProgram?.code}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter by academic status and select a batch to manage its semester classrooms and allocations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {renderViewToggle()}

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Classroom
            </button>
          </div>
        </div>

        {/* Filter Pills & Search Bar for Batches */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Batches", count: uniqueBatches.length },
              { id: "running", label: "Running", count: runningBatchesCount },
              { id: "completed", label: "Completed", count: completedBatchesCount },
              { id: "upcoming", label: "Upcoming", count: upcomingBatchesCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBatchStatusFilter(tab.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  batchStatusFilter === tab.id
                    ? "bg-brand-dark text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch code/name..."
              value={batchSearchTerm}
              onChange={(e) => setBatchSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-dark placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Compact List or Grid Display */}
        {viewMode === "list" ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-4">Batch Code & Section</th>
                    <th className="py-2.5 px-4">Batch Title</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Curriculum Semesters</th>
                    <th className="py-2.5 px-4">Allocated Classrooms</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map((batch) => {
                    const batchClasses = allViews.filter((c) => c.batch.id === batch.id);
                    const ongoingCount = batchClasses.filter((c) => c.classroom.status === "ongoing").length;
                    const st = getBatchStatus(batch, batchClasses);

                    return (
                      <tr
                        key={batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
                              {batch.code}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700">Section {batch.section || "A"}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                          {batch.name}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1.5 ${
                              st === "Running"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : st === "Completed"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {st === "Running" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {st}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-semibold">
                          {batch.semesterCount || 8} Semesters
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-slate-800">{batchClasses.length} Classroom{batchClasses.length > 1 ? "s" : ""}</span>
                          {ongoingCount > 0 && (
                            <span className="text-[11px] text-emerald-600 font-medium ml-1">({ongoingCount} active)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark group-hover:translate-x-0.5 transition-transform">
                            Select Batch <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches.map((batch) => {
              const batchClasses = allViews.filter((c) => c.batch.id === batch.id);
              const ongoingCount = batchClasses.filter((c) => c.classroom.status === "ongoing").length;
              const st = getBatchStatus(batch, batchClasses);

              return (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatchId(batch.id)}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            st === "Running"
                              ? "bg-emerald-50 text-emerald-700"
                              : st === "Completed"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {st === "Running" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {st}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
                          {batch.code}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors line-clamp-1">
                        {batch.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Section {batch.section || "A"} • {st} Academic Batch
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Semesters</span>
                        <strong className="text-slate-800 text-xs font-bold">{batch.semesterCount || 8} Semesters</strong>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Allocated Courses</span>
                        <strong className="text-slate-800 text-xs font-bold">{batchClasses.length} Classroom{batchClasses.length > 1 ? "s" : ""}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
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
        )}

        {filteredBatches.length === 0 && (
          <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">No Batches Found</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Try selecting another status tab or clear your search.</p>
          </div>
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: SEMESTER VIEW (If Program and Batch selected, but Semester not selected)
  // ───────────────────────────────────────────────────────────────────────────
  if (selectedProgramId && selectedBatchId && !selectedSemester && !showFlatAll) {
    const batchClasses = allViews.filter((c) => c.batch.id === selectedBatchId);
    const runningSemestersCount = uniqueSemesters.filter((sem) => {
      const cls = batchClasses.filter((c) => (c.semester || "Semester 1") === sem);
      return getSemesterStatus(sem, cls) === "Running";
    }).length;
    const completedSemestersCount = uniqueSemesters.filter((sem) => {
      const cls = batchClasses.filter((c) => (c.semester || "Semester 1") === sem);
      return getSemesterStatus(sem, cls) === "Completed";
    }).length;
    const upcomingSemestersCount = uniqueSemesters.filter((sem) => {
      const cls = batchClasses.filter((c) => (c.semester || "Semester 1") === sem);
      return getSemesterStatus(sem, cls) === "Upcoming";
    }).length;

    return (
      <div className="w-full mx-auto space-y-4 animate-in fade-in duration-300 pb-12">
        {renderBreadcrumbs()}

        {/* Level Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
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
              <h1 className="text-base font-bold text-slate-900 mt-1">Select Academic Semester</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter by status (Running, Completed, Upcoming) to manage allocated courses, schedule slots, and teacher allocations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {renderViewToggle()}

            <button
              type="button"
              onClick={() => setSelectedSemester("all")}
              className="px-3 py-1.5 bg-brand-dark text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800"
            >
              <span>View All Semesters ({batchClasses.length} Courses)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Classroom
            </button>
          </div>
        </div>

        {/* Status Filter Tabs for Semesters */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-50/70 p-2 rounded-xl border border-slate-200/80">
          {[
            { id: "all", label: "All Semesters", count: uniqueSemesters.length },
            { id: "running", label: "Running", count: runningSemestersCount },
            { id: "completed", label: "Completed", count: completedSemestersCount },
            { id: "upcoming", label: "Upcoming", count: upcomingSemestersCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSemesterStatusFilter(tab.id as any)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                semesterStatusFilter === tab.id
                  ? "bg-brand-dark text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Compact List or Grid Display */}
        {viewMode === "list" ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-4">Curriculum Semester</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Credits</th>
                    <th className="py-2.5 px-4">Allocated Courses Preview</th>
                    <th className="py-2.5 px-4">Active Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSemesters.map((sem) => {
                    const semCourses = batchClasses.filter((c) => (c.semester || "Semester 1") === sem);
                    const totalCredits = semCourses.reduce((acc, c) => acc + Number(c.course.credits || 3), 0);
                    const ongoingCount = semCourses.filter((c) => c.classroom.status === "ongoing").length;
                    const st = getSemesterStatus(sem, semCourses);

                    return (
                      <tr
                        key={sem}
                        onClick={() => setSelectedSemester(sem)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-amber-50 rounded-md border border-amber-200/60 text-amber-600">
                              <Bookmark className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                              {sem}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1.5 ${
                              st === "Running"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : st === "Completed"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {st === "Running" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {st}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-700">
                          {semCourses.length > 0 ? `${totalCredits} Credits` : "Available"}
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center flex-wrap gap-1">
                            {semCourses.length > 0 ? (
                              semCourses.map((c) => (
                                <span
                                  key={c.classroom.id}
                                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 text-[10px] font-mono font-bold text-slate-700"
                                  title={c.course.title}
                                >
                                  {c.course.code}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No courses allocated yet</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {ongoingCount} Active Course{ongoingCount > 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-dark group-hover:translate-x-0.5 transition-transform">
                            Enter Semester <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSemesters.map((sem) => {
              const semCourses = batchClasses.filter((c) => (c.semester || "Semester 1") === sem);
              const totalCredits = semCourses.reduce((acc, c) => acc + Number(c.course.credits || 3), 0);
              const ongoingCount = semCourses.filter((c) => c.classroom.status === "ongoing").length;
              const st = getSemesterStatus(sem, semCourses);

              return (
                <div
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2 bg-amber-50/80 rounded-lg border border-amber-200/60 group-hover:scale-105 transition-transform">
                        <Bookmark className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            st === "Running"
                              ? "bg-emerald-50 text-emerald-700"
                              : st === "Completed"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {st === "Running" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {st}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {semCourses.length > 0 ? `${totalCredits} Credits` : "Available"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                        {sem}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {semCourses.length} Classroom{semCourses.length > 1 ? "s" : ""} allocated
                      </p>
                    </div>

                    {/* Course Previews in this Semester */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      {semCourses.length > 0 ? (
                        semCourses.map((c) => (
                          <div key={c.classroom.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 px-2 rounded-md border border-slate-100">
                            <span className="font-bold text-slate-800">{c.course.code}</span>
                            <span className="text-slate-500 truncate max-w-[150px]">{c.course.title}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic py-1">No courses allocated yet in this semester.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
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
        )}

        {filteredSemesters.length === 0 && (
          <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">No Semesters Found</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Try selecting another status tab (Running / All).</p>
          </div>
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 4: COURSES / CLASSROOMS VIEW (Final level under Program -> Batch -> Semester)
  // ───────────────────────────────────────────────────────────────────────────
  const runningCoursesCount = allViews.filter((v) => {
    if (!showFlatAll) {
      if (selectedProgramId && v.program.id !== selectedProgramId) return false;
      if (selectedBatchId && v.batch.id !== selectedBatchId) return false;
      if (selectedSemester && selectedSemester !== "all" && v.semester !== selectedSemester) return false;
    }
    return v.classroom.status === "ongoing";
  }).length;

  const completedCoursesCount = allViews.filter((v) => {
    if (!showFlatAll) {
      if (selectedProgramId && v.program.id !== selectedProgramId) return false;
      if (selectedBatchId && v.batch.id !== selectedBatchId) return false;
      if (selectedSemester && selectedSemester !== "all" && v.semester !== selectedSemester) return false;
    }
    return v.classroom.status === "completed";
  }).length;

  const upcomingCoursesCount = allViews.filter((v) => {
    if (!showFlatAll) {
      if (selectedProgramId && v.program.id !== selectedProgramId) return false;
      if (selectedBatchId && v.batch.id !== selectedBatchId) return false;
      if (selectedSemester && selectedSemester !== "all" && v.semester !== selectedSemester) return false;
    }
    return v.classroom.status === "upcoming";
  }).length;

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
                Step 4: Courses & Classrooms ({filtered.length})
              </span>
              {currentBatch && (
                <span className="text-xs text-slate-500 font-semibold">• {currentBatch.code}</span>
              )}
            </div>
            <h1 className="text-sm font-bold text-slate-900 mt-0.5">
              {showFlatAll
                ? "All Classrooms Across University"
                : `${selectedSemester === "all" ? "All Semesters" : selectedSemester} Courses in ${currentBatch?.name || "Batch"}`}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Admin manages classroom allocations by linking Course + Batch + Teacher + Room + Timetable.
            </p>
          </div>
        </div>

        {/* View Toggle & Add Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {renderViewToggle()}

          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> New Classroom
          </button>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center flex-wrap gap-1.5">
          {[
            { id: "all", label: "All Courses", count: filtered.length },
            { id: "ongoing", label: "Running / Ongoing", count: runningCoursesCount },
            { id: "completed", label: "Completed", count: completedCoursesCount },
            { id: "upcoming", label: "Upcoming", count: upcomingCoursesCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-brand-dark text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search classroom, course, teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-dark placeholder:text-slate-400 shadow-2xs"
          />
        </div>
      </div>

      {/* Compact List or Grid Display */}
      {viewMode === "list" ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-4">Course Info</th>
                  <th className="py-2.5 px-4">Semester & Batch</th>
                  <th className="py-2.5 px-4">Instructor</th>
                  <th className="py-2.5 px-4">Room & Schedule</th>
                  <th className="py-2.5 px-4">Progress</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Students</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ classroom: cls, course, batch, teacher, schedules, students: batchStudents, progress, semester }) => {
                  const isOngoing = cls.status === "ongoing";
                  const isCompleted = cls.status === "completed";

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{course.title}</div>
                        <div className="text-[11px] font-mono text-brand-dark font-semibold">
                          {course.code} • {course.credits} Credits
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-slate-800">{semester}</span>
                        <div className="text-[11px] text-slate-500">{batch.name}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800">{teacher.name}</div>
                        <div className="text-[10px] text-slate-400">{teacher.designation}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">{cls.room}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {schedules.length > 0 ? `${schedules[0].day} • ${schedules[0].startTime}` : "None"}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-brand-dark h-full rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="font-bold text-slate-700 text-[11px]">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1 ${
                            isOngoing
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : isCompleted
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700 border border-amber-200/60"
                          }`}
                        >
                          {isOngoing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {cls.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-700">
                        {batchStudents.length}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(cls)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteClassroom(cls.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/dashboard/admin/academic/classrooms/${cls.id}`}
                            className="px-2.5 py-1 bg-brand-dark text-white rounded-lg font-bold text-[11px] hover:bg-slate-800 shadow-xs inline-flex items-center gap-1 transition-all"
                          >
                            Manage
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ classroom: cls, course, batch, teacher, schedules, students: batchStudents, colors, progress, semester }) => (
            <div
              key={cls.id}
              className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all group ${
                cls.status === "completed"
                  ? "border-slate-200/60 opacity-80"
                  : "border-slate-200 hover:border-brand-dark/40 hover:shadow-md"
              }`}
            >
              <div>
                <div className={`h-1.5 w-full ${cls.status === "completed" ? "bg-slate-300" : colors.color}`} />
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors.light} ${colors.text}`}>
                          {course.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {semester}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-brand-dark transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(cls)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Classroom"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteClassroom(cls.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Classroom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{teacher.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{batch.name} • <strong>{batchStudents.length}</strong> students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-[11px]">
                        {schedules.length > 0
                          ? `${[...new Set(schedules.map((s) => s.day.slice(0, 3)))].join(", ")} • ${schedules[0].startTime}`
                          : "No schedule set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cls.room}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-slate-500">Syllabus Progress</span>
                      <span className="font-bold text-slate-800">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cls.status === "completed" ? "bg-slate-400" : colors.color} rounded-full transition-all`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-600">
                  {cls.classesCompleted} / {cls.totalClasses} classes
                </span>
                <Link
                  href={`/dashboard/admin/academic/classrooms/${cls.id}`}
                  className="px-3 py-1 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-slate-800">No Classrooms Found</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your search query or status filter.</p>
        </div>
      )}

      {/* Modal for Creating / Editing Classroom */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? "Edit Classroom" : "Create New Classroom"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step A: Academic Program */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Academic Degree Program <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={modalProgramId}
                onChange={(e) => {
                  const newProgId = e.target.value;
                  setModalProgramId(newProgId);
                  const firstBatch = batches.find((b) => b.programId === newProgId);
                  setForm((f) => ({ ...f, batchId: firstBatch?.id || "", courseId: "" }));
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white font-medium shadow-2xs"
              >
                <option value="">Select Degree Program...</option>
                {uniquePrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Step B: Batch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Student Batch <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.batchId}
                onChange={(e) => setForm((f) => ({ ...f, batchId: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white font-medium shadow-2xs"
              >
                <option value="">Select Batch...</option>
                {batches
                  .filter((b) => !modalProgramId || b.programId === modalProgramId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) — Sec {b.section || "A"}
                    </option>
                  ))}
              </select>
            </div>

            {/* Step C: Curriculum Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Curriculum Semester <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.semester || "Semester 1"}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white font-medium shadow-2xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={`Semester ${s}`}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Step D: Course */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. Course / Subject <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.courseId}
                onChange={(e) => {
                  const cId = e.target.value;
                  const foundCourse = courses.find((c) => c.id === cId);
                  setForm((f) => ({
                    ...f,
                    courseId: cId,
                    semester: foundCourse?.semester || f.semester || "Semester 1",
                  }));
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white font-medium shadow-2xs"
              >
                <option value="">Select Course...</option>
                {courses
                  .filter((c) => !modalProgramId || c.programId === modalProgramId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title} ({c.credits} Cr) [{c.semester || "Semester 1"}]
                    </option>
                  ))}
              </select>
            </div>

            {/* Step E: Teacher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. Assigned Teacher / Instructor <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.teacherId}
                onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white font-medium shadow-2xs"
              >
                <option value="">Select Teacher...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.designation})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6. Lecture Hall / Room Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Room 402 (CSE Dept)"
                value={form.room}
                onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white"
              >
                <option value="ongoing">Ongoing</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Classes</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.totalClasses}
                onChange={(e) => setForm((f) => ({ ...f, totalClasses: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Theme Tag</label>
              <select
                value={form.colorIndex}
                onChange={(e) => setForm((f) => ({ ...f, colorIndex: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark bg-white"
              >
                {CLASSROOM_COLORS.map((col, idx) => (
                  <option key={col.name} value={idx}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timetable Schedules Section */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Weekly Class Timetable Slots
              </label>
              <button
                type="button"
                onClick={() => setSchedules([...schedules, { day: "Sunday", startTime: "10:00 AM", endTime: "11:30 AM" }])}
                className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </div>

            {schedules.map((sch, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <select
                  value={sch.day}
                  onChange={(e) => {
                    const next = [...schedules];
                    next[idx].day = e.target.value;
                    setSchedules(next);
                  }}
                  className="px-2 py-1 border border-slate-200 rounded bg-white font-medium"
                >
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Start Time (e.g. 10:00 AM)"
                  value={sch.startTime}
                  onChange={(e) => {
                    const next = [...schedules];
                    next[idx].startTime = e.target.value;
                    setSchedules(next);
                  }}
                  className="px-2 py-1 border border-slate-200 rounded bg-white flex-1"
                />

                <span className="text-slate-400">to</span>

                <input
                  type="text"
                  placeholder="End Time (e.g. 11:30 AM)"
                  value={sch.endTime}
                  onChange={(e) => {
                    const next = [...schedules];
                    next[idx].endTime = e.target.value;
                    setSchedules(next);
                  }}
                  className="px-2 py-1 border border-slate-200 rounded bg-white flex-1"
                />

                <button
                  type="button"
                  onClick={() => setSchedules(schedules.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
            >
              {editing ? "Save Changes" : "Create Classroom"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
