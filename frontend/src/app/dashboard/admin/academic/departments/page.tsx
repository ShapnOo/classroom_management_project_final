"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Building2, GraduationCap, CheckCircle2, Search, BookOpen, Layers, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { Department, Program } from "@/lib/types";

export default function DepartmentsPage() {
  const { departments, programs, teachers, batches, fetchDepartments, fetchPrograms, fetchTeachers, fetchBatches } = useStore();
  
  // User directive: "age program then department!"
  const [activeTab, setActiveTab] = useState<"programs" | "departments">("programs");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Department Modal States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: "", code: "", programId: "" });

  // Program Modal States
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [progForm, setProgForm] = useState({ name: "", code: "", duration: "4 Years" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDepartments(), fetchPrograms(), fetchTeachers(), fetchBatches()]);
    setLoading(false);
  };

  // ── PROGRAM ACTIONS ─────────────────────────────────────────────────────────
  const openAddProg = () => {
    setEditingProg(null);
    setProgForm({ name: "", code: "", duration: "4 Years" });
    setIsProgModalOpen(true);
  };

  const openEditProg = (prog: Program) => {
    setEditingProg(prog);
    setProgForm({
      name: prog.name,
      code: prog.code,
      duration: prog.duration || "4 Years",
    });
    setIsProgModalOpen(true);
  };

  const handleSaveProg = async () => {
    if (!progForm.name || !progForm.code) {
      alert("Please provide both Program Name and Code.");
      return;
    }
    setLoading(true);
    try {
      if (editingProg) {
        await api.updateProgram(editingProg.id, progForm);
        setToastMessage(`Degree Program '${progForm.name}' updated successfully!`);
      } else {
        await api.createProgram(progForm);
        setToastMessage(`Degree Program '${progForm.name}' created successfully!`);
      }
      setIsProgModalOpen(false);
      await fetchPrograms();
    } catch (err: any) {
      alert(err.message || "Failed to save degree program");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleDeleteProg = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete degree program '${name}'?`)) return;
    setLoading(true);
    try {
      await api.deleteProgram(id);
      setToastMessage(`Degree Program '${name}' deleted successfully.`);
      await fetchPrograms();
    } catch (err: any) {
      alert(err.message || "Failed to delete degree program");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // ── DEPARTMENT ACTIONS ──────────────────────────────────────────────────────
  const openAddDept = (presetProgramId?: string) => {
    setEditingDept(null);
    const defaultProgram = presetProgramId || (programs.length > 0 ? programs[0].id : "");
    setDeptForm({ name: "", code: "", programId: defaultProgram });
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, code: dept.code, programId: dept.programId || "" });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async () => {
    if (!deptForm.name || !deptForm.code) {
      alert("Please provide both Department Name and Code.");
      return;
    }
    setLoading(true);
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, deptForm);
        setToastMessage(`Department '${deptForm.name}' updated successfully!`);
      } else {
        await api.createDepartment(deptForm);
        setToastMessage(`Department '${deptForm.name}' created under program successfully!`);
      }
      setIsDeptModalOpen(false);
      await Promise.all([fetchDepartments(), fetchPrograms()]);
    } catch (err: any) {
      alert(err.message || "Failed to save department");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department '${name}'?`)) return;
    setLoading(true);
    try {
      await api.deleteDepartment(id);
      setToastMessage(`Department '${name}' deleted successfully.`);
      await Promise.all([fetchDepartments(), fetchPrograms()]);
    } catch (err: any) {
      alert(err.message || "Failed to delete department");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Filters
  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepartments = departments.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.programName && d.programName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedProgramFilter === "ALL" || d.programId === selectedProgramFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="Academic Programs & Departments Hierarchy" 
        description="Top-level Academic Degree Programs and their underlying specialized Academic Departments."
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tabs Navigation (Program First) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "programs"
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            1. Degree Programs
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 text-white ml-1">
              {programs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "departments"
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            2. Departments (Under Programs)
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 text-white ml-1">
              {departments.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "departments" && (
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedProgramFilter}
                onChange={(e) => setSelectedProgramFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Academic Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          )}

          <SearchInput 
            placeholder={`Search ${activeTab === "programs" ? "degree programs..." : "departments..."}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            actionButton={
              activeTab === "programs" ? (
                <button 
                  onClick={openAddProg}
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition-all font-bold text-[11px] shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Degree Program
                </button>
              ) : (
                <button 
                  onClick={() => openAddDept()}
                  className="flex items-center gap-1.5 bg-brand-dark text-white px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-all font-bold text-[11px] shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Department
                </button>
              )
            }
          />
        </div>
      </div>

      {/* ── TAB 1: DEGREE PROGRAMS (PROGRAM FIRST) ── */}
      {activeTab === "programs" && (
        <DataTable 
          columns={["Program Code", "Degree Program Title", "Duration", "Departments Under Program", "Active Batches", "Actions"]}
          isEmpty={filteredPrograms.length === 0}
          emptyStateIcon={GraduationCap}
          emptyStateTitle="No degree programs found"
          emptyStateDescription="Click 'Add Degree Program' to define top-level academic programs."
        >
          {filteredPrograms.map((prog) => {
            const deptsUnderProg = departments.filter((d) => d.programId === prog.id);
            const activeBatchesCount = batches.filter((b) => b.programId === prog.id).length;

            return (
              <tr key={prog.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-5 py-4">
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] border border-emerald-200/80">
                    {prog.code}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{prog.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Top-Level Academic Degree</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                    {prog.duration || "4 Years"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {deptsUnderProg.length > 0 ? (
                      deptsUnderProg.map((d) => (
                        <span 
                          key={d.id} 
                          className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[10px] font-bold"
                          title={d.name}
                        >
                          {d.code}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No departments linked</span>
                    )}
                    <button
                      onClick={() => openAddDept(prog.id)}
                      className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5 ml-1"
                    >
                      <Plus className="w-3 h-3" /> Add Dept
                    </button>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                  {activeBatchesCount} Batch(es)
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditProg(prog)}
                      className="p-1.5 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Program"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProg(prog.id, prog.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}

      {/* ── TAB 2: DEPARTMENTS (UNDER PROGRAMS) ── */}
      {activeTab === "departments" && (
        <DataTable 
          columns={["Dept Code", "Department Name", "Parent Academic Program", "Faculty Members", "Actions"]}
          isEmpty={filteredDepartments.length === 0}
          emptyStateIcon={Building2}
          emptyStateTitle="No departments found"
          emptyStateDescription="We couldn't find any departments matching your search or filter."
        >
          {filteredDepartments.map((dept) => {
            const facultyCount = teachers.filter((t) => t.departmentId === dept.id).length;
            const parentProgram = programs.find((p) => p.id === dept.programId);

            return (
              <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-5 py-4">
                  <span className="font-bold text-brand-dark bg-brand-dark/5 px-2.5 py-1 rounded-md text-[11px] border border-brand-dark/10">
                    {dept.code}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {parentProgram ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      {parentProgram.name} ({parentProgram.code})
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Unassigned</span>
                  )}
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                  {facultyCount} Faculty Member(s)
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditDept(dept)}
                      className="p-1.5 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDept(dept.id, dept.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}

      {/* ── MODAL: ADD / EDIT DEGREE PROGRAM ── */}
      <Modal
        isOpen={isProgModalOpen}
        onClose={() => setIsProgModalOpen(false)}
        title={editingProg ? "Edit Degree Program" : "Create New Degree Program"}
        footer={
          <>
            <button 
              onClick={() => setIsProgModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProg}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {editingProg ? "Update Program" : "Create Program"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Program Code</label>
              <input 
                type="text" 
                placeholder="e.g. SCSAI, FET, SPMS" 
                value={progForm.code}
                onChange={(e) => setProgForm({ ...progForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-all" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Program Duration</label>
              <select 
                value={progForm.duration}
                onChange={(e) => setProgForm({ ...progForm, duration: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark transition-all"
              >
                <option value="1 Year">1 Year (Diploma/Postgrad)</option>
                <option value="2 Years">2 Years (Masters/M.Sc.)</option>
                <option value="3 Years">3 Years (B.Sc. Pass)</option>
                <option value="4 Years">4 Years (B.Sc. Hons/Engg)</option>
                <option value="5 Years">5 Years (Architecture/Medicine)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Program Title / Name</label>
            <input 
              type="text" 
              placeholder="e.g. School of Computer Science & AI" 
              value={progForm.name}
              onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-all" 
            />
          </div>
        </div>
      </Modal>

      {/* ── MODAL: ADD / EDIT DEPARTMENT ── */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? "Edit Academic Department" : "Add New Academic Department"}
        footer={
          <>
            <button 
              onClick={() => setIsDeptModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveDept}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-dark hover:bg-slate-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {editingDept ? "Update Department" : "Create Department"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Parent Degree Program</label>
            <select 
              value={deptForm.programId}
              onChange={(e) => setDeptForm({ ...deptForm, programId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark transition-all"
            >
              <option value="">Select Parent Academic Program...</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Department Code</label>
            <input 
              type="text" 
              placeholder="e.g. CSE, SWE, EEE" 
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Department Name</label>
            <input 
              type="text" 
              placeholder="e.g. Computer Science & Engineering" 
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-all" 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
