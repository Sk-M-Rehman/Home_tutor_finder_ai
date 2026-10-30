'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Availability, Tutor, TutoringRequest } from '@/types';

export function useMyTutorProfile() {
  return useQuery({ queryKey: ['tutor', 'me'], queryFn: async () => (await api.get<Tutor>('/tutors/me/profile')).data });
}

export function useMyAvailability() {
  return useQuery({ queryKey: ['tutor', 'me', 'availability'], queryFn: async () => (await api.get<Availability[]>('/tutors/me/availability')).data });
}

export function useTutorRequests() {
  return useQuery({ queryKey: ['requests', 'tutor'], queryFn: async () => (await api.get<TutoringRequest[]>('/requests/tutor/me')).data });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: number; status: 'ACCEPTED' | 'REJECTED' }) =>
      (await api.patch<TutoringRequest>(`/requests/${v.id}/status`, { status: v.status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests', 'tutor'] }),
  });
}

type SlotBody = { dayOfWeek: string; startTime: string; endTime: string; available?: boolean };

export function useAvailabilityMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ['tutor', 'me', 'availability'] });
  return {
    add: useMutation({ mutationFn: async (b: SlotBody) => (await api.post('/tutors/me/availability', b)).data, onSuccess: done }),
    update: useMutation({ mutationFn: async (v: { id: number; body: SlotBody }) => (await api.put(`/tutors/me/availability/${v.id}`, v.body)).data, onSuccess: done }),
    remove: useMutation({ mutationFn: async (id: number) => api.delete(`/tutors/me/availability/${id}`), onSuccess: done }),
  };
}
