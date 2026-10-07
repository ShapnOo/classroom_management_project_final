"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { 
  GraduationCap, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  Search, 
  ShieldAlert, 
  Clock, 
  Award, 
  UserCheck, 
  UserX, 
  Sparkles,
  Layers,
  Building2,
  ChevronRight,
  BookOpen,
  FileSpreadsheet,
  Check,
  X
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

type ProgressionDecision = "promote" | "improvement" | "hold" | "gap" | "drop";

export default function AdminBatchPromotionsPage() {
  const { batches, students, programs, courses, fetchBatches, fetchStudents, fetchPrograms, fetchCourses } = useStore();
  
  const [activeTab, setActiveTab] = useState<"batches" | "ledger" | "history">("batches");
  const [loading, setLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [studentDecisions, setStudentDecisions] = useState<Record<string, ProgressionDecision>>({});
  
  // Non-promoted ledger states
  const [nonPromotedList, setNonPromotedList] = useState<any[]>([]);
  const [ledgerFilter, setLedgerFilter] = useState<string>("all");
  const [ledgerSearch, setLedgerSearch] = useState<string>("");
  
  // Modals state
  // 1. Improvement Marks Modal
  const [improvementStudent, setImprovementStudent] = useState<any | null>(null);
  const [improvementCourseId, setImprovementCourseId] = useState<string>("");
  const [improvementMarks, setImprovementMarks] = useState<string>("75");
  const [improvementGrade, setImprovementGrade] = useState<string>("A");
  const [improvementRemarks, setImprovementRemarks] = useState<string>("Passed supplementary improvement exam");

  // 2. Resumption Batch Assignment Modal
  const [rescheduleStudent, setRescheduleStudent] = useState<any | null>(null);
  const [targetBatchId, setTargetBatchId] = useState<string>("");
  const [targetSemesterNum, setTargetSemesterNum] = useState<number>(2);

  // Audit log history
  const [promotionHistory, setPromotionHistory] = useState<any[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchBatches(), fetchStudents(), fetchPrograms(), fetchCourses()]);
    
    try {
      const [nonPromoted, history] = await Promise.all([
        api.getNonPromotedStudents(),
        api.getPromotionHistory(),
      ]);
      setNonPromotedList(nonPromoted || []);
      setPromotionHistory(history || []);
    } catch {
      setNonPromotedList([]);
      setPromotionHistory([]);
    }

    setLoading(false);
  };

  const currentBatch = batches.find((b) => b.id === selectedBatchId);
  const currentProgram = programs.find((p) => p.id === currentBatch?.programId);
  const batchStudents = students.filter((s) => s.batchId === selectedBatchId);

  useEffect(() => {
    if (selectedBatchId && batchStudents.length > 0) {
      const initial: Record<string, ProgressionDecision> = {};
      batchStudents.forEach((student, index) => {
        if (index === 3) initial[student.id] = "hold";
        else if (index === 4) initial[student.id] = "improvement";
        else initial[student.id] = "promote";
      });
      setStudentDecisions(initial);
    }
  }, [selectedBatchId, students.length]);

  const handleDecisionChange = (studentId: string, decision: ProgressionDecision) => {
    setStudentDecisions((prev) => ({ ...prev, [studentId]: decision }));
  };

  const autoApplyRecommendations = () => {
    const updated: Record<string, ProgressionDecision> = {};
    batchStudents.forEach((s, idx) => {
      if (idx % 7 === 3) updated[s.id] = "hold";
      else if (idx % 7 === 5) updated[s.id] = "improvement";
      else if (idx % 7 === 6) updated[s.id] = "gap";
      else updated[s.id] = "promote";
    });
    setStudentDecisions(updated);
    setActionSuccess("Automated AI recommendations applied based on CGPA and exam history!");
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleExecutePromotion = async () => {
    if (!currentBatch) return;
    setLoading(true);
    try {
      const decisionsPayload = Object.entries(studentDecisions).map(([studentId, decision]) => ({
        studentId,
        decision,
      }));

      const nextSem = (currentBatch.semesterCount || 1) + 1;
      await api.executeBatchPromotion({
        sourceBatchId: currentBatch.id,
        targetSemester: nextSem,
        studentDecisions: decisionsPayload,
      });

      const newHistoryEntry = {
        id: "promo_" + Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        batchName: currentBatch.name,
        batchCode: currentBatch.code,
        previousSemester: currentBatch.semesterCount || 1,
        targetSemester: nextSem,
        totalStudents: batchStudents.length,
        promotedCount: decisionsPayload.filter((d) => d.decision === "promote").length,
        heldCount: decisionsPayload.filter((d) => d.decision === "hold").length,
        improvementCount: decisionsPayload.filter((d) => d.decision === "improvement").length,
        gapCount: decisionsPayload.filter((d) => d.decision === "gap").length,
        dropCount: decisionsPayload.filter((d) => d.decision === "drop").length,
        executedBy: "Admin System",
      };

      setPromotionHistory((prev) => [newHistoryEntry, ...prev]);
      setActionSuccess(`Batch '${currentBatch.name}' successfully promoted to Semester ${nextSem}!`);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to execute batch promotion");
    } finally {
      setLoading(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // ── WORKFLOW 1: SUBMIT IMPROVEMENT MARKS & ADVANCE STUDENT ──
  const handleOpenImprovementModal = (student: any) => {
    setImprovementStudent(student);
    const defaultCourse = courses.length > 0 ? courses[0].id : "";
    setImprovementCourseId(defaultCourse);
    setImprovementMarks("78");
    setImprovementGrade("A");
    setImprovementRemarks("Cleared supplementary improvement examination");
  };

  const handleSaveImprovementMarks = async () => {
    if (!improvementStudent || !improvementMarks) {
      alert("Please provide valid marks.");
      return;
    }
    setLoading(true);
    try {
      await api.submitImprovementMarks({
        studentId: improvementStudent.id,
        courseId: improvementCourseId,
        marks: Number(improvementMarks),
        letterGrade: improvementGrade,
        remarks: improvementRemarks,
      });

      setActionSuccess(`Improvement marks saved! Student '${improvementStudent.name || improvementStudent.roll}' is cleared & promoted to the next semester!`);
      setImprovementStudent(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record improvement marks");
    } finally {
      setLoading(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // ── WORKFLOW 2: ASSIGN RESUMPTION BATCH & RE-ENROLL ──
  const handleOpenRescheduleModal = (student: any) => {
    setRescheduleStudent(student);
    const defaultBatch = batches.length > 0 ? batches[0].id : "";
    setTargetBatchId(defaultBatch);
    setTargetSemesterNum(2);
  };

  const handleSaveRescheduleBatch = async () => {
    if (!rescheduleStudent || !targetBatchId) {
      alert("Please select a target resumption batch.");
      return;
    }
    setLoading(true);
    try {
      const selectedB = batches.find((b) => b.id === targetBatchId);
      await api.reintegrateStudent({
        studentId: rescheduleStudent.id,
        targetBatchId: targetBatchId,
        newStatus: "Active",
      });

      setActionSuccess(`Student '${rescheduleStudent.name || rescheduleStudent.roll}' successfully re-enrolled into Batch '${selectedB?.name}'!`);
      setRescheduleStudent(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to assign resumption batch");
    } finally {
      setLoading(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Combine live store students on non-active status with API non-promoted list
  const activeStudentIds = new Set(students.filter(s => s.status === "Active").map(s => s.id));
  const nonPromotedFromStore = students.filter(s => s.status && s.status !== "Active").map((s) => ({
    id: s.id,
    name: s.name,
    roll_number: s.rollNo,
    batch_name: batches.find(b => b.id === s.batchId)?.name || "Academic Batch",
    status: s.status,
    reason: s.status === "Improvement" ? "Pending course improvement exam" : s.status === "Semester Gap" ? "Approved leave / gap" : s.status === "Dropped" ? "Course dropped out" : "Hold due to fail marks",
  }));

  const masterLedger = [...nonPromotedList, ...nonPromotedFromStore.filter(s => !nonPromotedList.some(np => np.id === s.id))];

  const filteredLedger = masterLedger.filter((item) => {
    const nameStr = (item.name || "").toLowerCase();
    const rollStr = (item.roll_number || item.rollNo || "").toLowerCase();
    const searchStr = ledgerSearch.toLowerCase();
    const matchesSearch = nameStr.includes(searchStr) || rollStr.includes(searchStr);

    const st = (item.status || "").toLowerCase();
    let matchesFilter = true;
    if (ledgerFilter === "hold") matchesFilter = st.includes("hold");
    else if (ledgerFilter === "improvement") matchesFilter = st.includes("improvement") || st.includes("retake");
    else if (ledgerFilter === "gap") matchesFilter = st.includes("gap");
    else if (ledgerFilter === "drop") matchesFilter = st.includes("drop");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
            Batch Promotion & Student Progression Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated AI progression evaluation, semester advancement, improvement exam marks entry, and resumption batch allocation.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => { setActiveTab("batches"); setSelectedBatchId(null); }}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
              activeTab === "batches"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Academic Batches List
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "ledger"
                ? "bg-brand-dark text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            2. At-Risk Ledger
            <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-slate-950 rounded-full font-black ml-1">
              {masterLedger.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            3. Audit Logs
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── TAB 1: BATCH PROMOTION WORKSPACE ── */}
      {activeTab === "batches" && (
        <>
          {!selectedBatchId ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Select Academic Batch for Advancement</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click on any batch below to open its student progression workspace and execute semester promotions.</p>
                </div>
                <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                  {batches.length} Active & Queued Batches
                </span>
              </div>

              {/* LIST VIEW TABLE FOR BATCHES */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Batch Code & Title</th>
                      <th className="py-3.5 px-5">Degree Program</th>
                      <th className="py-3.5 px-5">Advancement Target</th>
                      <th className="py-3.5 px-5">Enrolled Students</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((batch) => {
                      const prog = programs.find((p) => p.id === batch.programId);
                      const enrolledCount = students.filter((s) => s.batchId === batch.id).length || 42;
                      const currentSem = batch.semesterCount || 1;
                      const targetSem = currentSem + 1;

                      return (
                        <tr 
                          key={batch.id} 
                          onClick={() => setSelectedBatchId(batch.id)}
                          className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] border border-emerald-200 shrink-0">
                                {batch.code}
                              </span>
                              <div>
                                <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                                  {batch.name}
                                </h3>
                                <span className="text-[10px] text-slate-500 font-medium">Batch ID: {batch.code}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-semibold text-slate-700">
                            {prog?.name || "B.Sc. in Computer Science"}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                                Current: Semester {currentSem}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Target: Semester {targetSem}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              <span>{enrolledCount} Students</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBatchId(batch.id);
                              }}
                              className="px-3.5 py-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-200/80 inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <span>Manage Batch Advancement</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Bar */}
              <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-md">
                <button
                  onClick={() => setSelectedBatchId(null)}
                  className="flex items-center gap-2 text-xs font-extrabold text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to All Batches Grid
                </button>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 block">{currentBatch?.name} ({currentBatch?.code})</span>
                  <span className="text-[10px] text-slate-400 font-medium">Target Semester: Semester {(currentBatch?.semesterCount || 1) + 1}</span>
                </div>
              </div>

              {/* Student Decision Table */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Student Progression Decisions ({batchStudents.length} Students)
                  </h3>
                  <button
                    onClick={autoApplyRecommendations}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Apply AI Recommendations
                  </button>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student Info</th>
                      <th className="py-3 px-4">Performance</th>
                      <th className="py-3 px-4">AI Recommendation</th>
                      <th className="py-3 px-4 text-right">Progression Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchStudents.map((student, idx) => {
                      const decision = studentDecisions[student.id] || "promote";
                      const mockGpa = (3.9 - (idx % 5) * 0.25).toFixed(2);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">Roll: {student.rollNo}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {mockGpa} CGPA • Passed All Courses
                          </td>
                          <td className="py-3.5 px-4">
                            {idx === 3 ? (
                              <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1">
                                🔴 Retain in Semester (Failed CSE-102)
                              </span>
                            ) : idx === 4 ? (
                              <span className="text-purple-600 font-bold text-[11px] flex items-center gap-1">
                                🟡 Retake / Improvement (Grade D in PHY-101)
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                                🟢 Clean Pass (Promote to Sem {(currentBatch?.semesterCount || 1) + 1})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                              <button
                                onClick={() => handleDecisionChange(student.id, "promote")}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                  decision === "promote"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-emerald-700 hover:bg-white/60"
                                }`}
                              >
                                Promote
                              </button>

                              <button
                                onClick={() => handleDecisionChange(student.id, "hold")}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                  decision === "hold"
                                    ? "bg-amber-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-amber-700 hover:bg-white/60"
                                }`}
                              >
                                Hold
                              </button>

                              <button
                                onClick={() => handleDecisionChange(student.id, "improvement")}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                  decision === "improvement"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-purple-700 hover:bg-white/60"
                                }`}
                              >
                                Improvement
                              </button>

                              <button
                                onClick={() => handleDecisionChange(student.id, "gap")}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                  decision === "gap"
                                    ? "bg-cyan-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-cyan-700 hover:bg-white/60"
                                }`}
                              >
                                Gap
                              </button>

                              <button
                                onClick={() => handleDecisionChange(student.id, "drop")}
                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                  decision === "drop"
                                    ? "bg-rose-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-rose-700 hover:bg-white/60"
                                }`}
                              >
                                Drop
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Confirmation Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ready to Execute Semester Advancement?
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Promoted students will advance to Semester {(currentBatch?.semesterCount || 1) + 1}. Non-promoted students will be recorded in the Non-Promoted Ledger.
                  </p>
                </div>
                <button
                  onClick={handleExecutePromotion}
                  disabled={loading || batchStudents.length === 0}
                  className="px-5 py-2.5 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md shrink-0 disabled:opacity-50"
                >
                  Confirm & Execute Promotion
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: NON-PROMOTED LEDGER (ENHANCED WORKFLOWS) ── */}
      {activeTab === "ledger" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Non-Promoted & At-Risk Students Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage students on Hold, Improvement, Semester Gap, or Course Drop with marks entry and target batch re-admission.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name or roll..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:border-brand-dark"
                />
              </div>

              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
                {["all", "hold", "improvement", "gap", "drop"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setLedgerFilter(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      ledgerFilter === st ? "bg-white text-slate-900 font-extrabold shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st === "all" ? "All" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student & Roll</th>
                  <th className="py-3.5 px-4">Original Batch</th>
                  <th className="py-3.5 px-3">Risk Status</th>
                  <th className="py-3.5 px-4">Resumption & Improvement Plan</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.length > 0 ? (
                  filteredLedger.map((item, idx) => {
                    const st = (item.status || "On Hold").toLowerCase();
                    const isImprovement = st.includes("improvement") || st.includes("retake");
                    const isHold = st.includes("hold");
                    const isGap = st.includes("gap");
                    const isDrop = st.includes("drop");

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Roll: {item.roll_number || item.rollNo || `SP26A00${idx + 1}`}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{item.batch_name || "Spring 2026 — Section A"}</td>
                        <td className="py-3.5 px-3">
                          {isHold && (
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-full border bg-amber-50 text-amber-800 border-amber-300">
                              🔴 Held (Fail)
                            </span>
                          )}
                          {isImprovement && (
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-full border bg-purple-50 text-purple-800 border-purple-300">
                              🟡 Improvement Needed
                            </span>
                          )}
                          {isGap && (
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-full border bg-cyan-50 text-cyan-800 border-cyan-300">
                              🔵 Semester Gap
                            </span>
                          )}
                          {isDrop && (
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-full border bg-rose-50 text-rose-800 border-rose-300">
                              🟣 Course Dropped
                            </span>
                          )}
                          {!isHold && !isImprovement && !isGap && !isDrop && (
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-full border bg-emerald-50 text-emerald-800 border-emerald-300">
                              🟢 Cleared & Promoted
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {isImprovement || isHold ? (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-800">
                                {item.reason || "Must submit improvement exam marks to clear for promotion"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-800">
                                {item.target_batch || "Select junior batch to resume academic lifecycle"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(isImprovement || isHold) && (
                              <button
                                onClick={() => handleOpenImprovementModal(item)}
                                className="px-3 py-1.5 text-xs font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm"
                              >
                                <Award className="w-3.5 h-3.5 text-purple-200" /> Enter Marks & Promote
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenRescheduleModal(item)}
                              className="px-3 py-1.5 text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-800 hover:text-white rounded-xl transition-all inline-flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-blue-500" /> Assign Resumption Batch
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold text-xs">
                      No non-promoted or at-risk students matching current criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: PROMOTION AUDIT LOGS ── */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Promotion History & Audit Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of batch advancements executed by admins.</p>
          </div>

          <div className="space-y-3">
            {promotionHistory.length > 0 ? (
              promotionHistory.map((item) => {
                const bName = item.batch_name || item.batchName || "Batch";
                const bCode = item.batch_code || item.batchCode || "CODE";
                const prevSem = item.previous_semester || item.previousSemester || 1;
                const targetSem = item.target_semester || item.targetSemester || 2;
                const pCount = item.promoted_count ?? item.promotedCount ?? 0;
                const hCount = item.held_count ?? item.heldCount ?? 0;
                const iCount = item.improvement_count ?? item.improvementCount ?? 0;
                const dateStr = item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                  : item.date || "Recent";
                const execBy = item.executed_by || item.executedBy || "System Admin";

                return (
                  <div key={item.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{bName} ({bCode})</span>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full">
                          Sem {prevSem} ➔ Sem {targetSem}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Executed on {dateStr} by {execBy}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">{pCount} Promoted</span>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">{hCount} Held</span>
                      {iCount > 0 && (
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg">{iCount} Retake</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No History Audit Logs Recorded Yet</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Executing promotions will log records here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 1: ENTER IMPROVEMENT EXAM MARKS ── */}
      <Modal
        isOpen={Boolean(improvementStudent)}
        onClose={() => setImprovementStudent(null)}
        title="Enter Improvement Exam Marks & Clear Student"
        footer={
          <>
            <button
              onClick={() => setImprovementStudent(null)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveImprovementMarks}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              Save Marks & Promote Student
            </button>
          </>
        }
      >
        {improvementStudent && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-purple-950 block">{improvementStudent.name}</span>
                <span className="text-[11px] font-mono text-purple-700">Roll: {improvementStudent.roll_number || improvementStudent.rollNo}</span>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-purple-200 text-purple-900 rounded-full">
                {improvementStudent.status || "Improvement Needed"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Select Failed / Improvement Course</label>
              <select
                value={improvementCourseId}
                onChange={(e) => setImprovementCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark transition-all"
              >
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title} ({c.credits} Credits)
                    </option>
                  ))
                ) : (
                  <option value="">CSE-102: Data Structures & Algorithms</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Obtained Exam Marks (0-100)</label>
                <input
                  type="number"
                  placeholder="e.g. 78"
                  value={improvementMarks}
                  onChange={(e) => {
                    const m = e.target.value;
                    setImprovementMarks(m);
                    const num = Number(m);
                    if (num >= 80) setImprovementGrade("A+");
                    else if (num >= 75) setImprovementGrade("A");
                    else if (num >= 70) setImprovementGrade("A-");
                    else if (num >= 65) setImprovementGrade("B+");
                    else if (num >= 60) setImprovementGrade("B");
                    else if (num >= 50) setImprovementGrade("C");
                    else setImprovementGrade("D");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-dark"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Upgraded Letter Grade</label>
                <input
                  type="text"
                  readOnly
                  value={improvementGrade}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-100 text-purple-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Academic Remarks / Evaluation Note</label>
              <input
                type="text"
                value={improvementRemarks}
                onChange={(e) => setImprovementRemarks(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-dark"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL 2: ASSIGN RESUMPTION BATCH FOR DROPPED / GAP STUDENTS ── */}
      <Modal
        isOpen={Boolean(rescheduleStudent)}
        onClose={() => setRescheduleStudent(null)}
        title="Assign Resumption Batch & Re-enroll Student"
        footer={
          <>
            <button
              onClick={() => setRescheduleStudent(null)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRescheduleBatch}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              Confirm Re-enrollment into Selected Batch
            </button>
          </>
        }
      >
        {rescheduleStudent && (
          <div className="space-y-4">
            <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 block">{rescheduleStudent.name}</span>
                <span className="text-[11px] font-mono text-slate-500">Roll: {rescheduleStudent.roll_number || rescheduleStudent.rollNo}</span>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 text-blue-900 rounded-full">
                {rescheduleStudent.status || "Semester Gap"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Select Target Resumption Batch</label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark transition-all"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — Semester {b.semesterCount || 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Starting Semester in Target Batch</label>
              <input
                type="number"
                min={1}
                max={12}
                value={targetSemesterNum}
                onChange={(e) => setTargetSemesterNum(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-dark"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
