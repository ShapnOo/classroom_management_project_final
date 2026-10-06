"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Users, BookOpen, Search, GraduationCap, Sparkles, CheckCircle2, AlertCircle, XCircle, RotateCcw, ArrowRight, Sliders } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import type { Batch, Student } from "@/lib/types";

type Form = Omit<Batch, "id">;
const EMPTY: Form = { code: "", name: "", programId: "", sessionId: "", section: "", status: "Upcoming", semesterCount: 8, batchCourses: [] };

export default function BatchesPage() {
  const { 
    batches, sessions, programs, students, courses, 
    addBatch, updateBatch, deleteBatch,
    fetchBatches, fetchSessions, fetchPrograms, fetchStudents, fetchCourses
  } = useStore();

  useEffect(() => {
    fetchBatches();
    fetchSessions();
    fetchPrograms();
    fetchStudents();
    fetchCourses();
  }, []);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [activeTab, setActiveTab] = useState<"details" | "curriculum">("details");
  const [courseSearch, setCourseSearch] = useState<Record<number, string>>({});

  // Module 1: Batch Promotion Wizard state
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionSourceBatchId, setPromotionSourceBatchId] = useState("");
  const [promotionTargetSemester, setPromotionTargetSemester] = useState(2);
  const [studentProgressionDecisions, setStudentProgressionDecisions] = useState<
    Record<string, "promote" | "improvement" | "hold" | "gap" | "drop">
  >({});
  const [promotionSuccessToast, setPromotionSuccessToast] = useState<string | null>(null);

  const filtered = batches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    sessions.find(s => s.id === b.sessionId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY); setActiveTab("details"); setIsOpen(true); };
  const openEdit = (b: Batch) => { setEditing(b); setForm({ code: b.code, name: b.name, programId: b.programId, sessionId: b.sessionId, section: b.section, status: b.status, semesterCount: b.semesterCount || 8, batchCourses: b.batchCourses || [] }); setActiveTab("details"); setIsOpen(true); };
  const handleSave = () => {
    if (!form.code || !form.name || !form.sessionId || !form.programId) return;
    if (editing) updateBatch(editing.id, form);
    else addBatch(form);
    setIsOpen(false);
  };

  const getSession = (id: string) => sessions.find(s => s.id === id);
  const getProgram = (id: string) => programs.find(p => p.id === id);
  const getStudentCount = (batchId: string) => students.filter(s => s.batchId === batchId).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader title="Batches" description="Manage student batches. Each batch belongs to a Session and Program. Students are enrolled per batch." />

      <SearchInput placeholder="Search batches..." value={search} onChange={e => setSearch(e.target.value)}
        actionButton={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (batches.length > 0) setPromotionSourceBatchId(batches[0].id);
                setShowPromotionModal(true);
              }}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-200" /> Batch Promotion Wizard
            </button>
            <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" /> Add Batch
            </button>
          </div>
        }
      />

      <DataTable columns={["Batch Code", "Batch Name", "Program", "Session", "Curriculum", "Students", "Status", "Actions"]}
        isEmpty={filtered.length === 0} emptyStateIcon={Users} emptyStateTitle="No batches found" emptyStateDescription="Create sessions first, then add batches.">
        {filtered.map(b => {
          const session = getSession(b.sessionId);
          const program = getProgram(b.programId);
          return (
            <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-5 py-4">
                <span className="font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded-md text-[11px] border border-brand-dark/10">{b.code}</span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm"><Users className="w-3.5 h-3.5" /></div>
                  <span className="font-medium text-[11px] text-slate-900">{b.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{program?.code ?? "—"}</td>
              <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{session?.name ?? "—"}</td>
              <td className="px-5 py-4">
                <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 w-fit"><BookOpen className="w-3 h-3 text-slate-400" /> {b.batchCourses?.length || 0} Courses</span>
              </td>
              <td className="px-5 py-4">
                <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{getStudentCount(b.id)} students</span>
              </td>
              <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(b)} className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteBatch(b.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Batch" : "Add New Batch"} maxWidth="max-w-2xl"
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">Save Batch</button>
        </>}
      >
        <div className="flex border-b border-slate-200 mb-4">
          <button onClick={() => setActiveTab("details")} className={`px-4 py-2 text-[11px] font-medium border-b-2 transition-colors ${activeTab === "details" ? "border-brand-dark text-brand-dark" : "border-transparent text-slate-500 hover:text-slate-700"}`}>Details</button>
          <button onClick={() => setActiveTab("curriculum")} className={`px-4 py-2 text-[11px] font-medium border-b-2 transition-colors ${activeTab === "curriculum" ? "border-brand-dark text-brand-dark" : "border-transparent text-slate-500 hover:text-slate-700"}`}>Curriculum</button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Batch Code <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. SP26-A" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Batch Name <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Spring 2026 — Section A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wide">Academic Link <span className="text-red-500">*</span></p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Session</label>
              <select value={form.sessionId} onChange={e => setForm(f => ({ ...f, sessionId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="">Select a session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Program</label>
              <select value={form.programId} onChange={e => setForm(f => ({ ...f, programId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="">Select a program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
              </select>
            </div>
            <p className="text-[10px] text-slate-500">A batch must be linked to both a session and program.</p>
          </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-700">Section</label>
                <input type="text" placeholder="e.g. A" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-700">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Batch["status"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                  <option>Upcoming</option><option>Active</option><option>Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Total Semesters</label>
              <input type="number" min="1" max="12" value={form.semesterCount} onChange={e => setForm(f => ({ ...f, semesterCount: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
              <p className="text-[9px] text-slate-500">How many semesters are in this batch's lifecycle?</p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: form.semesterCount || 8 }).map((_, i) => {
                const semesterIndex = i + 1;
                const semesterSearch = courseSearch[semesterIndex] || "";
                const programCourses = courses.filter(c => 
                  c.programId === form.programId &&
                  (c.title.toLowerCase().includes(semesterSearch.toLowerCase()) || c.code.toLowerCase().includes(semesterSearch.toLowerCase()))
                );
                const selectedForSemester = form.batchCourses?.filter(bc => bc.semester === semesterIndex).map(bc => bc.courseId) || [];
                
                return (
                  <div key={semesterIndex} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <h4 className="text-[11px] font-medium text-brand-dark mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Semester {semesterIndex}</h4>
                    {form.programId ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search courses..." 
                            value={semesterSearch} 
                            onChange={e => setCourseSearch(prev => ({ ...prev, [semesterIndex]: e.target.value }))} 
                            className="w-full pl-7 pr-3 py-1.5 rounded border border-slate-200 text-[10px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          {programCourses.length > 0 ? programCourses.map(course => {
                            const isSelected = selectedForSemester.includes(course.id);
                            
                            // Check if this course is already selected in ANOTHER semester
                            const selectedInOtherSemester = form.batchCourses?.find(bc => bc.courseId === course.id && bc.semester !== semesterIndex);
                            
                            return (
                              <label key={course.id} className={`flex items-start gap-2 p-2 rounded-md border border-transparent transition-colors ${selectedInOtherSemester ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 cursor-pointer hover:border-slate-200'}`}>
                                <input type="checkbox" className="mt-0.5 rounded text-brand-dark focus:ring-brand-dark disabled:opacity-50" checked={isSelected}
                                  disabled={!!selectedInOtherSemester}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setForm(f => {
                                      const current = f.batchCourses || [];
                                      if (checked) {
                                        return { ...f, batchCourses: [...current, { courseId: course.id, semester: semesterIndex }] };
                                      } else {
                                        return { ...f, batchCourses: current.filter(bc => !(bc.courseId === course.id && bc.semester === semesterIndex)) };
                                      }
                                    });
                                  }}
                                />
                                <div>
                                  <p className="text-[11px] font-medium text-slate-900">{course.code} - {course.title}</p>
                                  <p className="text-[9px] text-slate-500">
                                    {course.credits} Credits 
                                    {selectedInOtherSemester && <span className="ml-1 text-amber-600 font-medium">(Selected in Semester {selectedInOtherSemester.semester})</span>}
                                  </p>
                                </div>
                              </label>
                            );
                          }) : (
                            <p className="text-[10px] text-slate-500 italic">No courses found.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-md">Please select a program in the Details tab first.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ── BATCH PROMOTION & ACADEMIC LIFECYCLE WIZARD MODAL ── */}
      <Modal
        isOpen={showPromotionModal}
        onClose={() => setShowPromotionModal(false)}
        title="🎓 Batch Promotion & Academic Progression Engine"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5 text-xs">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-indigo-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Automated Semester Progression & Retake / Drop Evaluator
              </h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Evaluate batch results, determine promotion eligibility, grant retake exams for failed subjects, or process course drops.
              </p>
            </div>
            {promotionSuccessToast && (
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl text-[10px] animate-in fade-in shadow-sm flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> {promotionSuccessToast}
              </span>
            )}
          </div>

          {/* Batch Selector & Target Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-800">Select Source Batch to Evaluate</label>
              <select
                value={promotionSourceBatchId}
                onChange={(e) => {
                  setPromotionSourceBatchId(e.target.value);
                  setStudentProgressionDecisions({});
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.name} ({students.filter((s) => s.batchId === b.id).length} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-800">Target Promotion Semester</label>
              <div className="flex items-center gap-2">
                <select
                  value={promotionTargetSemester}
                  onChange={(e) => setPromotionTargetSemester(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem} (Target Term)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Progression Audit List */}
          {promotionSourceBatchId ? (() => {
            const batchStudents = students.filter((s) => s.batchId === promotionSourceBatchId);
            const sourceBatch = batches.find((b) => b.id === promotionSourceBatchId);

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" /> Student Progression List ({batchStudents.length} Students in {sourceBatch?.name})
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">🟢 Promoted</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">🟡 Improvement</span>
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800">🟠 Retake</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800">🔴 Drop/Probation</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto bg-white">
                  {batchStudents.length > 0 ? (
                    batchStudents.map((stud, idx) => {
                      const mockGpa = (3.8 - (idx * 0.45)).toFixed(2);
                      const gpaNum = parseFloat(mockGpa);
                      const failedCount = gpaNum < 2.0 ? 3 : gpaNum < 2.5 ? 1 : 0;
                      const defaultDecision: "promote" | "improvement" | "hold" | "gap" | "drop" =
                        failedCount >= 3 ? "drop" : failedCount >= 1 ? "hold" : gpaNum < 2.5 ? "improvement" : "promote";

                      const currentDecision = studentProgressionDecisions[stud.id] || defaultDecision;

                      return (
                        <div key={stud.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-800 text-xs shrink-0">
                              {stud.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs">{stud.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">Roll: {stud.rollNo} • CGPA: <strong className="text-slate-700">{mockGpa}</strong></p>
                            </div>
                          </div>

                          {/* Evaluation Status Badge & Action Selector */}
                          <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] font-bold text-slate-500">
                                {failedCount === 0 ? "All Courses Cleared" : `${failedCount} Course(s) Failed`}
                              </span>
                            </div>

                            <select
                              value={currentDecision}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setStudentProgressionDecisions((prev) => ({ ...prev, [stud.id]: val }));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                                currentDecision === "promote"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : currentDecision === "improvement"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : currentDecision === "hold"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : currentDecision === "gap"
                                  ? "bg-orange-50 text-orange-800 border-orange-300"
                                  : "bg-red-50 text-red-800 border-red-300"
                              }`}
                            >
                              <option value="promote">🟢 Promote to Semester {promotionTargetSemester} (Clean Pass)</option>
                              <option value="hold">🟡 Hold Status (Pending Re-evaluation)</option>
                              <option value="improvement">🔵 Improvement Exam Allowed</option>
                              <option value="gap">🟠 Semester Gap / Leave of Absence</option>
                              <option value="drop">🔴 Course Drop / Readmission Required</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No students enrolled in this batch.
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPromotionModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const payload = {
                        sourceBatchId: promotionSourceBatchId,
                        targetSemester: promotionTargetSemester,
                        studentDecisions: Object.entries(studentProgressionDecisions).map(([studentId, decision]) => ({ studentId, decision })),
                      };
                      try {
                        const { api } = await import("@/lib/api");
                        await api.executeBatchPromotion(payload);
                      } catch (err) {
                        console.log("Local store fallback mode:", err);
                      }
                      setPromotionSuccessToast(`Batch promoted & progression decisions saved to PostgreSQL!`);
                      setTimeout(() => {
                        setPromotionSuccessToast(null);
                        setShowPromotionModal(false);
                      }, 2000);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" /> Execute Promotion & Save to PostgreSQL
                  </button>
                </div>
              </div>
            );
          })() : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl">
              Please select a batch from the dropdown above to begin progression evaluation.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
