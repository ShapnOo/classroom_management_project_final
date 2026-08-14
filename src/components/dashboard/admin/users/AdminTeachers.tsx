"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Teacher } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Plus, Search, Edit2, Trash2, Mail, Briefcase, GraduationCap } from "lucide-react";

export default function AdminTeachers() {
  const { teachers, departments, addTeacher, updateTeacher, deleteTeacher } = useStore();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    departmentId: "",
    designation: "",
  });

  const filtered = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "all" || t.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", departmentId: "", designation: "" });
    setIsOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, departmentId: t.departmentId, designation: t.designation });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.departmentId || !form.designation) return;
    
    if (editing) {
      updateTeacher(editing.id, form);
    } else {
      addTeacher(form);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-[13px] font-medium text-slate-900">Teachers</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage faculty members across all departments.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400" />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-2 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium outline-none focus:border-brand-dark w-full sm:w-auto cursor-pointer">
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap shrink-0">
            <Plus className="w-3.5 h-3.5" /> Add Teacher
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(t => {
          const dept = departments.find(d => d.id === t.departmentId);
          return (
            <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-dark/30 hover:shadow-sm transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-dark/10 flex items-center justify-center text-brand-dark font-medium text-[12px]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-900">{t.name}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">{t.designation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="p-1 text-slate-400 hover:text-brand-dark hover:bg-brand-dark/5 rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteTeacher(t.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {t.email}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {dept?.name || "Unknown Department"}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {t.id}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-[12px] text-slate-500">No teachers found matching your criteria.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Edit Teacher" : "Add Teacher"} maxWidth="max-w-md"
        footer={<>
          <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all">{editing ? "Update" : "Add Teacher"}</button>
        </>}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. Dr. Sarah Jenkins" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input type="email" placeholder="e.g. s.jenkins@edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Designation <span className="text-red-500">*</span></label>
            <select value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors bg-white">
              <option value="">Select Designation</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Department <span className="text-red-500">*</span></label>
            <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:border-brand-dark transition-colors bg-white">
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
