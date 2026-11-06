import { StudentOnboardingPortal } from "@/components/StudentOnboardingPortal";

export const metadata = {
  title: "Admitted Student E-Verification & Document Onboarding | Jahangirnagar University",
  description: "Official online verification and statutory document submission portal for newly admitted students of Jahangirnagar University.",
};

export default function StudentOnboardingPage() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#fafaf9] min-h-screen">
      {/* ── Interactive Multi-step Portal Component ── */}
      <StudentOnboardingPortal />
    </div>
  );
}
