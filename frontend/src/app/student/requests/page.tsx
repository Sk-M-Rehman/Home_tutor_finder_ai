'use client';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RequestList } from '@/components/RequestList';
import { useCancelRequest, useStudentRequests } from '@/features/student/hooks';
import { errorMessage } from '@/lib/api';
import { useToast } from '@/store/toast';

export default function StudentRequests() {
  const { data, isLoading, isError } = useStudentRequests();
  const cancel = useCancelRequest();
  const toast = useToast((s) => s.push);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-brand-800">My requests</h1>
      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message="Could not load requests." />}
      {data && (
        <RequestList requests={data} role="STUDENT" busyId={cancel.isPending ? cancel.variables : undefined}
          onCancel={(id) => cancel.mutate(id, { onSuccess: () => toast('success', 'Request cancelled'), onError: (e) => toast('error', errorMessage(e)) })} />
      )}
    </div>
  );
}
