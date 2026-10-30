'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select } from '@/components/Select';
import { useStudentProfile } from '@/features/student/hooks';
import { api, errorMessage } from '@/lib/api';
import { studentProfileSchema, type StudentProfileValues } from '@/schemas';
import { useToast } from '@/store/toast';

export default function StudentProfilePage() {
  const { data, isLoading, isError } = useStudentProfile();
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);
  const { register, handleSubmit, formState: { errors } } = useForm<StudentProfileValues>({
    resolver: zodResolver(studentProfileSchema),
    values: data ? {
      fullName: data.fullName, phone: data.phone, city: data.city, locality: data.locality ?? '',
      educationLevel: data.educationLevel ?? '', preferredLearningMode: data.preferredLearningMode ?? 'BOTH', subjectsNeeded: data.subjectsNeeded ?? '',
    } : undefined,
  });
  const save = useMutation({
    mutationFn: async (v: StudentProfileValues) => (await api.put('/students/me/profile', v)).data,
    onSuccess: () => { toast('success', 'Profile updated'); qc.invalidateQueries({ queryKey: ['student', 'profile'] }); qc.invalidateQueries({ queryKey: ['me'] }); },
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Could not load your profile." />;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4 rounded-2xl bg-white p-6 shadow-card" noValidate>
        <h1 className="text-2xl font-extrabold text-brand-800">My profile</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Phone number" type="tel" error={errors.phone?.message} {...register('phone')} />
          <Input label="City" error={errors.city?.message} {...register('city')} />
          <Input label="Locality" error={errors.locality?.message} {...register('locality')} />
          <Input label="Class or education level" error={errors.educationLevel?.message} {...register('educationLevel')} />
          <Select label="Preferred learning mode" error={errors.preferredLearningMode?.message} {...register('preferredLearningMode')}>
            <option value="HOME">Home Tuition</option><option value="ONLINE">Online</option><option value="BOTH">Both</option>
          </Select>
        </div>
        <Input label="Subjects requiring tutoring" error={errors.subjectsNeeded?.message} {...register('subjectsNeeded')} />
        {save.isError && <ErrorMessage message={errorMessage(save.error)} />}
        <Button type="submit" loading={save.isPending}>Save Changes</Button>
      </form>
      <ChangePasswordForm />
    </div>
  );
}
