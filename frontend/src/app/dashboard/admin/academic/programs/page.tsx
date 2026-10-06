"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, GraduationCap, Building2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { Program, Department } from "@/lib/types";

export default function ProgramsPage() {
  const { programs, departments, batches, fetchPrograms, fetchDepartments, fetchBatches } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [form, setForm] = useState({ name: "", code: "", duration: "4 Years" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPrograms(), fetchDepartments(), fetchBatches()]);
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingProg(null);
    setForm({ name: "", code: "", duration: "4 Years" });
    setIsModalOpen(true);
  };

  const openEditModal = (prog: Program) => {
    setEditingProg(prog);
    setForm({
      name: prog.name,
      code: prog.code,
      duration: prog.duration || "4 Years",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      alert("Please enter both Program Name and Code.");
      return;
    }
    setLoading(true);
    try {
      if (editingProg) {
        await api.updateProgram(editingProg.id, form);
        setToastMessage(`Program '${form.name}' updated successfully!`);
      } else {
        await api.createProgram(form);
        setToastMessage(`Program '${form.name}' created successfully!`);
      }
      setIsModalOpen(false);
      await fetchPrograms();
    } catch (err: any) {
      alert(err.message || "Failed to save degree program");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleDelete = async (id: string, name: string) => {
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

  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="Degree & Academic Programs" 
        description="Top-level Academic Degree Programs (10-12 Programs) with linked specialized departments."
      />

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <SearchInput 
        placeholder="Search degree programs..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition-all font-bold text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Degree Program
          </button>
        }
      />

      <DataTable 
        columns={["Program Code", "Degree Program Title", "Duration", "Departments Under Program", "Active Batches", "Actions"]}
        isEmpty={filteredPrograms.length === 0}
        emptyStateIcon={GraduationCap}
        emptyStateTitle="No programs found"
        emptyStateDescription="We couldn't find any academic programs matching your search."
      >
        {filteredPrograms.map((program) => {
          const deptsUnderProg = departments.filter((d) => d.programId === program.id);
          const activeBatchesCount = batches.filter((b) => b.programId === program.id).length;

          return (
            <tr key={program.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-5 py-4">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px] border border-emerald-200/80">
                  {program.code}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{program.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Academic Program</span>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                  {program.duration || "4 Years"}
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
                </div>
              </td>
              <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                {activeBatchesCount} Batch(es)
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(program)}
                    className="p-1.5 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Program"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(program.id, program.name)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProg ? "Edit Degree Program" : "Add Degree Program"}
        footer={
          <>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {editingProg ? "Update Program" : "Save Program"}
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
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Program Duration</label>
              <select 
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-brand-dark transition-all" 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
