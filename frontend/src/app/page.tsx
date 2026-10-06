"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = authStorage.getUser();
    const token = authStorage.getToken();

    if (token && user && user.role) {
      const userRole = user.role.toLowerCase();
      const targetPath = userRole === "admin" 
        ? "/dashboard/admin" 
        : userRole === "teacher" 
          ? "/dashboard/teacher" 
          : "/dashboard/student";
      router.replace(targetPath);
    } else {
      router.replace("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-9 h-9 border-4 border-brand-dark border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-slate-500 font-semibold mt-3">Restoring your workspace session...</p>
    </div>
  );
}
