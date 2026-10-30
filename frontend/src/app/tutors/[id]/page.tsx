'use client';
import { useParams } from 'next/navigation';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SendRequestButton } from '@/components/SendRequestButton';
import { useTutor, useTutorAvailability } from '@/features/tutors/hooks';
import { dayLabel, fmtTime, initials, inr, MODE_LABEL } from '@/lib/utils';

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const tutor = useTutor(id);
  const avail = useTutorAvailability(id);

  if (tutor.isLoading) return <LoadingSpinner />;
  if (tutor.isError || !tutor.data) return <div className="mx-auto max-w-xl p-8"><ErrorMessage message="Tutor not found." /></div>;
  const t = tutor.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-card sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700" aria-hidden>{initials(t.fullName)}</div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-brand-800">{t.fullName}</h1>
          <p className="text-slate-600">{t.qualification}</p>
          {t.averageRating !== null && <p className="text-sm font-medium">★ {t.averageRating.toFixed(1)}</p>}
        </div>
        <SendRequestButton tutor={t} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-bold text-brand-800">Details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Experience</dt><dd>{t.experienceYears} years</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Fee</dt><dd>{inr(t.hourlyFee)} / hour</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Teaching mode</dt><dd>{MODE_LABEL[t.teachingMode]}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Location</dt><dd>{[t.locality, t.city].filter(Boolean).join(', ')}</dd></div>
          </dl>
          <h3 className="mt-5 font-semibold text-slate-800">Subjects</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">{t.subjects.map((s) => <span key={s.id} className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">{s.name}</span>)}</div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="font-bold text-brand-800">Weekly availability</h2>
          {avail.isLoading && <LoadingSpinner />}
          {avail.data && avail.data.length === 0 && <p className="mt-3 text-sm text-slate-500">This tutor has not added availability yet.</p>}
          <ul className="mt-3 space-y-1.5 text-sm">
            {avail.data?.filter((a) => a.available).map((a) => <li key={a.id} className="flex justify-between"><span>{dayLabel(a.dayOfWeek)}</span><span>{fmtTime(a.startTime)} – {fmtTime(a.endTime)}</span></li>)}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-800">About</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{t.bio || 'This tutor has not added a biography yet.'}</p>
      </section>
    </div>
  );
}
