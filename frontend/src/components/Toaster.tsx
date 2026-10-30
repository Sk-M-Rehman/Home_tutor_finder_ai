'use client';
import { useToast } from '@/store/toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[90vw] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role="status" className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-card ${t.kind === 'success' ? 'bg-accent-700' : 'bg-red-600'}`}>
          <span>{t.text}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="font-bold">×</button>
        </div>
      ))}
    </div>
  );
}
