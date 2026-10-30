'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Input } from '@/components/Input';
import { useAuthMutation } from '@/features/auth/useAuth';
import { errorMessage } from '@/lib/api';
import { signInSchema, type SignInValues } from '@/schemas';

export default function SignInPage() {
  const [show, setShow] = useState(false);
  const login = useAuthMutation('login');
  const { register, handleSubmit, formState: { errors } } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4 rounded-2xl bg-white p-6 shadow-card" noValidate>
        <h1 className="text-2xl font-extrabold text-brand-800">Sign in</h1>
        <Input label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <div>
          <Input label="Password" type={show ? 'text' : 'password'} autoComplete="current-password" error={errors.password?.message} {...register('password')} />
          <button type="button" onClick={() => setShow(!show)} className="mt-1 text-xs font-medium text-brand-700 underline">{show ? 'Hide password' : 'Show password'}</button>
        </div>
        {login.isError && <ErrorMessage message={errorMessage(login.error)} />}
        <Button type="submit" className="w-full" loading={login.isPending}>Sign In</Button>
        <div className="flex justify-between text-sm">
          <Link href="/sign-up" className="text-brand-700 underline">Create Account</Link>
          <Link href="/forgot-password" className="text-brand-700 underline">Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
}
