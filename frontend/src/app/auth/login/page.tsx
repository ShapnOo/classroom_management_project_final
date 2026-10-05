import LoginForm from "@/components/auth/LoginForm";
import AnimatedSide from "@/components/auth/AnimatedSide";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Classroom Management",
  description: "Sign in to your Classroom Management workspace",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center">
        <LoginForm />
      </div>

      {/* Right side - Animated Visuals (hidden on small screens) */}
      <div className="hidden lg:flex flex-1">
        <AnimatedSide />
      </div>
    </div>
  );
}
