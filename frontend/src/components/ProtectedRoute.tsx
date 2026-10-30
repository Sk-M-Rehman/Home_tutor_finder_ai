'use client';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import type { Role } from '@/types';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user, isLoading, isError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isError) return;
    if (!user) router.replace('/sign-in');
    else if (user.role !== role) router.replace('/unauthorized');
  }, [user, isLoading, isError, role, router]);

  if (isError) return <div className="mx-auto max-w-xl p-8"><ErrorMessage message="Cannot reach the server. Please make sure the backend is running." /></div>;
  if (isLoading || !user || user.role !== role) return <LoadingSpinner />;
  return <>{children}</>;
}
