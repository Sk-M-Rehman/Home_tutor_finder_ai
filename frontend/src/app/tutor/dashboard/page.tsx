'use client';
import Link from 'next/link';
import { Button, LinkButton } from '@/components/Button';
import { DashboardCard } from '@/components/DashboardCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RequestList } from '@/components/RequestList';
import { useAuth, useLogout } from '@/features/auth/useAuth';
import { useMyAvailability, useMyTutorProfile, useTutorRequests, useUpdateRequestStatus } from '@/features/tutor/hooks';
import { errorMessage } from '@/lib/api';
import { dayLabel, inr } from '@/lib/utils';
import { useToast } from '@/store/toast';

export default function TutorDashboard() {
  const { user } = useAuth();
  const profile = useMyTutorProfile();
  const avail = useMyAvailability();
  const requests = useTutorRequests();
  const update = useUpdateRequestStatus();
  const logout = useLogout();
  const toast = useToast((s) => s.push);

  if (profile.isLoading || avail.isLoading || requests.isLoading) return <LoadingSpinner />;
  if (profile.isError || avail.isError || requests.isError) return <ErrorMessage message="Could not load your dashboard." />;
  const p = profile.data!;
  const slots = (avail.data ?? []).filter((a) => a.available);
  const list = requests.data ?? [];
  const count = (s: string) => list.filter((r) => r.status === s).length;

  const checks = [!!p.bio, !!p.qualification, p.subjects.length > 0, !!p.locality, slots.length > 0];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const act = (id: number, status: 'ACCEPTED' | 'REJECTED') =>
    update.mutate({ id, status }, { onSuccess: () => toast('success', `Request ${status.toLowerCase()}`), onError: (e) => toast('error', errorMessage(e)) });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-brand-800">Welcome, {user?.fullName}</h1>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/tutor/profile" variant="accent">Manage Profile</LinkButton>
          <LinkButton href="/tutor/availability" variant="secondary">Manage Availability</LinkButton>
          <Button variant="ghost" onClick={() => logout.mutate()} loading={logout.isPending}>Logout</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Pending requests" value={count('PENDING')} />
        <DashboardCard title="Accepted" value={count('ACCEPTED')} />
        <DashboardCard title="Rejected" value={count('REJECTED')} />
        <DashboardCard title="Profile completion" value={`${completion}%`}>
          <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-accent-600" style={{ width: `${completion}%` }} /></div>
        </DashboardCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard title="Teaching">
          <p className="mt-1 text-sm">{p.experienceYears} years experience · {inr(p.hourlyFee)}/hr</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{p.subjects.map((s) => <span key={s.id} className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-700">{s.name}</span>)}</div>
        </DashboardCard>
        <DashboardCard title="Availability">
          {slots.length === 0 ? <p className="mt-1 text-sm text-slate-500">No availability set yet.</p> : (
            <p className="mt-1 text-sm">{slots.length} slot{slots.length === 1 ? '' : 's'} on {[...new Set(slots.map((s) => dayLabel(s.dayOfWeek).slice(0, 3)))].join(', ')}</p>
          )}
        </DashboardCard>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-brand-800">Incoming requests</h2><Link href="/tutor/requests" className="text-sm text-brand-700 underline">View all</Link></div>
        <RequestList requests={list.slice(0, 3)} role="TUTOR" busyId={update.isPending ? update.variables?.id : undefined}
          onAccept={(id) => act(id, 'ACCEPTED')} onReject={(id) => act(id, 'REJECTED')} />
      </section>
    </div>
  );
}
