import { inr, initials, MODE_LABEL } from '@/lib/utils';
import type { Tutor } from '@/types';
import { LinkButton } from './Button';
import { SendRequestButton } from './SendRequestButton';

export function TutorCard({ tutor }: { tutor: Tutor }) {
  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700" aria-hidden>{initials(tutor.fullName)}</div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-900">{tutor.fullName}</h3>
          <p className="truncate text-sm text-slate-600">{tutor.qualification}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tutor.subjects.map((s) => <span key={s.id} className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">{s.name}</span>)}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-slate-500">Experience</dt><dd className="font-medium">{tutor.experienceYears} yr{tutor.experienceYears === 1 ? '' : 's'}</dd></div>
        <div><dt className="text-slate-500">Fee</dt><dd className="font-medium">{inr(tutor.hourlyFee)}/hr</dd></div>
        <div><dt className="text-slate-500">Location</dt><dd className="font-medium">{[tutor.locality, tutor.city].filter(Boolean).join(', ')}</dd></div>
        <div><dt className="text-slate-500">Mode</dt><dd className="font-medium">{MODE_LABEL[tutor.teachingMode]}</dd></div>
        {tutor.averageRating !== null && <div><dt className="text-slate-500">Rating</dt><dd className="font-medium">★ {tutor.averageRating.toFixed(1)}</dd></div>}
      </dl>
      <div className="mt-5 flex gap-2">
        <LinkButton href={`/tutors/${tutor.id}`} variant="secondary" className="flex-1">View Profile</LinkButton>
        <SendRequestButton tutor={tutor} />
      </div>
    </article>
  );
}
