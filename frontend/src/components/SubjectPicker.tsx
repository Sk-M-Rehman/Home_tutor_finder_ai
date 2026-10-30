'use client';
import { useSubjects } from '@/features/tutors/hooks';
import { ErrorMessage } from './ErrorMessage';

export function SubjectPicker({ value = [], onChange, error }: { value?: number[]; onChange: (v: number[]) => void; error?: string }) {
  const { data, isLoading, isError } = useSubjects();
  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700">Subjects taught</legend>
      {isLoading && <p className="text-sm text-slate-500">Loading subjects…</p>}
      {isError && <ErrorMessage message="Could not load subjects." />}
      <div className="flex flex-wrap gap-2">
        {data?.map((s) => (
          <label key={s.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${value.includes(s.id) ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
            <input type="checkbox" className="sr-only" checked={value.includes(s.id)} onChange={() => toggle(s.id)} />
            {s.name}
          </label>
        ))}
      </div>
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
    </fieldset>
  );
}
