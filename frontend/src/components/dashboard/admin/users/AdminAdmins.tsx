"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import type { AdminUser } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Plus, Search, Edit2, Trash2, Mail, Shield } from "lucide-react";

export default function AdminAdmins() {
  const { admins, addAdmin, updateAdmin, deleteAdmin, fetchAdmins } = useStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  
  const [form, setForm] = useState<{name: string, email: string, role: "Super Admin" | "Staff"}>({
    name: "",
    email: "",
    role: "Staff",
  });

  const filtered = admins.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "Staff" });
    setIsOpen(true);
  };

  const openEdit = (a: AdminUser) => {
    setEditing(a);
    setForm({ name: a.name, email: a.email, role: a.role });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.role) return;
    
    if (editing) {
      updateAdmin(editing.id, form);
    } else {
      addAdmin(form);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full mx-auto space-y-4 pb-8 text-xs font-normal text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Admin Users</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage administrative access to the platform ({admins.length} Total).</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Staff">Staff</option>
          </select>

          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-medium text-[11px] shadow-2xs transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Add Admin
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
                <th className="py-2.5 px-3.5 border-r border-slate-200 min-w-[150px]">Admin Name</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200">Email Address</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 text-center">System Role</th>
                <th className="py-2.5 px-3.5 border-r border-slate-200 text-center">Access Level</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((a, idx) => (
                <tr key={a.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3.5 text-center text-slate-500 font-mono text-[11px] border-r border-slate-200/60">{idx + 1}</td>
                  <td className="py-2.5 px-3.5 border-r border-slate-200/60 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-[11px]">
                        {a.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900">{a.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-700 border-r border-slate-200/60">{a.email}</td>
                  <td className="py-2.5 px-3.5 text-center border-r border-slate-200/60">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      a.role === 'Super Admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {a.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center border-r border-slate-200/60">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                      <Shield className={`w-3.5 h-3.5 ${a.role === 'Super Admin' ? 'text-purple-600' : 'text-slate-400'}`} />
                      {a.role === 'Super Admin' ? 'Full Control' : 'Standard Staff'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(a)}
                        title="Edit Admin"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {admins.length > 1 && (
                        <button
                          onClick={() => deleteAdmin(a.id)}
                          title="Delete Admin"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50">
            No admin users match your search criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? "Edit Admin User" : "Add Admin User"}
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
              {editing ? "Update Admin" : "Add Admin"}
            </button>
          </>
        }
      >
        <div className="space-y-3.5 text-xs font-normal">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. System Admin"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              placeholder="e.g. admin@ju.edu.bd"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">System Role <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={form.role}
              onChange={val => setForm(f => ({ ...f, role: val as "Super Admin" | "Staff" }))}
              options={[
                { value: "Staff", label: "Staff" },
                { value: "Super Admin", label: "Super Admin" }
              ]}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
