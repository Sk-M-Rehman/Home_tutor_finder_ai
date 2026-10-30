'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button, LinkButton } from '@/components/Button';
import { EmptyState, ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TutorCard } from '@/components/TutorCard';
import { GlowButton, GlowLink } from '@/components/ui/shiny-button-1';
import { TutorAssistant } from '@/components/TutorAssistant';
import { useFeaturedTutors, useSubjects } from '@/features/tutors/hooks';

const steps = [
  { t: '1. Search', d: 'Browse tutors by subject, location, fee, experience and teaching mode.' },
  { t: '2. Send a request', d: 'Pick a subject, preferred date and time, and send your enquiry.' },
  { t: '3. Start learning', d: 'Once the tutor accepts, you get their contact details and can begin.' },
];
const studentBenefits = ['Compare tutors by fee, experience and mode', 'Filter by your own locality', 'Track every request and its status', 'Free to join'];
const tutorBenefits = ['Create a profile that showcases your qualifications', 'Set your weekly availability', 'Receive requests from local students', 'Accept or reject on your terms'];
const testimonials = [
  { q: 'Sample testimonial: Finding a maths tutor near our home took minutes.', w: 'Sample parent' },
  { q: 'Sample testimonial: I could set my own timings and fee, which I love.', w: 'Sample tutor' },
  { q: 'Sample testimonial: Tracking my requests in one place is very handy.', w: 'Sample student' },
];

export default function HomePage() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const subjects = useSubjects();
  const featured = useFeaturedTutors();
  const subjectSuggestions = subjects.data?.filter((s) => s.name.toLowerCase().includes(subject.trim().toLowerCase())).slice(0, 6) ?? [];

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (subject.trim()) q.set('subject', subject.trim());
    if (location.trim()) q.set('city', location.trim());
    setShowSubjectSuggestions(false);
    router.push(`/find-tutors${q.toString() ? `?${q}` : ''}`);
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-brand-900 to-brand-700 text-white">
        <div className="animate-float absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="animate-float-slow absolute -bottom-40 left-1/3 -z-10 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-6 md:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent-100 backdrop-blur"><span className="h-2 w-2 rounded-full bg-accent-300" /> Trusted local learning</div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">Learn better with the right tutor beside you.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-100">Find experienced tutors who match your subjects, location, schedule, and learning goals.</p>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-100"><span><strong className="text-2xl text-white">1:1</strong><br />Personal attention</span><span><strong className="text-2xl text-white">Local</strong><br />Trusted tutors</span><span><strong className="text-2xl text-white">Flexible</strong><br />Your schedule</span></div>
          </div>
          <div className="relative"><div className="absolute -inset-3 rounded-[2rem] bg-white/10 blur-xl" /><form onSubmit={search} className="relative rounded-[2rem] border border-white/20 bg-white p-6 text-slate-800 shadow-2xl shadow-brand-950/30 md:p-8">
            <p className="section-kicker">Start your search</p><h2 className="mt-2 text-2xl font-extrabold text-brand-900">Who are you looking for?</h2><p className="mt-2 text-sm text-slate-500">Search by subject and city to discover your best match.</p>
            <div className="relative">
              <Input label="Subject" placeholder="e.g. Mathematics" value={subject} onFocus={() => setShowSubjectSuggestions(true)} onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 120)} onChange={(e) => setSubject(e.target.value)} />
              {showSubjectSuggestions && subjectSuggestions.length > 0 && <div role="listbox" aria-label="Subject suggestions" className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
                {subjectSuggestions.map((s) => <button key={s.id} type="button" role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => { setSubject(s.name); setShowSubjectSuggestions(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-800"><span>{s.name}</span><span className="text-slate-300">↗</span></button>)}
              </div>}
            </div>
            <Input label="Location (city)" placeholder="e.g. Vijayawada" value={location} onChange={(e) => setLocation(e.target.value)} />
            {subjects.data && <div className="-mt-1 flex flex-wrap gap-2"><span className="text-xs font-semibold text-slate-400">Try:</span>{subjects.data.slice(0, 3).map((s) => <button key={s.id} type="button" onClick={() => setSubject(s.name)} className="text-xs font-bold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:text-accent-700">{s.name}</button>)}</div>}
              <Button type="submit" variant="accent" className="mt-2 h-12 w-full">Find my tutor <span aria-hidden>→</span></Button><p className="mt-4 text-center text-xs text-slate-400">Free to join · No commitment</p>
            </form></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <p className="section-kicker">Explore learning paths</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900">Popular subjects</h2>
        {subjects.isLoading && <LoadingSpinner />}
        <div className="mt-4 flex flex-wrap gap-3">
          {subjects.data?.slice(0, 10).map((s) => (
            <Link key={s.id} href={`/find-tutors?subject=${encodeURIComponent(s.name)}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800">{s.name}<span className="ml-3 text-slate-300">↗</span></Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6"><p className="section-kicker">Simple by design</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900">From search to first lesson</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <button key={s.t} type="button" onClick={() => setActiveStep(i)} aria-pressed={activeStep === i} className={`surface-card group p-6 text-left transition hover:-translate-y-1 hover:shadow-xl ${activeStep === i ? 'border-brand-400 bg-brand-50/60 ring-2 ring-brand-100' : ''}`}><div className={`grid h-11 w-11 place-items-center rounded-2xl text-lg font-black transition ${activeStep === i ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700 group-hover:bg-brand-700 group-hover:text-white'}`}>0{i + 1}</div><h3 className="mt-5 text-lg font-extrabold text-brand-900">{s.t.replace(/^\d\. /, '')}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{s.d}</p>{activeStep === i && <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-accent-700">Selected step</span>}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold text-brand-800">Featured tutors</h2>
        {featured.isLoading && <LoadingSpinner />}
        {featured.isError && <div className="mt-4"><ErrorMessage message="Could not load tutors right now." /></div>}
        {featured.data && featured.data.length === 0 && <div className="mt-4"><EmptyState title="No tutors have registered yet" text="Be the first — create a tutor profile." /></div>}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.data?.map((t) => <TutorCard key={t.id} tutor={t} />)}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2">
          {[['Benefits for students', studentBenefits], ['Benefits for tutors', tutorBenefits]].map(([title, items]) => (
            <div key={title as string} className="rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-brand-800">{title as string}</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {(items as string[]).map((i) => <li key={i} className="flex gap-2"><span className="text-accent-600">✓</span>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold text-brand-800">What people say <span className="text-sm font-normal text-slate-500">(demo content, not real reviews)</span></h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.q} className="rounded-2xl bg-white p-6 shadow-card"><blockquote className="text-sm text-slate-700">“{t.q}”</blockquote><figcaption className="mt-3 text-xs font-semibold text-slate-500">— {t.w}</figcaption></figure>
          ))}
        </div>
      </section>

      <section className="bg-brand-800 py-14 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-brand-100">Join as a student to find a tutor, or as a tutor to find students.</p>
        <div className="mt-6 flex justify-center gap-3">
          <GlowLink href="/sign-up">Create Account</GlowLink>
          <LinkButton href="/find-tutors" variant="secondary">Browse Tutors</LinkButton>
        </div>
      </section>
      <TutorAssistant />
    </>
  );
}
