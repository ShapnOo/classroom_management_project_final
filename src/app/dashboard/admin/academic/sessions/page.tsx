"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

type Session = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Upcoming" | "Completed";
};

const initialSessions: Session[] = [
  { id: "1", name: "Fall 2025", startDate: "2025-09-01", endDate: "2026-01-31", status: "Upcoming" },
  { id: "2", name: "Spring 2025", startDate: "2025-02-01", endDate: "2025-06-30", status: "Active" },
  { id: "3", name: "Fall 2024", startDate: "2024-09-01", endDate: "2025-01-31", status: "Completed" },
];

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Academic Sessions" 
        description="Manage academic sessions and their timelines."
        actionButton={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark/90 transition-all font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </button>
        }
      />

      <SearchInput 
        placeholder="Search sessions..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        totalCount={sessions.length}
        totalLabel="Total Sessions"
      />

      <DataTable 
        columns={["Session Name", "Start Date", "End Date", "Status", "Actions"]}
        isEmpty={filteredSessions.length === 0}
        emptyStateIcon={CalendarDays}
        emptyStateTitle="No sessions found"
        emptyStateDescription="We couldn't find any sessions matching your search."
      >
        {filteredSessions.map((session) => (
          <tr key={session.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span className="font-medium text-slate-900">{session.name}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">{new Date(session.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td className="px-6 py-4">
              <StatusBadge status={session.status} />
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-brand-dark rounded-lg hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Session"
        footer={
          <>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-dark hover:bg-brand-dark/90 rounded-lg shadow-sm transition-all"
            >
              Save Session
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Session Name</label>
            <input type="text" placeholder="e.g. Fall 2025" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Start Date</label>
              <input type="date" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-slate-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">End Date</label>
              <input type="date" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-slate-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all bg-white text-slate-600">
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
