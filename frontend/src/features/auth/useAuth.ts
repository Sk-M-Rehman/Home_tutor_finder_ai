'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { dashboardPath } from '@/lib/utils';
import type { User } from '@/types';

export function useAuth() {
  const q = useQuery({
    queryKey: ['me'],
    retry: false,
    staleTime: 60_000,
    queryFn: async (): Promise<User | null> => {
      try {
        return (await api.get<User>('/auth/me')).data;
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) return null;
        throw e;
      }
    },
  });
  return { user: q.data ?? null, isLoading: q.isLoading, isError: q.isError };
}

/** Shared by sign-in (path "login") and sign-up (path "register"). */
export function useAuthMutation(path: 'login' | 'register') {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (body: unknown) => (await api.post<User>(`/auth/${path}`, body)).data,
    onSuccess: (user) => {
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
      qc.setQueryData(['me'], user);
      router.push(dashboardPath(user.role));
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => api.post('/auth/logout'),
    onSettled: () => {
      qc.clear();
      qc.setQueryData(['me'], null);
      router.push('/');
    },
  });
}
