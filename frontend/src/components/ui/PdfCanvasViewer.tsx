"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Download,
  FileText,
  Loader2,
  Layers,
  Sparkles,
  Check,
  RefreshCw
} from "lucide-react";

interface PdfCanvasViewerProps {
  url: string;
  initialPage?: number;
  onPageChange?: (page: number, totalPages: number) => void;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  title?: string;
}

export default function PdfCanvasViewer({
  url,
  initialPage = 1,
  onPageChange,
  className = "",
  isFullscreen = false,
  onToggleFullscreen,
  title
}: PdfCanvasViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallbackEmbed, setUseFallbackEmbed] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF Document via pdfjs-dist
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    async function loadPdf() {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Set worker
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument({
          url,
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        const startPage = Math.min(doc.numPages, Math.max(1, initialPage));
        setCurrentPage(startPage);
        setIsLoading(false);
        onPageChange?.(startPage, doc.numPages);
      } catch (err: any) {
        console.warn("PDF.js loading failed, switching to native PDF embed fallback:", err);
        if (!isCancelled) {
          setError(err?.message || "Failed to parse PDF document");
          setUseFallbackEmbed(true);
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [url]);

  // Render current page on canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const page = await pdfDocRef.current.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        // Auto-scale or fit to container width if desired
        const viewport = page.getViewport({ scale, rotation });

        // High-DPI screen sharp rendering (Retina display support)
        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("PDF page render error:", err);
        }
      }
    },
    [scale, rotation]
  );

  useEffect(() => {
    if (!isLoading && pdfDocRef.current && currentPage > 0) {
      renderPage(currentPage);
      onPageChange?.(currentPage, numPages);
    }
  }, [currentPage, renderPage, isLoading, numPages, onPageChange]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(3.0, +(s + 0.2).toFixed(1)));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));
  };

  const handleFitWidth = () => {
    if (!containerRef.current || !pdfDocRef.current) return;
    pdfDocRef.current.getPage(currentPage).then((page: any) => {
      const naturalVp = page.getViewport({ scale: 1.0, rotation });
      const availableWidth = containerRef.current!.clientWidth - 64;
      if (availableWidth > 0 && naturalVp.width > 0) {
        setScale(+(availableWidth / naturalVp.width).toFixed(2));
      }
    });
  };

  const handleFitPage = () => {
    if (!containerRef.current || !pdfDocRef.current) return;
    pdfDocRef.current.getPage(currentPage).then((page: any) => {
      const naturalVp = page.getViewport({ scale: 1.0, rotation });
      const availableHeight = containerRef.current!.clientHeight - 80;
      if (availableHeight > 0 && naturalVp.height > 0) {
        setScale(+(availableHeight / naturalVp.height).toFixed(2));
      }
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        handlePrevPage();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages]);

  // Auto-fit PDF page on fullscreen toggle
  useEffect(() => {
    if (isFullscreen) {
      const timer = setTimeout(() => {
        handleFitPage();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-slate-950 text-white overflow-hidden select-none font-sans ${className}`}
    >
      {/* ── INVISIBLE HOVER TRIGGER TO EXIT FULLSCREEN (Top Right Corner) ─── */}
      {isFullscreen && onToggleFullscreen && (
        <div className="fixed top-0 right-0 p-4 z-[100000] group pointer-events-auto">
          <button
            onClick={onToggleFullscreen}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3.5 py-2 rounded-full bg-black/85 hover:bg-black text-slate-300 hover:text-white border border-white/20 text-xs font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md cursor-pointer"
            title="Exit Fullscreen (Esc or F)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      {/* ── PDF FLOATING / DOCKED CONTROLS BAR (HIDDEN IN FULLSCREEN) ─────────────────── */}
      {!isFullscreen && (
        <div className="h-12 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-20 shadow-md">
          
          {/* Left: Document Info & Page Stepper */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800/90 rounded-xl px-2 py-1 border border-slate-700/80">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isLoading}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Previous Page (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2 text-xs font-mono font-bold text-white">
                <span>{currentPage}</span>
                <span className="text-slate-500">/</span>
                <span>{numPages || "..."}</span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= numPages || isLoading}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Next Page (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {numPages > 1 && (
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  showThumbnails
                    ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50"
                    : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
                title="Toggle Page Thumbnails"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline text-[11px]">Pages</span>
              </button>
            )}

            {title && (
              <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-[320px] ml-2 hidden sm:inline">
                {title}
              </span>
            )}
          </div>

          {/* Center/Right: Zoom & Viewport Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl px-2 py-1 border border-slate-700/80">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.6 || isLoading}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-300 px-1 min-w-[42px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 3.0 || isLoading}
                className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Fit Presets */}
            <button
              onClick={handleFitPage}
              className="hidden sm:inline-flex px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Fit to Page Height"
            >
              Fit Page
            </button>
            <button
              onClick={handleFitWidth}
              className="hidden sm:inline-flex px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Fit to Container Width"
            >
              Fit Width
            </button>

            {/* Rotate */}
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Download */}
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Download PDF Document"
            >
              <Download className="w-3.5 h-3.5" />
            </a>

            {/* Fullscreen Toggle */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs ml-1"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View (F)"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}

          </div>

        </div>
      )}

      {/* ── MAIN STAGE & THUMBNAILS DRAWER ───────────────────────────────────── */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Thumbnails Sidebar */}
        {!isFullscreen && showThumbnails && numPages > 0 && (
          <div className="w-48 bg-slate-900 border-r border-slate-800 p-3 overflow-y-auto space-y-2 z-10 shrink-0 animate-in slide-in-from-left-2 duration-150">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              All Pages ({numPages})
            </div>
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => {
                  setCurrentPage(pNum);
                  setShowThumbnails(false);
                }}
                className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between border ${
                  currentPage === pNum
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                    : "bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-mono font-bold">Page {pNum}</span>
                </div>
                {currentPage === pNum && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            ))}
          </div>
        )}

        {/* Canvas Display Viewport */}
        <div
          onClick={(e) => {
            if (isFullscreen) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              if (clickX < rect.width * 0.25) {
                handlePrevPage();
              } else {
                handleNextPage();
              }
            }
          }}
          className={`flex-1 relative flex items-center justify-center overflow-auto ${
            isFullscreen ? "p-0 m-0 bg-black cursor-default" : "p-4 sm:p-8 bg-slate-950/90"
          }`}
        >
          
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 z-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs font-medium text-slate-400">Loading High-Fidelity PDF Document...</span>
            </div>
          )}

          {useFallbackEmbed ? (
            <iframe
              src={`${url}#page=${currentPage}&view=FitH`}
              title="PDF Viewer"
              className="w-full h-full border-0 rounded-xl shadow-2xl bg-slate-900"
            />
          ) : (
            <div
              className={`relative inline-block ${
                isFullscreen
                  ? "border-0 shadow-none rounded-none bg-black"
                  : "shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white"
              }`}
            >
              <canvas
                ref={canvasRef}
                className="block max-w-none transition-transform duration-75"
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
