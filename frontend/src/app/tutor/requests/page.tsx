'use client';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RequestList } from '@/components/RequestList';
import { useTutorRequests, useUpdateRequestStatus } from '@/features/tutor/hooks';
import { errorMessage } from '@/lib/api';
import { useToast } from '@/store/toast';

export default function TutorRequests() {
  const { data, isLoading, isError } = useTutorRequests();
  const update = useUpdateRequestStatus();
  const toast = useToast((s) => s.push);
  const act = (id: number, status: 'ACCEPTED' | 'REJECTED') =>
    update.mutate({ id, status }, { onSuccess: () => toast('success', `Request ${status.toLowerCase()}`), onError: (e) => toast('error', errorMessage(e)) });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-brand-800">Student requests</h1>
      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message="Could not load requests." />}
      {data && <RequestList requests={data} role="TUTOR" busyId={update.isPending ? update.variables?.id : undefined} onAccept={(id) => act(id, 'ACCEPTED')} onReject={(id) => act(id, 'REJECTED')} />}
    </div>
  );
}
