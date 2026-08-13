import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 pb-3 border-b border-slate-200">
      <h1 className="text-[13px] font-medium text-slate-900 leading-tight">{title}</h1>
      {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
    </div>
  );
}
