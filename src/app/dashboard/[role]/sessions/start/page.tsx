import { Suspense } from "react";
import StartClassSession from "@/components/dashboard/teacher/StartClassSession";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Class Session | Scholaris",
  description: "Start a new class session, track course continuity, and take attendance.",
};

export default async function StartSessionPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;


  if (role === "teacher") {
    return (
      <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading session...</div>}>
        <StartClassSession />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-sm">🚧</span>
      </div>
      <h2 className="text-sm font-medium text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md text-[13px]">
        Only teachers can start a class session.
      </p>
    </div>
  );
}
