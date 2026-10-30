import type { ReactNode } from 'react';

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-800">{title}</h1>
      <div className="mt-6 space-y-4 text-slate-700">{children}</div>
    </div>
  );
}
