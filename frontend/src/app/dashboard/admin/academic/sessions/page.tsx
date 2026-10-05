"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { useStore } from "@/lib/store";
import type { Session } from "@/lib/types";

const EMPTY_FORM = { name: "", startDate: "", endDate: "", status: "Upcoming" as Session["status"] };

export default function SessionsPage() {
  const { sessions, addSession, updateSession, deleteSession } = useStore();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = sessions.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setIsOpen(true); };
  const openEdit = (s: Session) => { setEditing(s); setForm({ name: s.name, startDate: s.startDate, endDate: s.endDate, status: s.status }); setIsOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    if (editing) updateSession(editing.id, form);
    else addSession(form);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader title="Academic Sessions" description="Manage time periods (e.g. Fall 2025, Spring 2026). Sessions are the root of all academic data — batches and classrooms depend on them." />

      <SearchInput placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)}
        actionButton={
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> Add Session
          </button>
        }
      />

      <DataTable columns={["Session Name", "Start Date", "End Date", "Batches", "Status", "Actions"]}
        isEmpty={filtered.length === 0} emptyStateIcon={CalendarDays} emptyStateTitle="No sessions found" emptyStateDescription="Create your first academic session to get started.">
        {filtered.map(s => (
          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[11px] text-slate-900">{s.name}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{new Date(s.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{new Date(s.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-500">—</td>
            <td className="px-5 py-4"><StatusBadge status={s.status} /></td>
            <td className="px-5 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteSession(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Session" : "Add New Session"}
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">Save Session</button>
        </>}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Session Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Fall 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Session["status"] }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option>Upcoming</option><option>Active</option><option>Completed</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
