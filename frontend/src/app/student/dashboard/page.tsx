'use client';
import Link from 'next/link';
import { Button, LinkButton } from '@/components/Button';
import { DashboardCard } from '@/components/DashboardCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RequestList } from '@/components/RequestList';
import { useAuth, useLogout } from '@/features/auth/useAuth';
import { useStudentProfile, useStudentRequests } from '@/features/student/hooks';
import { MODE_LABEL } from '@/lib/utils';

export default function StudentDashboard() {
  const { user } = useAuth();
  const profile = useStudentProfile();
  const requests = useStudentRequests();
  const logout = useLogout();

  if (requests.isLoading || profile.isLoading) return <LoadingSpinner />;
  if (requests.isError || profile.isError) return <ErrorMessage message="Could not load your dashboard." />;
  const list = requests.data ?? [];
  const p = profile.data!;
  const count = (s: string) => list.filter((r) => r.status === s).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-800">Welcome, {user?.fullName}</h1>
        <div className="flex gap-2">
          <LinkButton href="/find-tutors" variant="accent">Find Tutors</LinkButton>
          <LinkButton href="/student/profile" variant="secondary">Edit Profile</LinkButton>
          <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>Logout</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard title="Total requests" value={list.length} />
        <DashboardCard title="Pending" value={count('PENDING')} />
        <DashboardCard title="Accepted" value={count('ACCEPTED')} />
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="font-bold text-brand-800">Your profile</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Location</dt><dd>{[p.locality, p.city].filter(Boolean).join(', ')}</dd></div>
          <div><dt className="text-slate-500">Education level</dt><dd>{p.educationLevel || '—'}</dd></div>
          <div><dt className="text-slate-500">Learning mode</dt><dd>{p.preferredLearningMode ? MODE_LABEL[p.preferredLearningMode] : '—'}</dd></div>
          <div><dt className="text-slate-500">Subjects needed</dt><dd>{p.subjectsNeeded || '—'}</dd></div>
        </dl>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-brand-800">Recent requests</h2><Link href="/student/requests" className="text-sm text-brand-700 underline">View all</Link></div>
        <RequestList requests={list.slice(0, 3)} role="STUDENT" />
      </section>
    </div>
  );
}
