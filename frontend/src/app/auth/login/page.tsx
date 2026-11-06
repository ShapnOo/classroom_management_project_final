import LoginForm from "@/components/auth/LoginForm";
import AnimatedSide from "@/components/auth/AnimatedSide";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Jahangirnagar University Academic & Classroom Management",
  description: "Sign in to your Academic Workspace for Jahangirnagar University",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#fafaf9] overflow-hidden">
      {/* Left side - Login Form with subtle ambient background */}
      <div className="flex-1 flex flex-col justify-center relative z-10 py-8 px-4 sm:px-6">
        {/* Subtle decorative background aura */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
              backgroundSize: "28px 28px"
            }}
          />
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-teal-100/40 blur-3xl" />
        </div>

        <LoginForm />
      </div>

      {/* Right side - Animated Dynamic Visuals (hidden on small screens) */}
      <div className="hidden lg:flex flex-1 relative">
        <AnimatedSide />
      </div>
    </div>
  );
}
