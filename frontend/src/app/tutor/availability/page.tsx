'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { EmptyState, ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select } from '@/components/Select';
import { useAvailabilityMutations, useMyAvailability } from '@/features/tutor/hooks';
import { errorMessage } from '@/lib/api';
import { DAYS, dayLabel, fmtTime } from '@/lib/utils';
import { availabilitySchema, type AvailabilityValues } from '@/schemas';
import { useToast } from '@/store/toast';

export default function AvailabilityPage() {
  const { data, isLoading, isError } = useMyAvailability();
  const { add, update, remove } = useAvailabilityMutations();
  const toast = useToast((s) => s.push);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AvailabilityValues>({
    resolver: zodResolver(availabilitySchema), defaultValues: { dayOfWeek: 'MONDAY' },
  });
  const fail = (e: unknown) => toast('error', errorMessage(e));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-brand-800">Weekly availability</h1>

      <form onSubmit={handleSubmit((v) => add.mutate(v, { onSuccess: () => { toast('success', 'Slot added'); reset({ dayOfWeek: v.dayOfWeek, startTime: '', endTime: '' }); }, onError: fail }))}
        className="grid gap-4 rounded-2xl bg-white p-6 shadow-card sm:grid-cols-4 sm:items-start" noValidate>
        <Select label="Day" error={errors.dayOfWeek?.message} {...register('dayOfWeek')}>{DAYS.map((d) => <option key={d} value={d}>{dayLabel(d)}</option>)}</Select>
        <Input label="From" type="time" error={errors.startTime?.message} {...register('startTime')} />
        <Input label="To" type="time" error={errors.endTime?.message} {...register('endTime')} />
        <div className="sm:pt-6"><Button type="submit" loading={add.isPending} className="w-full">Add Slot</Button></div>
      </form>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message="Could not load availability." />}
      {data && data.length === 0 && <EmptyState title="No slots yet" text="Add the days and times you can teach." />}
      <ul className="space-y-2">
        {data?.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card">
            <div>
              <p className="font-semibold">{dayLabel(a.dayOfWeek)}: {fmtTime(a.startTime)} – {fmtTime(a.endTime)}</p>
              <p className={`text-xs ${a.available ? 'text-green-700' : 'text-slate-500'}`}>{a.available ? 'Available' : 'Paused'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={update.isPending}
                onClick={() => update.mutate({ id: a.id, body: { dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime, available: !a.available } }, { onError: fail })}>
                {a.available ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate(a.id, { onSuccess: () => toast('success', 'Slot deleted'), onError: fail })}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
