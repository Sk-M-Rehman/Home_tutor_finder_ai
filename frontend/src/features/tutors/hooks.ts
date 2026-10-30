'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Availability, Page, Subject, Tutor } from '@/types';

export function useSubjects() {
  return useQuery({ queryKey: ['subjects'], staleTime: 10 * 60_000, queryFn: async () => (await api.get<Subject[]>('/subjects')).data });
}

export function useTutors(params: Record<string, string | number | undefined>) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  return useQuery({
    queryKey: ['tutors', clean],
    placeholderData: keepPreviousData,
    queryFn: async () => (await api.get<Page<Tutor>>('/tutors', { params: clean })).data,
  });
}

export function useFeaturedTutors() {
  return useQuery({ queryKey: ['tutors', 'featured'], queryFn: async () => (await api.get<Tutor[]>('/tutors/featured')).data });
}

export function useTutor(id: string) {
  return useQuery({ queryKey: ['tutor', id], queryFn: async () => (await api.get<Tutor>(`/tutors/${id}`)).data });
}

export function useTutorAvailability(id: string) {
  return useQuery({ queryKey: ['tutor', id, 'availability'], queryFn: async () => (await api.get<Availability[]>(`/tutors/${id}/availability`)).data });
}
