export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <span className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
