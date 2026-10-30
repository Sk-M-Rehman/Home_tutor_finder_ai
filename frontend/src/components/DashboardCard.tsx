import type { ReactNode } from 'react';

export function DashboardCard({ title, value, hint, children }: { title: string; value?: ReactNode; hint?: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {value !== undefined && <p className="mt-1 text-3xl font-bold text-brand-800">{value}</p>}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {children}
    </div>
  );
}
