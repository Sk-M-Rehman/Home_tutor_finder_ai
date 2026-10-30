'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select } from '@/components/Select';
import { SubjectPicker } from '@/components/SubjectPicker';
import { useAuthMutation } from '@/features/auth/useAuth';
import { errorMessage } from '@/lib/api';
import { signUpSchema, type SignUpValues } from '@/schemas';

function SignUp() {
  const sp = useSearchParams();
  const [show, setShow] = useState(false);
  const registerUser = useAuthMutation('register');
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    shouldUnregister: true,
    defaultValues: { role: sp.get('role') === 'TUTOR' ? 'TUTOR' : 'STUDENT', acceptTerms: false },
  });
  const role = watch('role');
  const roleBtn = (r: 'STUDENT' | 'TUTOR', label: string) => (
    <button type="button" aria-pressed={role === r} onClick={() => setValue('role', r)}
      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold ${role === r ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{label}</button>
  );
  const modeOptions = (
    <>
      <option value="" disabled>Select</option>
      <option value="HOME">Home Tuition</option><option value="ONLINE">Online</option><option value="BOTH">Both</option>
    </>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <form onSubmit={handleSubmit((v) => registerUser.mutate(v))} className="space-y-5 rounded-2xl bg-white p-6 shadow-card" noValidate>
        <h1 className="text-2xl font-extrabold text-brand-800">Create your account</h1>
        <div className="flex gap-3" role="group" aria-label="Account type">{roleBtn('STUDENT', 'I am a Student')}{roleBtn('TUTOR', 'I am a Tutor')}</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
          <Input label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone number" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
          <Input label="City" error={errors.city?.message} {...register('city')} />
          <Input label="Locality or area" error={errors.locality?.message} {...register('locality')} />
          <div />
          <Input label="Password" type={show ? 'text' : 'password'} autoComplete="new-password" hint="Min 8 characters, with a letter and a digit" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm password" type={show ? 'text' : 'password'} autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        </div>
        <button type="button" onClick={() => setShow(!show)} className="text-xs font-medium text-brand-700 underline">{show ? 'Hide passwords' : 'Show passwords'}</button>

        {role === 'STUDENT' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Class or education level" placeholder="e.g. Class 10" error={errors.educationLevel?.message} {...register('educationLevel')} />
            <Select label="Preferred learning mode" defaultValue="" error={errors.preferredLearningMode?.message} {...register('preferredLearningMode')}>{modeOptions}</Select>
            <div className="sm:col-span-2"><Input label="Subjects requiring tutoring" placeholder="e.g. Maths, Physics" error={errors.subjectsNeeded?.message} {...register('subjectsNeeded')} /></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Qualifications" placeholder="e.g. M.Sc Mathematics" error={errors.qualification?.message} {...register('qualification')} />
            <Input label="Years of experience" type="number" min={0} error={errors.experienceYears?.message} {...register('experienceYears', { valueAsNumber: true })} />
            <Select label="Teaching mode" defaultValue="" error={errors.teachingMode?.message} {...register('teachingMode')}>{modeOptions}</Select>
            <Input label="Expected fee per hour (₹)" type="number" min={1} error={errors.hourlyFee?.message} {...register('hourlyFee', { valueAsNumber: true })} />
            <div className="sm:col-span-2">
              <Controller control={control} name="subjectIds" render={({ field }) => <SubjectPicker value={field.value} onChange={field.onChange} error={errors.subjectIds?.message} />} />
            </div>
          </div>
        )}

        <div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" {...register('acceptTerms')} /><span>I agree to the <Link href="/terms" className="text-brand-700 underline">Terms and Conditions</Link></span></label>
          {errors.acceptTerms && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.acceptTerms.message}</p>}
        </div>

        {registerUser.isError && <ErrorMessage message={errorMessage(registerUser.error)} />}
        <Button type="submit" className="w-full" loading={registerUser.isPending}>Create Account</Button>
        <p className="text-center text-sm text-slate-600">Already have an account? <Link href="/sign-in" className="text-brand-700 underline">Sign In</Link></p>
      </form>
    </div>
  );
}

export default function SignUpPage() {
  return <Suspense fallback={<LoadingSpinner />}><SignUp /></Suspense>;
}
