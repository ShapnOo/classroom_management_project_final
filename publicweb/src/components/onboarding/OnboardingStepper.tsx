"use client";

import { Check, ShieldCheck, UserCheck, FileCheck } from "lucide-react";
import { OnboardingStep } from "./types";

interface OnboardingStepperProps {
  currentStep: OnboardingStep;
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  const steps = [
    { id: "lookup", step: "1", label: "Identification & 2FA", icon: ShieldCheck },
    { id: "biodata", step: "2", label: "Academic Profile", icon: UserCheck },
    { id: "documents", step: "3", label: "Document Submission", icon: FileCheck },
  ];

  const stepOrder = ["lookup", "biodata", "documents", "confirmed"];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {steps.map((s, idx) => {
          const isCompleted = currentStepIndex > idx;
          const isCurrent = currentStep === s.id;
          const Icon = s.icon;

          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isCurrent
                  ? "bg-emerald-50/70 border border-emerald-500/30 text-slate-900 font-bold shadow-2xs"
                  : isCompleted
                  ? "bg-slate-50/60 text-emerald-800 font-semibold"
                  : "bg-slate-50/30 text-slate-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                  isCurrent
                    ? "bg-emerald-700 text-white shadow-xs"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
                  Step {s.step}
                </span>
                <span className="text-xs truncate block font-bold text-slate-800">
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
