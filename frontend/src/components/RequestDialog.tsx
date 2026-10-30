'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateRequest } from '@/features/student/hooks';
import { errorMessage } from '@/lib/api';
import { requestSchema, type RequestValues } from '@/schemas';
import { useToast } from '@/store/toast';
import type { Tutor } from '@/types';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import { Input, Textarea } from './Input';
import { Select } from './Select';

export function RequestDialog({ tutor, onClose }: { tutor: Tutor; onClose: () => void }) {
  const toast = useToast((s) => s.push);
  const create = useCreateRequest();
  const { register, handleSubmit, formState: { errors } } = useForm<RequestValues>({ resolver: zodResolver(requestSchema) });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSubmit = (v: RequestValues) =>
    create.mutate({ ...v, tutorId: tutor.id }, {
      onSuccess: () => { toast('success', 'Request sent to ' + tutor.fullName); onClose(); },
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="req-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <h2 id="req-title" className="text-lg font-bold text-brand-800">Request tutoring from {tutor.fullName}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          <Select label="Subject" defaultValue="" error={errors.subjectId?.message} {...register('subjectId', { valueAsNumber: true })}>
            <option value="" disabled>Select a subject</option>
            {tutor.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Preferred date" type="date" min={new Date().toISOString().slice(0, 10)} error={errors.requestedDate?.message} {...register('requestedDate')} />
            <Input label="Preferred time" type="time" error={errors.requestedTime?.message} {...register('requestedTime')} />
          </div>
          <Textarea label="Message" placeholder="Tell the tutor what you need help with" error={errors.message?.message} {...register('message')} />
          {create.isError && <ErrorMessage message={errorMessage(create.error)} />}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={create.isPending}>Send Request</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
