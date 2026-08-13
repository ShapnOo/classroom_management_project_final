"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type Program = {
  id: string;
  code: string;
  name: string;
  department: string;
  status: "Active" | "Upcoming" | "Completed";
};

const initialPrograms: Program[] = [
  { id: "1", code: "PGDIT", name: "Post Graduate Diploma in IT", department: "Computer Science & Engineering", status: "Active" },
  { id: "2", code: "BSc CSE", name: "B.Sc. in Computer Science & Engineering", department: "Computer Science & Engineering", status: "Active" },
  { id: "3", code: "BBA", name: "Bachelor of Business Administration", department: "Business Administration", status: "Upcoming" },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader 
        title="Academic Programs" 
        description="Manage the degree programs offered by each department."
      />

      <SearchInput 
        placeholder="Search programs..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-dark text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-all font-medium text-[11px] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Program
          </button>
        }
      />

      <DataTable 
        columns={["Program Code", "Program Name", "Department", "Status", "Actions"]}
        isEmpty={filteredPrograms.length === 0}
        emptyStateIcon={GraduationCap}
        emptyStateTitle="No programs found"
        emptyStateDescription="We couldn't find any academic programs matching your search."
      >
        {filteredPrograms.map((program) => (
          <tr key={program.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <span className="font-semibold text-brand-dark bg-brand-dark/5 px-2 py-0.5 rounded-md text-[11px] border border-brand-dark/10">
                {program.code}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-[11px] text-slate-900">{program.name}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{program.department}</td>
            <td className="px-5 py-4">
              <StatusBadge status={program.status} />
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
        title="Add Academic Program"
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
              Save Program
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700">Program Code</label>
              <input type="text" placeholder="e.g. PGDIT" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
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
            <label className="text-[11px] font-medium text-slate-700">Program Name</label>
            <input type="text" placeholder="e.g. Post Graduate Diploma in IT" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="text-[11px] font-medium text-slate-700">Assign to Department <span className="text-red-500">*</span></label>
            <select required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all">
              <option value="" disabled selected>Select a department</option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="EEE">Electrical & Electronic Engineering</option>
              <option value="BBA">Business Administration</option>
            </select>
            <p className="text-[10px] text-slate-500">Every program must belong to an academic department.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
