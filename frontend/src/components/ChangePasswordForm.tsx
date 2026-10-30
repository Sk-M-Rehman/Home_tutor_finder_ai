'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api, errorMessage } from '@/lib/api';
import { changePasswordSchema, type ChangePasswordValues } from '@/schemas';
import { useToast } from '@/store/toast';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import { Input } from './Input';

export function ChangePasswordForm() {
  const toast = useToast((s) => s.push);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });
  const m = useMutation({
    mutationFn: async (v: ChangePasswordValues) => api.post('/auth/change-password', v),
    onSuccess: () => { toast('success', 'Password changed'); reset(); },
  });
  return (
    <form onSubmit={handleSubmit((v) => m.mutate(v))} className="space-y-4 rounded-2xl bg-white p-6 shadow-card" noValidate>
      <h2 className="text-lg font-bold text-brand-800">Change password</h2>
      <Input label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
      <Input label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
      <Input label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmNewPassword?.message} {...register('confirmNewPassword')} />
      {m.isError && <ErrorMessage message={errorMessage(m.error)} />}
      <Button type="submit" loading={m.isPending}>Update Password</Button>
    </form>
  );
}
