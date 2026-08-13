"use client";

import { useState } from "react";
import { FileText, Calendar, Users, Award, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { tests } from "@/lib/mockData";
import Link from "next/link";

export default function GlobalTestsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTests = tests.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <PageHeader
        title="Global Class Tests"
        description="Monitor all tests, quizzes, and exams scheduled across the institution."
      />

      <SearchInput
        placeholder="Search tests by title, course, or teacher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <DataTable
        columns={["Test Details", "Classroom & Teacher", "Test Date", "Participation", "Status", "Actions"]}
        isEmpty={filteredTests.length === 0}
        emptyStateIcon={FileText}
        emptyStateTitle="No tests found"
        emptyStateDescription="No class tests match your search criteria."
      >
        {filteredTests.map((test) => (
          <tr key={test.id} className="hover:bg-slate-50/80 transition-colors group">
            <td className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100 shadow-sm shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-[11px] text-slate-900 block mb-0.5">{test.title}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Award className="w-3 h-3 text-amber-500" />
                    {test.totalMarks} Marks
                  </span>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-[11px] text-slate-800">{test.course}</span>
                <span className="text-[10px] text-slate-500">{test.batch} • {test.teacher}</span>
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {test.testDate}
              </div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {test.submissions} / {test.totalStudents}
              </div>
            </td>
            <td className="px-5 py-4">
              <StatusBadge status={test.status} />
            </td>
            <td className="px-5 py-4 text-right">
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-brand-dark transition-colors text-[11px] font-medium shadow-sm opacity-0 group-hover:opacity-100"
              >
                View Details <ArrowRight className="w-3 h-3" />
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
