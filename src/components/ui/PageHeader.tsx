import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
}

export function PageHeader({ title, description, actionButton }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
      <div>
        <h1 className="text-[13px] font-medium text-slate-900 leading-tight">{title}</h1>
        {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
      </div>
      {actionButton && <div className="flex items-center">{actionButton}</div>}
    </div>
  );
}
