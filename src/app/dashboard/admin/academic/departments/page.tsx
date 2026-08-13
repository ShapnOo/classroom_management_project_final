"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type Department = {
  id: string;
  code: string;
  name: string;
  head: string;
  status: "Active" | "Upcoming" | "Completed";
};

const initialDepartments: Department[] = [
  { id: "1", code: "CSE", name: "Computer Science & Engineering", head: "Dr. Alan Turing", status: "Active" },
  { id: "2", code: "EEE", name: "Electrical & Electronic Engineering", head: "Dr. Nikola Tesla", status: "Active" },
  { id: "3", code: "BBA", name: "Business Administration", head: "Dr. Philip Kotler", status: "Active" },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Academic Departments" 
        description="Manage the main departments of your institution."
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Department
          </button>
        }
      />

      <SearchInput 
        placeholder="Search departments by name or code..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        totalCount={departments.length}
        totalLabel="Departments"
      />

      <DataTable 
        columns={["Dept Code", "Department Name", "Head of Dept", "Status", "Actions"]}
        isEmpty={filteredDepartments.length === 0}
        emptyStateIcon={Building2}
        emptyStateTitle="No departments found"
        emptyStateDescription="We couldn't find any departments matching your search."
      >
        {filteredDepartments.map((dept) => (
          <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <span className="font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded-md text-[11px] border border-brand-dark/10">
                {dept.code}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[11px] text-slate-900">{dept.name}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{dept.head}</td>
            <td className="px-5 py-4">
              <StatusBadge status={dept.status} />
            </td>
            <td className="px-5 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-slate-400 hover:text-brand-dark rounded-md hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Department"
        footer={
          <>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all"
            >
              Save Department
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Department Code</label>
              <input type="text" placeholder="e.g. CSE" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Status</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Department Name</label>
            <input type="text" placeholder="e.g. Computer Science & Engineering" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-700">Head of Department (Optional)</label>
            <input type="text" placeholder="e.g. Dr. Alan Turing" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
