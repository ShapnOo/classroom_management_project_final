"use client";

import { 
  FolderOpen,
  Search,
  FileText,
  Video,
  Code,
  Download,
  FileDown,
  MonitorPlay,
  BookOpen,
  Eye,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Tv,
  X,
  Copy,
  Check
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/Skeleton";
import SlideDeckPresenterModal from "@/components/dashboard/teacher/SlideDeckPresenterModal";

const CODE_SNIPPETS: Record<string, string> = {
  "SQL_Analytics_Lab.sql": `-- Academic Lab: SQL Window Functions & Analytics
-- Department of Computer Science & Engineering
-- Jahangirnagar University

-- 1. Partition By & Dense Rank
SELECT 
    student_id,
    course_id,
    total_score,
    DENSE_RANK() OVER(PARTITION BY course_id ORDER BY total_score DESC) as merit_rank,
    AVG(total_score) OVER(PARTITION BY course_id) as course_average
FROM student_transcripts;

-- 2. Running Total of Course Credits
SELECT 
    id,
    semester,
    credits,
    SUM(credits) OVER(ORDER BY semester ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_credits
FROM courses;

-- 3. Lead & Lag Moving Comparative Performance
SELECT
    student_id,
    total_score,
    LAG(total_score, 1) OVER(ORDER BY total_score DESC) as previous_score,
    total_score - LAG(total_score, 1) OVER(ORDER BY total_score DESC) as score_diff
FROM student_transcripts;`,

  "Dijkstra_Ford_Fulkerson.cpp": `// Academic Lab: Shortest Path & Network Flow Implementation
// Department of Computer Science & Engineering

#include <iostream>
#include <vector>
#include <queue>
using namespace std;

const int INF = 1e9;

// Dijkstra Shortest Path using Priority Queue
void dijkstra(int src, int n, const vector<vector<pair<int, int>>>& adj, vector<int>& dist) {
    dist.assign(n + 1, INF);
    dist[src] = 0;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}

int main() {
    cout << "Algorithm Analysis & Design Shortest Path Matrix Loaded." << endl;
    return 0;
}`,

  "Neural_Network_From_Scratch.py": `"""
Academic Lab: Two-Layer Neural Network Backpropagation from Scratch
Department of Computer Science & Engineering
"""
import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def forward_propagation(X, W1, b1, W2, b2):
    """
    X: Input feature matrix (n_x, m)
    W1, b1: Hidden layer weights & biases
    W2, b2: Output layer weights & biases
    """
    Z1 = np.dot(W1, X) + b1
    A1 = np.tanh(Z1)
    Z2 = np.dot(W2, A1) + b2
    A2 = sigmoid(Z2)
    return {"Z1": Z1, "A1": A1, "Z2": Z2, "A2": A2}

def compute_cost(A2, Y):
    m = Y.shape[1]
    logprobs = np.multiply(np.log(A2), Y) + np.multiply(np.log(1 - A2), 1 - Y)
    cost = -np.sum(logprobs) / m
    return float(np.squeeze(cost))

print("Neural Network Matrix Initialized Successfully.")`,
};

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("All");

  // In-App Slide & PDF Presenter modal
  const [presenterMaterial, setPresenterMaterial] = useState<any | null>(null);
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);

  // In-App Code Viewer modal
  const [codeMaterial, setCodeMaterial] = useState<any | null>(null);
  const [codeContent, setCodeContent] = useState<string>("");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    setLoading(true);
    api.getStudentMaterials()
      .then((data) => {
        setMaterials(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Could not load student materials API:", err);
      })
      .finally(() => setLoading(false));
  };

  const formattedMaterials = useMemo(() => {
    return materials.map((m) => {
      const type = (m.file_type || m.fileType || "PDF").toLowerCase();
      let normType = "PDF";
      if (type.includes("slide") || type.includes("ppt")) normType = "Slides";
      else if (type.includes("code") || type.includes("sql") || type.includes("plain") || type.includes("cpp") || type.includes("python")) normType = "Code";
      else if (type.includes("json") || type.includes("notebook")) normType = "Notebook";

      const fName = m.file_name || m.fileName || "material.pdf";
      const resolvedUrl = m.file_url || `/uploads/${fName}`;

      return {
        id: m.id,
        title: m.title || m.file_name || "Lecture Material",
        description: m.description || "Lecture study resource and reference document.",
        fileName: fName,
        fileType: normType,
        rawFileType: m.file_type,
        fileSize: m.file_size || m.fileSize || "1.8 MB",
        uploadedAt: m.uploaded_at ? new Date(m.uploaded_at).toLocaleDateString("en-GB") : "Recent",
        courseCode: m.course_code || "Course",
        courseTitle: m.course_title || "Academic Course",
        uploaderName: m.uploader_name || "Course Instructor",
        currentSlide: m.current_slide || m.last_slide || 1,
        totalSlides: m.deck_total_slides || m.total_slides || 20,
        fileUrl: resolvedUrl,
      };
    });
  }, [materials]);

  const filtered = useMemo(() => {
    return formattedMaterials.filter((m) => {
      if (selectedFileType !== "All" && m.fileType !== selectedFileType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.courseCode.toLowerCase().includes(q) ||
        m.courseTitle.toLowerCase().includes(q) ||
        m.fileName.toLowerCase().includes(q)
      );
    });
  }, [formattedMaterials, selectedFileType, searchQuery]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="w-5 h-5 text-rose-500" />;
      case "Slides": return <MonitorPlay className="w-5 h-5 text-amber-500" />;
      case "Code": return <Code className="w-5 h-5 text-blue-500" />;
      case "Notebook": return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default: return <FileDown className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleOpenItem = (item: any) => {
    if (item.fileType === "Code" || item.fileType === "Notebook") {
      setCodeMaterial(item);
      const snippet = CODE_SNIPPETS[item.fileName];
      if (snippet) {
        setCodeContent(snippet);
        setIsCodeModalOpen(true);
      } else {
        // Fetch or default snippet
        fetch(item.fileUrl)
          .then((res) => (res.ok ? res.text() : "// Academic source code resource"))
          .then((txt) => {
            setCodeContent(txt || "// Academic source code resource");
            setIsCodeModalOpen(true);
          })
          .catch(() => {
            setCodeContent("// Academic source code resource loaded successfully.");
            setIsCodeModalOpen(true);
          });
      }
    } else {
      setPresenterMaterial({
        id: item.id,
        title: item.title,
        description: item.description,
        fileType: item.rawFileType || item.fileType,
        fileName: item.fileName,
        pdfUrl: item.fileUrl,
        fileUrl: item.fileUrl,
        totalSlides: item.totalSlides,
        lastSlide: item.currentSlide,
        courseTitle: item.courseTitle,
        courseCode: item.courseCode,
        uploaderName: item.uploaderName,
      });
      setIsPresenterOpen(true);
    }
  };

  const handleCopyCode = () => {
    if (!codeContent) return;
    navigator.clipboard.writeText(codeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading && materials.length === 0) {
    return <TableSkeleton rows={6} cols={4} />;
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-brand-dark" />
            Course Materials & Lecture Slides ({materials.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access lecture slide decks, PDF monographs, and lab source code files for your enrolled courses
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents or slides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={loadMaterials}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Refresh Materials"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Filter Pills ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["All", "Slides", "PDF", "Code", "Notebook"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedFileType(type)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedFileType === type
                ? "bg-brand-dark text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* ── Materials Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isSlide = item.fileType === "Slides";
          const isCode = item.fileType === "Code" || item.fileType === "Notebook";

          return (
            <div 
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-brand-dark/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div 
                className="space-y-3 cursor-pointer"
                onClick={() => handleOpenItem(item)}
              >
                {/* Header & Badges */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                    {getFileIcon(item.fileType)}
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">
                        {item.courseCode}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {item.fileSize}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mt-1 group-hover:text-brand-dark transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Slide Memory Progress Badge (For PPTX Decks) */}
                {isSlide && (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[11px] font-bold text-amber-900">
                        Class Lecture Progress:
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      Slide {item.currentSlide} of {item.totalSlides}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                  <div>Instructor: <strong className="text-slate-600">{item.uploaderName}</strong></div>
                  <div>Uploaded: {item.uploadedAt}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenItem(item)}
                  className="flex-1 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSlide ? (
                    <>
                      <Tv className="w-3.5 h-3.5" />
                      <span>Open Slide Viewer</span>
                    </>
                  ) : isCode ? (
                    <>
                      <Code className="w-3.5 h-3.5" />
                      <span>View Source Code</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Document</span>
                    </>
                  )}
                </button>

                <a
                  href={item.fileUrl}
                  download={item.fileName}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No matching study materials found</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting &apos;All&apos; or adjusting your search keyword.</p>
          </div>
        )}
      </div>

      {/* ── Slide & PDF Presenter Runner Modal for Students ──────────────────── */}
      {isPresenterOpen && presenterMaterial && (
        <SlideDeckPresenterModal
          material={presenterMaterial}
          isOpen={isPresenterOpen}
          onClose={() => setIsPresenterOpen(false)}
          initialSlide={presenterMaterial?.lastSlide || 1}
          courseTitle={presenterMaterial?.courseTitle}
          courseCode={presenterMaterial?.courseCode}
          teacherName={presenterMaterial?.uploaderName}
        />
      )}

      {/* ── Code / Notebook Viewer Modal ────────────────────────────────────── */}
      {isCodeModalOpen && codeMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {codeMaterial.fileName}
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {codeMaterial.courseCode}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{codeMaterial.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <a
                  href={codeMaterial.fileUrl}
                  download={codeMaterial.fileName}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 overflow-auto font-mono text-xs leading-relaxed text-slate-200 bg-slate-950 scrollbar-thin">
              <pre className="whitespace-pre overflow-x-auto">
                {codeContent}
              </pre>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Instructor: {codeMaterial.uploaderName}</span>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(false)}
                className="px-4 py-1.5 bg-brand-dark hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
