"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, BookOpen, MonitorPlay, Users, Building2, CheckCircle } from "lucide-react";
import { authStorage } from "@/lib/api";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";

export default function TeacherProfilePage() {
  const { settings, getMyClassroomViews, fetchClassrooms, fetchCourses } = useStore();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchClassrooms();
    fetchCourses();
    const u = authStorage.getUser();
    if (u) setCurrentUser(u);
  }, []);

  const myClassrooms = getMyClassroomViews();
  const totalStudents = myClassrooms.reduce((sum, v) => sum + v.studentCount, 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10">
      <PageHeader 
        title="Teacher Profile" 
        description="View your active teaching credentials, assigned courses, and faculty privileges."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-brand-dark text-white text-2xl font-bold flex items-center justify-center mb-3 shadow-md">
            {currentUser?.name ? currentUser.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "SA"}
          </div>
          <h2 className="text-sm font-semibold text-slate-900">{currentUser?.name || "Prof. Dr. Shamim Al Mamun"}</h2>
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
            Faculty / Professor
          </span>
          <p className="text-[11px] text-slate-500 mt-2">{currentUser?.email || "sam@juniv.edu"}</p>

          <div className="w-full mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <p className="text-lg font-bold text-slate-900">{myClassrooms.length}</p>
              <p className="text-[10px] font-medium text-slate-500">Classrooms</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <p className="text-lg font-bold text-slate-900">{totalStudents}</p>
              <p className="text-[10px] font-medium text-slate-500">Students</p>
            </div>
          </div>
        </div>

        {/* Account Details & Faculty Information */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2">Faculty Overview</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Full Name</p>
                <p className="font-semibold text-slate-900 mt-0.5">{currentUser?.name || "Prof. Dr. Shamim Al Mamun"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Email Address</p>
                <p className="font-semibold text-slate-900 mt-0.5">{currentUser?.email || "sam@juniv.edu"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Department</p>
                <p className="font-semibold text-slate-900 mt-0.5">Computer Science & Engineering</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Institution</p>
                <p className="font-semibold text-slate-900 mt-0.5">{settings.schoolName || "Jahangirnagar University"}</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2 pt-2">Teacher Privileges & Responsibilities</h3>
          <div className="space-y-2">
            {[
              "Syllabus coverage tracking and topic status updates",
              "Conduct live sessions and instant digital attendance recording",
              "Upload and publish course materials (PDF, Slides, Code, Notes)",
              "Create & grade class assignments and continuous evaluation tests",
              "Grade entry and result sheet generation for assigned courses"
            ].map((perm, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
