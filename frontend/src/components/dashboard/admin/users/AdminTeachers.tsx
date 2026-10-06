"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { Teacher } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Plus, Search, Edit2, Trash2, Mail, Briefcase, GraduationCap } from "lucide-react";

export default function AdminTeachers() {
  const { teachers, departments, addTeacher, updateTeacher, deleteTeacher, fetchTeachers, fetchDepartments } = useStore();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

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
    <div className="w-full mx-auto space-y-4 pb-8 text-xs font-normal text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Faculty Members & Teachers</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage academic faculty members across all departments ({teachers.length} Total).</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-medium text-[11px] shadow-2xs transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Add Teacher
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-300 text-[10px] uppercase tracking-wider font-semibold text-slate-700">
                <th className="py-2.5 px-3.5 text-center w-10 border-r border-slate-200">SL</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 min-w-[150px]">Faculty Name</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Designation</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Email Address</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Department</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((t, idx) => {
                const dept = departments.find(d => d.id === t.departmentId);
                return (
                  <tr key={t.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200/60">{idx + 1}</td>
                    <td className="py-2.5 px-3.5 border-r border-slate-200/60 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-[11px]">
                          {t.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 border-r border-slate-200/60">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {t.designation}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 border-r border-slate-200/60">{t.email}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 border-r border-slate-200/60">
                      {dept?.name || "Computer Science & Engineering"} ({dept?.code || "CSE"})
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          title="Edit Teacher Record"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTeacher(t.id)}
                          title="Delete Teacher"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50">
            No faculty members match your search criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? "Edit Teacher Record" : "Add Faculty Member"}
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-all"
            >
              {editing ? "Update Teacher" : "Add Teacher"}
            </button>
          </>
        }
      >
        <div className="space-y-3.5 text-xs font-normal">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Dr. Sarah Jenkins"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              placeholder="e.g. s.jenkins@ju.edu.bd"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Designation <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={form.designation}
              onChange={val => setForm(f => ({ ...f, designation: val }))}
              options={[
                { value: "Professor", label: "Professor" },
                { value: "Associate Professor", label: "Associate Professor" },
                { value: "Assistant Professor", label: "Assistant Professor" },
                { value: "Lecturer", label: "Lecturer" }
              ]}
              placeholder="Select Designation"
              allowClear
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Department <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={form.departmentId}
              onChange={val => setForm(f => ({ ...f, departmentId: val }))}
              options={departments.map(d => ({ value: d.id, label: `${d.name} (${d.code})` }))}
              placeholder="Select Department"
              allowClear
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
