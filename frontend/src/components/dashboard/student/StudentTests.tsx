"use client";

import { 
  FileText,
  Search,
  ClipboardList,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  MapPin,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function StudentTests() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Upcoming" | "Active" | "Completed">("All");

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = () => {
    setLoading(true);
    api.getStudentTests()
      .then((data) => {
        setTests(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Could not load student tests API:", err);
      })
      .finally(() => setLoading(false));
  };

  const formattedTests = useMemo(() => {
    return tests.map((t) => {
      const isGraded = t.obtained_marks !== null && t.obtained_marks !== undefined;
      const isCompleted = t.status === "Completed" || isGraded;

      return {
        id: t.id,
        title: t.title,
        description: t.description || "Class test assessment and evaluation.",
        testDate: new Date(t.test_date || t.testDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),
        testDateObj: new Date(t.test_date || t.testDate),
        duration: t.duration || "45m",
        totalMarks: Number(t.total_marks || t.totalMarks) || 20,
        obtainedMarks: isGraded ? Number(t.obtained_marks) : null,
        feedback: t.feedback || "",
        status: isGraded ? "Completed" : (t.status || "Upcoming"),
        room: t.room || "Lecture Hall",
        courseCode: t.course_code || t.courseCode || "CSE",
        courseTitle: t.course_title || t.courseTitle || "Academic Course",
      };
    });
  }, [tests]);

  const filtered = useMemo(() => {
    return formattedTests.filter((t) => {
      if (statusFilter !== "All" && t.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.courseCode.toLowerCase().includes(q) ||
        t.courseTitle.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [formattedTests, statusFilter, searchQuery]);

  if (loading && tests.length === 0) {
    return <TableSkeleton rows={6} cols={5} />;
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-dark" />
            Class Tests & Exam Schedules ({tests.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upcoming class tests, quizzes, mid-term examinations, and published feedback
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search test or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={loadTests}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
            title="Refresh Tests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Filter Pills ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {(["All", "Upcoming", "Active", "Completed"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              statusFilter === filter
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            {filter} ({filter === "All" ? tests.length : formattedTests.filter((t) => t.status.toLowerCase() === filter.toLowerCase()).length})
          </button>
        ))}
      </div>

      {/* ── Tests Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const isGraded = t.obtainedMarks !== null;

          return (
            <div 
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                      {t.courseCode}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      t.status === 'Completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : t.status === 'Active'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-slate-900">
                    {t.totalMarks} Marks
                  </span>
                </div>

                <div>
                  <h2 className="text-xs font-bold text-slate-900 leading-snug">
                    {t.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {t.courseTitle}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {t.description}
                </p>

                {/* Exam Details Box */}
                <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Exam Date:</span>
                    <strong className="text-slate-800">{t.testDate}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Duration:</span>
                    <span className="text-slate-700 font-semibold">{t.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Hall / Lab:</span>
                    <span className="text-slate-700 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {t.room}
                    </span>
                  </div>
                </div>

                {/* Obtained Marks & Feedback (if graded) */}
                {isGraded && (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/70 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                        Score Obtained
                      </span>
                      <strong className="text-xs font-extrabold text-emerald-800">
                        {t.obtainedMarks} / {t.totalMarks}
                      </strong>
                    </div>
                    {t.feedback && (
                      <p className="text-[11px] text-emerald-900 mt-1 italic">
                        &quot;{t.feedback}&quot;
                      </p>
                    )}
                  </div>
                )}

              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 text-[10px]">
                  Continuous UGC Evaluation
                </span>
                {isGraded ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Graded
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded">
                    Preparation Active
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No matching class tests found</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting &apos;All&apos; or adjusting your search keyword.</p>
          </div>
        )}
      </div>

    </div>
  );
}
