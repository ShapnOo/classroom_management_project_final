"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import type { Batch } from "@/lib/types";

type Form = Omit<Batch, "id">;
const EMPTY: Form = { code: "", name: "", programId: "", sessionId: "", section: "", status: "Upcoming" };

export default function BatchesPage() {
  const { batches, sessions, programs, students, addBatch, updateBatch, deleteBatch } = useStore();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const filtered = batches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    sessions.find(s => s.id === b.sessionId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (b: Batch) => { setEditing(b); setForm({ code: b.code, name: b.name, programId: b.programId, sessionId: b.sessionId, section: b.section, status: b.status }); setIsOpen(true); };
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
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> Add Batch
          </button>
        }
      />

      <DataTable columns={["Batch Code", "Batch Name", "Program", "Session", "Students", "Status", "Actions"]}
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Batch" : "Add New Batch"}
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">Save Batch</button>
        </>}
      >
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
      </Modal>
    </div>
  );
}
