'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input, Textarea } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select } from '@/components/Select';
import { SubjectPicker } from '@/components/SubjectPicker';
import { useAuth } from '@/features/auth/useAuth';
import { useMyTutorProfile } from '@/features/tutor/hooks';
import { api, errorMessage } from '@/lib/api';
import { tutorProfileSchema, type TutorProfileValues } from '@/schemas';
import { useToast } from '@/store/toast';

export default function TutorProfilePage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useMyTutorProfile();
  const qc = useQueryClient();
  const toast = useToast((s) => s.push);
  const { register, handleSubmit, control, formState: { errors } } = useForm<TutorProfileValues>({
    resolver: zodResolver(tutorProfileSchema),
    values: data && user ? {
      fullName: data.fullName, phone: user.phone, bio: data.bio ?? '', city: data.city, locality: data.locality ?? '',
      qualification: data.qualification, experienceYears: data.experienceYears, hourlyFee: data.hourlyFee,
      teachingMode: data.teachingMode, subjectIds: data.subjects.map((s) => s.id),
    } : undefined,
  });
  const save = useMutation({
    mutationFn: async (v: TutorProfileValues) => (await api.put('/tutors/me/profile', v)).data,
    onSuccess: () => { toast('success', 'Profile updated'); qc.invalidateQueries({ queryKey: ['tutor'] }); qc.invalidateQueries({ queryKey: ['tutors'] }); qc.invalidateQueries({ queryKey: ['me'] }); },
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Could not load your profile." />;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4 rounded-2xl bg-white p-6 shadow-card" noValidate>
        <h1 className="text-2xl font-extrabold text-brand-800">Tutor profile</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Phone number" type="tel" error={errors.phone?.message} {...register('phone')} />
          <Input label="City" error={errors.city?.message} {...register('city')} />
          <Input label="Locality" error={errors.locality?.message} {...register('locality')} />
          <Input label="Qualifications" error={errors.qualification?.message} {...register('qualification')} />
          <Input label="Years of experience" type="number" min={0} error={errors.experienceYears?.message} {...register('experienceYears', { valueAsNumber: true })} />
          <Input label="Fee per hour (₹)" type="number" min={1} error={errors.hourlyFee?.message} {...register('hourlyFee', { valueAsNumber: true })} />
          <Select label="Teaching mode" error={errors.teachingMode?.message} {...register('teachingMode')}>
            <option value="HOME">Home Tuition</option><option value="ONLINE">Online</option><option value="BOTH">Both</option>
          </Select>
        </div>
        <Textarea label="Biography" placeholder="Tell students about your teaching style and background" error={errors.bio?.message} {...register('bio')} />
        <Controller control={control} name="subjectIds" render={({ field }) => <SubjectPicker value={field.value} onChange={field.onChange} error={errors.subjectIds?.message} />} />
        {save.isError && <ErrorMessage message={errorMessage(save.error)} />}
        <Button type="submit" loading={save.isPending}>Save Changes</Button>
      </form>
      <ChangePasswordForm />
    </div>
  );
}
