"use client";

import {
  Users, Clock, CalendarDays, MapPin, BookOpen, LayoutGrid,
  List as ListIcon, Search, TrendingUp, ArrowRight, User,
  Plus, Trash2, Edit2, X, ArrowLeft, GraduationCap, Layers,
  Bookmark, ChevronRight, Check
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import type { Classroom } from "@/lib/types";
import { CLASSROOM_COLORS } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

type Form = Omit<Classroom, "id">;
const EMPTY: Form = {
  courseId: "", batchId: "", teacherId: "", room: "",
  startDate: "", endDate: "", status: "upcoming",
  classesCompleted: 0, totalClasses: 24, colorIndex: 0,
  semester: "Semester 1",
};

export default function AdminClassrooms() {
  const {
    classrooms, courses, batches, sessions, teachers, students, programs,
    addClassroom, updateClassroom, deleteClassroom,
    addSchedule, deleteSchedule,
    schedules: allSchedules,
    fetchClassrooms, fetchCourses, fetchBatches, fetchSessions, fetchTeachers, fetchPrograms, fetchSchedules
  } = useStore();
  const allViews = useStore().getAllClassroomViews();

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    fetchBatches();
    fetchSessions();
    fetchTeachers();
    fetchPrograms();
    fetchSchedules();
  }, []);

  // ── Hierarchical Navigation State: Program -> Batch -> Semester -> Course ──
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [showFlatAll, setShowFlatAll] = useState(false);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [modalProgramId, setModalProgramId] = useState<string>("");

  const [schedules, setSchedules] = useState<{ id?: string; day: string; startTime: string; endTime: string }[]>([]);

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

  // Unique Semesters filtered by selected batch
  const uniqueSemesters = useMemo(() => {
    if (!selectedBatchId) return [];
    const sMap = new Set<string>();
    allViews.forEach((c) => {
      if (c.batch.id === selectedBatchId) {
        sMap.add(c.semester || "Semester 1");
      }
    });
    // Add standard 8 semesters for completeness
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
      const matchStatus = statusFilter === "all" || v.classroom.status === statusFilter;
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
    const batch = batches.find((b) => b.id === cls.batchId);
    const progId = batch?.programId || "";
    setModalProgramId(progId);
    setForm({
      courseId: cls.courseId,
      batchId: cls.batchId,
      teacherId: cls.teacherId,
      room: cls.room,
      startDate: cls.startDate,
      endDate: cls.endDate,
      status: cls.status,
      classesCompleted: cls.classesCompleted,
      totalClasses: cls.totalClasses,
      colorIndex: cls.colorIndex,
      semester: cls.semester || "Semester 1",
    });
    const clsSchedules = allSchedules.filter((s) => s.classroomId === cls.id);
    setSchedules(clsSchedules.map((s) => ({ id: s.id, day: s.day, startTime: s.startTime, endTime: s.endTime })));
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.courseId || !form.batchId || !form.teacherId || !form.room) return;
    let clsId = editing?.id;
    if (editing) {
      updateClassroom(editing.id, form);
      const oldSchedules = allSchedules.filter((s) => s.classroomId === editing.id);
      oldSchedules.forEach((s) => deleteSchedule(s.id));
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
  // TIER 1: PROGRAM VIEW (If no program is selected and not in flat view)
  // ───────────────────────────────────────────────────────────────────────────
  if (!selectedProgramId && !showFlatAll) {
    return (
      <div className="w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
        {renderBreadcrumbs()}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
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
            <button
              type="button"
              onClick={() => setShowFlatAll(true)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-brand-dark/40 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>View Flat All ({allViews.length})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-dark text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Classroom
            </button>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniquePrograms.map((prog) => {
            const progBatches = batches.filter((b) => b.programId === prog.id);
            const progClassrooms = allViews.filter((c) => c.program.id === prog.id);
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
                      {prog.duration || "4 Years (8 Semesters)"} • Academic Degree Program
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Batches</span>
                      <strong className="text-slate-800 text-xs font-bold">{progBatches.length} Batch{progBatches.length > 1 ? "es" : ""}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Classrooms</span>
                      <strong className="text-slate-800 text-xs font-bold">{progClassrooms.length} Allocated</strong>
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
      <div className="w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
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
              <h1 className="text-base font-bold text-slate-900 mt-1">Select Batch in {currentProgram?.code}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an academic batch to explore its semesters and assigned subject classrooms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-dark text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Classroom
            </button>
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueBatches.map((batch) => {
            const batchClasses = allViews.filter((c) => c.batch.id === batch.id);
            const totalStudents = batchClasses[0]?.studentCount || 42;
            const ongoingCount = batchClasses.filter((c) => c.classroom.status === "ongoing").length;
            const session = sessions.find((s) => s.id === batch.sessionId);

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
                      Section {batch.section || "A"} • {session?.name || "Academic Session"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Semesters</span>
                      <strong className="text-slate-800 text-xs font-bold">{batch.semesterCount || 8} Semesters</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Allocated Courses</span>
                      <strong className="text-slate-800 text-xs font-bold">{batchClasses.length} Classroom{batchClasses.length > 1 ? "s" : ""}</strong>
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
    const batchClasses = allViews.filter((c) => c.batch.id === selectedBatchId);

    return (
      <div className="w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
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
              <h1 className="text-base font-bold text-slate-900 mt-1">Select Academic Semester</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a semester to see assigned subjects, classrooms, schedule slots, and teacher allocations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedSemester("all")}
              className="px-3.5 py-1.5 bg-brand-dark text-white text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer hover:bg-slate-800"
            >
              <span>View All Semesters ({batchClasses.length} Courses)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-dark text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Classroom
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
                      {semCourses.length > 0 ? `${totalCredits} Credits` : "Available"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-dark transition-colors">
                      {sem}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {semCourses.length} Classroom{semCourses.length > 1 ? "s" : ""} allocated
                    </p>
                  </div>

                  {/* Course Previews in this Semester */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {semCourses.length > 0 ? (
                      semCourses.map((c) => (
                        <div key={c.classroom.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 px-2.5 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-800">{c.course.code}</span>
                          <span className="text-slate-500 truncate max-w-[160px]">{c.course.title}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic py-1">No courses allocated yet in this semester.</p>
                    )}
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

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search classrooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-brand-dark transition-all placeholder:text-slate-400 bg-white shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs outline-none focus:border-brand-dark shadow-2xs cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>

            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-100 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-brand-dark text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> New Classroom
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ classroom: cls, course, batch, teacher, session, schedules, students: batchStudents, colors, progress, semester }) => (
            <div
              key={cls.id}
              className={`bg-white rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all group ${
                cls.status === "completed"
                  ? "border-slate-200/60 opacity-80"
                  : "border-slate-200 hover:border-brand-dark/40 hover:shadow-md"
              }`}
            >
              <div>
                <div className={`h-1.5 w-full ${cls.status === "completed" ? "bg-slate-300" : colors.color}`} />
                <div className="p-4 space-y-3">
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

                  <div className="space-y-1.5 text-xs text-slate-600">
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

              <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-600">
                  {cls.classesCompleted} / {cls.totalClasses} classes
                </span>
                <Link
                  href={`/dashboard/admin/academic/classrooms/${cls.id}`}
                  className="px-3.5 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Manage Classroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">Course Info</th>
                  <th className="py-3 px-4">Semester & Batch</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Room & Schedule</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ classroom: cls, course, batch, teacher, schedules, students: batchStudents, progress, semester }) => (
                  <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{course.title}</div>
                      <div className="text-[11px] font-mono text-brand-dark font-semibold">{course.code} • {course.credits} Credits</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{semester}</span>
                      <div className="text-[11px] text-slate-500">{batch.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{teacher.name}</div>
                      <div className="text-[10px] text-slate-400">{teacher.designation}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{cls.room}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {schedules.length > 0 ? `${schedules[0].day} • ${schedules[0].startTime}` : "None"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-dark h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="font-bold text-slate-700 text-[11px]">{progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {batchStudents.length}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cls)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteClassroom(cls.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/dashboard/admin/academic/classrooms/${cls.id}`}
                          className="px-2.5 py-1 bg-brand-dark text-white rounded-lg font-bold text-[11px] hover:bg-slate-800 shadow-xs inline-flex items-center gap-1"
                        >
                          Manage
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Classrooms Allocated Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Click &quot;New Classroom&quot; above to allocate courses to this semester and batch.</p>
        </div>
      )}

      {/* ── CREATE / EDIT CLASSROOM MODAL ────────────────────────────────────── */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? "Edit Classroom Allocation" : "Allocate New Classroom"}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.courseId || !form.batchId || !form.teacherId || !form.room}
              className="px-5 py-2 rounded-lg bg-brand-dark text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {editing ? "Save Changes" : "Create Classroom"}
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          {/* Program & Batch Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">1. Program <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={modalProgramId}
                onChange={(val) => {
                  setModalProgramId(val);
                  setForm((f) => ({ ...f, batchId: "", courseId: "" }));
                }}
                options={uniquePrograms.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }))}
                placeholder="Select degree program"
                allowClear
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">2. Batch <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={form.batchId}
                onChange={(val) => setForm((f) => ({ ...f, batchId: val, courseId: "" }))}
                disabled={!modalProgramId}
                placeholder="Select student batch"
                allowClear
                options={batches.filter((b) => b.programId === modalProgramId).map((b) => ({ value: b.id, label: `${b.name} (${b.code})` }))}
              />
            </div>
          </div>

          {/* Semester & Course Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">3. Semester <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={form.semester || "Semester 1"}
                onChange={(val) => setForm((f) => ({ ...f, semester: val }))}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: `Semester ${s}`, label: `Semester ${s}` }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">4. Course <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={form.courseId}
                onChange={(val) => setForm((f) => ({ ...f, courseId: val }))}
                disabled={!form.batchId}
                placeholder="Select course"
                allowClear
                options={courses.filter((c) => !modalProgramId || c.programId === modalProgramId).map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Assign Teacher <span className="text-red-500">*</span></label>
              <SearchableSelect
                value={form.teacherId}
                onChange={(val) => setForm((f) => ({ ...f, teacherId: val }))}
                options={teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.designation})` }))}
                placeholder="Select a teacher"
                allowClear
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Room / Location <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Room 402, Bldg C"
                value={form.room}
                onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:border-brand-dark"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Status</label>
              <SearchableSelect
                value={form.status}
                onChange={(val) => setForm((f) => ({ ...f, status: val as Classroom["status"] }))}
                options={[
                  { value: "upcoming", label: "Upcoming" },
                  { value: "ongoing", label: "Ongoing" },
                  { value: "completed", label: "Completed" },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Total Classes</label>
              <input
                type="number"
                min={1}
                value={form.totalClasses}
                onChange={(e) => setForm((f) => ({ ...f, totalClasses: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-brand-dark"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Card Color</label>
              <div className="flex gap-1.5 pt-2">
                {CLASSROOM_COLORS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, colorIndex: i }))}
                    className={`w-5 h-5 rounded-full ${c.color} transition-all ${
                      form.colorIndex === i ? "ring-2 ring-offset-1 ring-slate-700 scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Config */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-brand-dark" /> Class Schedules
                </label>
                <p className="text-[10px] text-slate-500">Weekly meeting timetable slots for students and teacher.</p>
              </div>
              <button
                type="button"
                onClick={() => setSchedules((s) => [...s, { day: "Monday", startTime: "10:00 AM", endTime: "11:30 AM" }])}
                className="text-xs font-bold bg-brand-dark/10 text-brand-dark px-2.5 py-1 rounded-lg hover:bg-brand-dark/20 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Time
              </button>
            </div>

            <div className="space-y-2">
              {schedules.map((sch, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex-1 w-full">
                    <SearchableSelect
                      value={sch.day}
                      onChange={(val) => setSchedules((s) => s.map((x, i) => (i === idx ? { ...x, day: val } : x)))}
                      options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({
                        value: day,
                        label: day,
                      }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={sch.startTime}
                      onChange={(e) => setSchedules((s) => s.map((x, i) => (i === idx ? { ...x, startTime: e.target.value } : x)))}
                      className="w-20 py-1.5 text-xs text-slate-700 outline-none"
                    />
                  </div>
                  <span className="text-xs text-slate-400">to</span>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={sch.endTime}
                      onChange={(e) => setSchedules((s) => s.map((x, i) => (i === idx ? { ...x, endTime: e.target.value } : x)))}
                      className="w-20 py-1.5 text-xs text-slate-700 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSchedules((s) => s.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
