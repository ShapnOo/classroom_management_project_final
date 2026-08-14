"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Student } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Plus, Search, Edit2, Trash2, Mail, Users, Hash, Phone } from "lucide-react";

export default function AdminStudents() {
  const { students, batches, programs, addStudent, updateStudent, deleteStudent } = useStore();
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNo: "",
    programId: "",
    batchId: "",
    phone: "",
  });

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(search.toLowerCase());
    const batch = batches.find(b => b.id === s.batchId);
    const matchesProgram = programFilter === "all" || batch?.programId === programFilter;
    const matchesBatch = batchFilter === "all" || s.batchId === batchFilter;
    return matchesSearch && matchesProgram && matchesBatch;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", rollNo: "", programId: "", batchId: "", phone: "" });
    setIsOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    const batch = batches.find(b => b.id === s.batchId);
    setForm({ 
      name: s.name, 
      email: s.email, 
      rollNo: s.rollNo, 
      programId: batch?.programId || "", 
      batchId: s.batchId, 
      phone: s.phone || "" 
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.rollNo || !form.batchId) return;
    
    const payload = { ...form };
    delete (payload as any).programId;
    if (!payload.phone) delete (payload as any).phone;
    
    if (editing) {
      updateStudent(editing.id, payload);
    } else {
      addStudent(payload);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">Students</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage enrolled students across all batches.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
          </div>
          <select value={programFilter} onChange={e => { setProgramFilter(e.target.value); setBatchFilter("all"); }} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer">
            <option value="all">All Programs</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.code}</option>
            ))}
          </select>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} disabled={programFilter === "all"} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer disabled:bg-slate-50 disabled:text-slate-400">
            <option value="all">All Batches</option>
            {batches.filter(b => b.programId === programFilter).map(b => (
              <option key={b.id} value={b.id}>{b.code}</option>
            ))}
          </select>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap shrink-0">
            <Plus className="w-3.5 h-3.5" /> Add Student
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(s => {
          const batch = batches.find(b => b.id === s.batchId);
          return (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-dark/30 hover:shadow-sm transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-dark/10 flex items-center justify-center text-brand-dark font-medium text-[12px]">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-900">{s.name}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Roll: {s.rollNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="p-1 text-slate-400 hover:text-brand-dark hover:bg-brand-dark/5 rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteStudent(s.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {s.email}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {batch?.code || "Unknown Batch"}
                  </div>
                  {s.phone && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {s.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-[12px] text-slate-500">No students found matching your criteria.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Student" : "Add Student"} maxWidth="max-w-md"
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">{editing ? "Update" : "Add Student"}</button>
        </>}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Alice Johnson" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Roll No <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. 26-001" value={form.rollNo} onChange={e => setForm(f => ({ ...f, rollNo: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Program <span className="text-red-500">*</span></label>
              <select value={form.programId} onChange={e => setForm(f => ({ ...f, programId: e.target.value, batchId: "" }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors bg-white">
                <option value="">Select Program</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.code}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Batch <span className="text-red-500">*</span></label>
              <select value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))} disabled={!form.programId} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors bg-white disabled:bg-slate-50 disabled:text-slate-400">
                <option value="">Select Batch</option>
                {batches.filter(b => b.programId === form.programId).map(b => (
                  <option key={b.id} value={b.id}>{b.code}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input type="email" placeholder="e.g. alice@edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Phone (Optional)</label>
            <input type="text" placeholder="e.g. +1 555-0100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
