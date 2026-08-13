import { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ClientProviders from "@/components/dashboard/ClientProviders";

export const metadata: Metadata = {
  title: "Dashboard | Classroom Management",
  description: "Manage your institution efficiently.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <div className="flex h-screen bg-slate-50 overflow-hidden text-brand-dark">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ClientProviders>
  );
}
