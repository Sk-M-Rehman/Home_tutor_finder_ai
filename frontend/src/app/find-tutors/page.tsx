'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/Button';
import { EmptyState, ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DEFAULT_SORT, SearchFilters, type Filters } from '@/components/SearchFilters';
import { TutorCard } from '@/components/TutorCard';
import { useSubjects, useTutors } from '@/features/tutors/hooks';

function FindTutors() {
  const sp = useSearchParams();
  const router = useRouter();
  const subjects = useSubjects();

  const filters: Filters = {
    subject: sp.get('subject') ?? '', city: sp.get('city') ?? '', locality: sp.get('locality') ?? '',
    minFee: sp.get('minFee') ?? '', maxFee: sp.get('maxFee') ?? '', teachingMode: sp.get('teachingMode') ?? '',
    minExperience: sp.get('minExperience') ?? '', sort: sp.get('sort') ?? DEFAULT_SORT,
  };
  const page = Number(sp.get('page') ?? 0) || 0;

  const go = (f: Filters, p = 0) => {
    const q = new URLSearchParams();
    (Object.keys(f) as (keyof Filters)[]).forEach((k) => { if (f[k] && !(k === 'sort' && f[k] === DEFAULT_SORT)) q.set(k, f[k]); });
    if (p > 0) q.set('page', String(p));
    router.push(`/find-tutors${q.toString() ? `?${q}` : ''}`);
  };

  const result = useTutors({ ...filters, page, size: 9 });
  const data = result.data;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[300px_1fr]">
      <aside>
        <SearchFilters key={sp.toString()} initial={filters} subjects={subjects.data ?? []} onApply={(f) => go(f)}
          onClear={() => router.push('/find-tutors')} />
      </aside>
      <section aria-live="polite">
        <h1 className="text-2xl font-bold text-brand-800">Find Tutors</h1>
        {result.isLoading && <LoadingSpinner label="Searching tutors…" />}
        {result.isError && <div className="mt-4"><ErrorMessage message="Could not load tutors. Please try again." /></div>}
        {data && data.content.length === 0 && <div className="mt-4"><EmptyState title="No tutors match your search" text="Try removing some filters." /></div>}
        {data && data.content.length > 0 && (
          <>
            <p className="mt-1 text-sm text-slate-500">{data.totalElements} tutor{data.totalElements === 1 ? '' : 's'} found</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">{data.content.map((t) => <TutorCard key={t.id} tutor={t} />)}</div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="secondary" disabled={page <= 0} onClick={() => go(filters, page - 1)}>Previous</Button>
              <span className="text-sm text-slate-600">Page {data.page + 1} of {Math.max(data.totalPages, 1)}</span>
              <Button variant="secondary" disabled={page + 1 >= data.totalPages} onClick={() => go(filters, page + 1)}>Next</Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default function FindTutorsPage() {
  return <Suspense fallback={<LoadingSpinner />}><FindTutors /></Suspense>;
}
