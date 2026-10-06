"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Building2, GraduationCap, CheckCircle2, Search, BookOpen, Layers } from "lucide-react";
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
  
  const [activeTab, setActiveTab] = useState<"departments" | "programs">("departments");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Department Modal States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: "", code: "" });

  // Program Modal States
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [progForm, setProgForm] = useState({ name: "", code: "", departmentId: "", duration: "4 Years" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchDepartments(), fetchPrograms(), fetchTeachers(), fetchBatches()]);
    setLoading(false);
  };

  // ── DEPARTMENT ACTIONS ──────────────────────────────────────────────────────
  const openAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: "", code: "" });
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, code: dept.code });
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
        setToastMessage(`Department '${deptForm.name}' created successfully!`);
      }
      setIsDeptModalOpen(false);
      await fetchDepartments();
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
      await fetchDepartments();
    } catch (err: any) {
      alert(err.message || "Failed to delete department");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // ── PROGRAM ACTIONS ─────────────────────────────────────────────────────────
  const openAddProg = () => {
    setEditingProg(null);
    const defaultDept = departments.length > 0 ? departments[0].id : "";
    setProgForm({ name: "", code: "", departmentId: defaultDept, duration: "4 Years" });
    setIsProgModalOpen(true);
  };

  const openEditProg = (prog: Program) => {
    setEditingProg(prog);
    setProgForm({
      name: prog.name,
      code: prog.code,
      departmentId: prog.departmentId,
      duration: prog.duration || "4 Years",
    });
    setIsProgModalOpen(true);
  };

  const handleSaveProg = async () => {
    if (!progForm.name || !progForm.code || !progForm.departmentId) {
      alert("Please provide Program Name, Code, and select a Department.");
      return;
    }
    setLoading(true);
    try {
      if (editingProg) {
        await api.updateProgram(editingProg.id, progForm);
        setToastMessage(`Program '${progForm.name}' updated successfully!`);
      } else {
        await api.createProgram(progForm);
        setToastMessage(`Program '${progForm.name}' created successfully!`);
      }
      setIsProgModalOpen(false);
      await fetchPrograms();
    } catch (err: any) {
      alert(err.message || "Failed to save program");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleDeleteProg = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete program '${name}'?`)) return;
    setLoading(true);
    try {
      await api.deleteProgram(id);
      setToastMessage(`Program '${name}' deleted successfully.`);
      await fetchPrograms();
    } catch (err: any) {
      alert(err.message || "Failed to delete program");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Filters
  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="Departments & Degree Programs" 
        description="Manage academic departments, faculty allocations, and degree programs (B.Sc., M.Sc., PGDIT, etc.)."
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "departments"
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Academic Departments
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 text-white ml-1">
              {departments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("programs")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "programs"
                ? "bg-brand-dark text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            Degree Programs
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 text-white ml-1">
              {programs.length}
            </span>
          </button>
        </div>

        <SearchInput 
          placeholder={`Search ${activeTab === "departments" ? "departments..." : "degree programs..."}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          actionButton={
            activeTab === "departments" ? (
              <button 
                onClick={openAddDept}
                className="flex items-center gap-1.5 bg-brand-dark text-white px-3.5 py-2 rounded-xl hover:bg-slate-800 transition-all font-bold text-[11px] shadow-sm whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Department
              </button>
            ) : (
              <button 
                onClick={openAddProg}
                className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition-all font-bold text-[11px] shadow-sm whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Degree Program
              </button>
            )
          }
        />
      </div>

      {/* ── TAB 1: ACADEMIC DEPARTMENTS ── */}
      {activeTab === "departments" && (
        <DataTable 
          columns={["Dept Code", "Department Name", "Faculty Members", "Assigned Programs", "Actions"]}
          isEmpty={filteredDepartments.length === 0}
          emptyStateIcon={Building2}
          emptyStateTitle="No departments found"
          emptyStateDescription="We couldn't find any departments matching your search."
        >
          {filteredDepartments.map((dept) => {
            const facultyCount = teachers.filter((t) => t.departmentId === dept.id).length;
            const programCount = programs.filter((p) => p.departmentId === dept.id).length;

            return (
              <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-5 py-4">
                  <span className="font-bold text-brand-dark bg-brand-dark/5 px-2.5 py-1 rounded-md text-[11px] border border-brand-dark/10">
                    {dept.code}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                  {facultyCount} Faculty Member(s)
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                  {programCount} Degree Program(s)
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

      {/* ── TAB 2: DEGREE PROGRAMS ── */}
      {activeTab === "programs" && (
        <DataTable 
          columns={["Program Code", "Program Title", "Associated Department", "Duration", "Active Batches", "Actions"]}
          isEmpty={filteredPrograms.length === 0}
          emptyStateIcon={GraduationCap}
          emptyStateTitle="No degree programs found"
          emptyStateDescription="Click 'Add Degree Program' to define academic degree programs."
        >
          {filteredPrograms.map((prog) => {
            const dept = departments.find((d) => d.id === prog.departmentId);
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
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{prog.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                  {dept?.name || "Unassigned"} ({dept?.code || "N/A"})
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                  {prog.duration || "4 Years"}
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
            <label className="text-xs font-bold text-slate-700">Department Code</label>
            <input 
              type="text" 
              placeholder="e.g. CSE, MTH, EEE" 
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
                placeholder="e.g. B.Sc. CS, PGDIT, BBA" 
                value={progForm.code}
                onChange={(e) => setProgForm({ ...progForm, code: e.target.value })}
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
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Program Title / Name</label>
            <input 
              type="text" 
              placeholder="e.g. B.Sc. in Computer Science & Engineering" 
              value={progForm.name}
              onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Assign to Academic Department</label>
            <select 
              value={progForm.departmentId}
              onChange={(e) => setProgForm({ ...progForm, departmentId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-dark transition-all"
            >
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
