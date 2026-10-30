import { dayLabel, inr } from '@/lib/utils';
import type { Role, TutoringRequest } from '@/types';
import { Button } from './Button';
import { EmptyState } from './ErrorMessage';
import { StatusBadge } from './StatusBadge';
import { PaymentButton } from './PaymentButton';

interface Props {
  requests: TutoringRequest[];
  role: Role;
  busyId?: number;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}

export function RequestList({ requests, role, busyId, onAccept, onReject, onCancel }: Props) {
  if (requests.length === 0) return <EmptyState title="No requests yet" text={role === 'STUDENT' ? 'Find a tutor and send your first request.' : 'Student requests will appear here.'} />;
  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li key={r.id} className="rounded-2xl bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900">{r.subjectName} · {role === 'STUDENT' ? r.tutorName : r.studentName}</p>
              <p className="text-sm text-slate-500">
                {dayLabel(new Date(r.requestedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase())},{' '}
                {new Date(r.requestedDate + 'T00:00:00').toLocaleDateString('en-IN')} at {r.requestedTime.slice(0, 5)}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <p className="mt-3 text-sm text-slate-700">{r.message}</p>
          {r.contactPhone && <p className="mt-2 text-sm font-medium text-accent-700">Contact: {r.contactPhone}</p>}
          {r.status === 'ACCEPTED' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-4">
              <div>
                <p className="font-semibold text-brand-800">One-hour session · {inr(r.paymentAmount)}</p>
                <p className="text-sm text-slate-600">
                  {r.paymentStatus === 'PAID'
                    ? 'Payment complete'
                    : role === 'TUTOR'
                      ? 'Awaiting student payment'
                      : r.paymentStatus === 'PENDING'
                        ? 'Payment started. Complete or retry payment.'
                        : 'Pay securely with Razorpay to confirm.'}
                </p>
                {role === 'STUDENT' && r.paymentStatus === 'PENDING' && <p className="text-xs text-slate-500">Online cancellation is unavailable after payment starts.</p>}
              </div>
              {role === 'STUDENT' && r.paymentStatus !== 'PAID' && <PaymentButton requestId={r.id} amount={r.paymentAmount} />}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {role === 'TUTOR' && r.status === 'PENDING' && (
              <>
                <Button variant="accent" loading={busyId === r.id} onClick={() => onAccept?.(r.id)}>Accept</Button>
                <Button variant="danger" disabled={busyId === r.id} onClick={() => onReject?.(r.id)}>Reject</Button>
              </>
            )}
            {role === 'STUDENT' && (r.status === 'PENDING' || (r.status === 'ACCEPTED' && r.paymentStatus === null)) && (
              <Button variant="secondary" loading={busyId === r.id} onClick={() => onCancel?.(r.id)}>Cancel Request</Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
