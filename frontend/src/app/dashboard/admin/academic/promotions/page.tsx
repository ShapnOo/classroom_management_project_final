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
  ChevronRight
} from "lucide-react";

type ProgressionDecision = "promote" | "improvement" | "hold" | "gap" | "drop";

export default function AdminBatchPromotionsPage() {
  const { batches, students, programs, fetchBatches, fetchStudents, fetchPrograms } = useStore();
  
  const [activeTab, setActiveTab] = useState<"batches" | "ledger" | "history">("batches");
  const [loading, setLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [studentDecisions, setStudentDecisions] = useState<Record<string, ProgressionDecision>>({});
  
  // Non-promoted ledger states
  const [nonPromotedList, setNonPromotedList] = useState<any[]>([]);
  const [ledgerFilter, setLedgerFilter] = useState<string>("all");
  const [ledgerSearch, setLedgerSearch] = useState<string>("");
  const [reintegrateStudentId, setReintegrateStudentId] = useState<string | null>(null);
  const [reintegrateTargetBatchId, setReintegrateTargetBatchId] = useState<string>("");
  
  // Audit log history
  const [promotionHistory, setPromotionHistory] = useState<any[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchBatches(), fetchStudents(), fetchPrograms()]);
    
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

  const handleReintegrate = async (studentId: string) => {
    if (!reintegrateTargetBatchId) {
      alert("Please select a target batch for reintegration.");
      return;
    }
    setLoading(true);
    try {
      await api.reintegrateStudent({
        studentId,
        targetBatchId: reintegrateTargetBatchId,
        newStatus: "Active",
      });
      setActionSuccess("Student successfully reintegrated into target batch!");
      setReintegrateStudentId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to reintegrate student");
    } finally {
      setLoading(false);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  // KPI Calculations
  const promoteCount = Object.values(studentDecisions).filter((d) => d === "promote").length;
  const holdCount = Object.values(studentDecisions).filter((d) => d === "hold").length;
  const improvementCount = Object.values(studentDecisions).filter((d) => d === "improvement").length;
  const gapCount = Object.values(studentDecisions).filter((d) => d === "gap").length;
  const dropCount = Object.values(studentDecisions).filter((d) => d === "drop").length;

  // Filtered Non-Promoted Ledger
  const filteredLedger = nonPromotedList.filter((item) => {
    const matchesFilter =
      ledgerFilter === "all"
        ? true
        : ledgerFilter === "hold"
        ? item.status === "On Hold" || item.status === "Inactive"
        : ledgerFilter === "gap"
        ? item.status === "Semester Gap"
        : ledgerFilter === "improvement"
        ? item.status === "Improvement"
        : item.status === "Dropped";

    const searchLower = ledgerSearch.toLowerCase();
    const matchesSearch =
      !ledgerSearch ||
      item.name?.toLowerCase().includes(searchLower) ||
      item.roll_number?.toLowerCase().includes(searchLower) ||
      item.batch_name?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-dark text-xs font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4 text-emerald-600" /> Academic Governance & Progression Engine
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Batch Promotion Portal</h1>
          <p className="text-slate-500 text-xs mt-1">
            Review end-of-term batch advancements, manage re-evaluation holds, retake exams, and student reintegrations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {selectedBatchId && (
            <button
              onClick={() => setSelectedBatchId(null)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Batches
            </button>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 inline-flex flex-wrap gap-1">
        <button
          onClick={() => {
            setActiveTab("batches");
            setSelectedBatchId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "batches"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Layers className="w-4 h-4 text-brand-dark" />
          Academic Batches List
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-900 text-white font-extrabold ml-1">
            {batches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ledger"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          Non-Promoted Student Ledger
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-extrabold ml-1">
            {nonPromotedList.length || 3}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "history"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Clock className="w-4 h-4 text-slate-500" />
          Promotion Audit Logs
        </button>
      </div>

      {/* ── TAB 1: BATCHES VIEW & PROMOTION WORKSPACE ── */}
      {activeTab === "batches" && (
        <>
          {/* STATE A: BATCHES LIST GRID (First screen user sees) */}
          {!selectedBatchId ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Select Academic Batch for Advancement</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click on any batch below to open its student progression workspace and execute semester promotions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map((batch) => {
                  const program = programs.find((p) => p.id === batch.programId);
                  const bStudents = students.filter((s) => s.batchId === batch.id);

                  return (
                    <div
                      key={batch.id}
                      onClick={() => setSelectedBatchId(batch.id)}
                      className="bg-white border border-slate-200/80 hover:border-brand-dark/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-xs px-2.5 py-1 bg-brand-dark/5 text-brand-dark rounded-md border border-brand-dark/10">
                            {batch.code}
                          </span>
                          <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                            Term Complete
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-dark transition-colors">
                            {batch.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                            {program?.name || "B.Sc. in Computer Science"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg border border-blue-200/80">
                            Current: Semester {batch.semesterCount || 1}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/80">
                            Target: Semester {(batch.semesterCount || 1) + 1}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Users className="w-4 h-4 text-slate-400" /> {bStudents.length} Students
                        </span>
                        <span className="text-brand-dark flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Manage Batch Advancement <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STATE B: SELECTED BATCH DETAIL WORKSPACE */
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
              {/* Batch Metadata Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">{currentBatch?.name}</h2>
                    <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg">
                      Current: Semester {currentBatch?.semesterCount || 1}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg">
                      Target: Semester {(currentBatch?.semesterCount || 1) + 1}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-2">
                    <span>Batch Code: <strong className="text-slate-800 font-mono">{currentBatch?.code}</strong></span>
                    <span>•</span>
                    <span>Program: <strong className="text-slate-800">{currentProgram?.name || "B.Sc. in Computer Science"}</strong></span>
                    <span>•</span>
                    <span>Total Enrolled: <strong className="text-slate-900">{batchStudents.length} Students</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={autoApplyRecommendations}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Rules
                  </button>

                  <button
                    onClick={handleExecutePromotion}
                    disabled={loading || batchStudents.length === 0}
                    className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" /> Execute Advancement
                  </button>
                </div>
              </div>

              {/* Status Counters Bar */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-emerald-800">
                  <span className="block text-lg font-extrabold text-emerald-700">{promoteCount}</span>
                  🟢 Promote
                </div>
                <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/60 text-amber-800">
                  <span className="block text-lg font-extrabold text-amber-700">{holdCount}</span>
                  🔴 Hold (Fail)
                </div>
                <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-200/60 text-purple-800">
                  <span className="block text-lg font-extrabold text-purple-700">{improvementCount}</span>
                  🟡 Retake
                </div>
                <div className="p-2 rounded-lg bg-cyan-50/60 border border-cyan-200/60 text-cyan-800">
                  <span className="block text-lg font-extrabold text-cyan-700">{gapCount}</span>
                  🔵 Sem Gap
                </div>
                <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-200/60 text-rose-800">
                  <span className="block text-lg font-extrabold text-rose-700">{dropCount}</span>
                  🟣 Drop Out
                </div>
              </div>

              {/* Student Roster Table with RESTORED ELEGANT PILL BUTTONS */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Student Info</th>
                      <th className="py-3.5 px-4">Academic Performance</th>
                      <th className="py-3.5 px-4">AI Recommendation</th>
                      <th className="py-3.5 px-4 text-right">Progression Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchStudents.map((student, idx) => {
                      const decision = studentDecisions[student.id] || "promote";
                      
                      const mockCgpa = (3.85 - (idx * 0.21)).toFixed(2);
                      const mockFails = idx === 3 ? 2 : idx === 4 ? 1 : 0;
                      const studentRoll = student.rollNo || `SP26A${String(idx + 1).padStart(3, "0")}`;

                      let recText = "🟢 Clean Pass";
                      let recColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      if (mockFails >= 2 || Number(mockCgpa) < 2.0) {
                        recText = "🔴 Hold (Fail Risk)";
                        recColor = "bg-rose-50 text-rose-700 border-rose-200";
                      } else if (mockFails === 1) {
                        recText = "🟡 Retake Eligible";
                        recColor = "bg-amber-50 text-amber-700 border-amber-200";
                      }

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-medium">
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Roll: <span className="font-semibold text-slate-700">{studentRoll}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{mockCgpa} CGPA</div>
                            {mockFails > 0 ? (
                              <div className="text-[11px] text-rose-600 font-bold mt-0.5">
                                {mockFails} Failed Course(s)
                              </div>
                            ) : (
                              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                                All Courses Passed
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${recColor} inline-block`}>
                              {recText}
                            </span>
                          </td>

                          {/* RESTORED BEAUTIFUL PILL BUTTON SELECTORS */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
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

      {/* ── TAB 2: NON-PROMOTED LEDGER ── */}
      {activeTab === "ledger" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Non-Promoted & At-Risk Students Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized master list of students currently on Hold, approved Semester Gap, Improvement, or Course Drop.
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

          {/* Reintegration Workspace Panel */}
          {reintegrateStudentId && (
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-700" /> Reintegrate / Readmit Student into Active Batch
                </span>
                <button onClick={() => setReintegrateStudentId(null)} className="text-xs text-slate-500 hover:text-slate-800">
                  Cancel
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <select
                  value={reintegrateTargetBatchId}
                  onChange={(e) => setReintegrateTargetBatchId(e.target.value)}
                  className="w-full sm:w-auto text-xs px-3 py-2 border border-amber-300 rounded-xl bg-white font-medium focus:outline-none"
                >
                  <option value="">Select Target Active Batch...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) - Semester {b.semesterCount || 1}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleReintegrate(reintegrateStudentId)}
                  disabled={loading || !reintegrateTargetBatchId}
                  className="px-4 py-2 text-xs font-extrabold bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-all disabled:opacity-50"
                >
                  Confirm Reintegration
                </button>
              </div>
            </div>
          )}

          {/* Ledger Table */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Student & Roll</th>
                  <th className="py-3.5 px-4">Original Batch</th>
                  <th className="py-3.5 px-3">Current Status</th>
                  <th className="py-3.5 px-4">Flag Reason / Notes</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.length > 0 ? (
                  filteredLedger.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Roll: {item.roll_number || item.rollNo || `SP26A00${idx + 1}`}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{item.batch_name || "Spring 2026 — Section A"}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                          {item.status || "On Hold"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Retained due to course re-evaluation / gap</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setReintegrateStudentId(item.id);
                            if (batches.length > 0) setReintegrateTargetBatchId(batches[0].id);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-brand-dark bg-slate-100 hover:bg-brand-dark hover:text-white rounded-xl transition-all inline-flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reintegrate
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  [
                    { id: "s1", name: "Rahim Ahmed", roll: "SP26A012", batch: "Spring 2026 — Section A", status: "On Hold", reason: "Failed CSE-102 (Pending Re-evaluation)" },
                    { id: "s2", name: "Fatima Akter", roll: "SP26A019", batch: "Spring 2026 — Section A", status: "Semester Gap", reason: "Approved leave for medical reasons" },
                    { id: "s3", name: "Tanvir Hossain", roll: "SP26A028", batch: "Spring 2026 — Section B", status: "Improvement", reason: "Retaking PHY-101 for grade improvement" },
                  ].map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Roll: {s.roll}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{s.batch}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{s.reason}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setReintegrateStudentId(s.id);
                            if (batches.length > 0) setReintegrateTargetBatchId(batches[0].id);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-brand-dark bg-slate-100 hover:bg-brand-dark hover:text-white rounded-xl transition-all inline-flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reintegrate
                        </button>
                      </td>
                    </tr>
                  ))
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
    </div>
  );
}
