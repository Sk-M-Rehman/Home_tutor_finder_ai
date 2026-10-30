'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaymentOrder, PaymentVerification, StudentProfile, TutoringRequest } from '@/types';

export function useStudentProfile() {
  return useQuery({ queryKey: ['student', 'profile'], queryFn: async () => (await api.get<StudentProfile>('/students/me/profile')).data });
}

export function useStudentRequests() {
  return useQuery({ queryKey: ['requests', 'student'], queryFn: async () => (await api.get<TutoringRequest[]>('/requests/student/me')).data });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: unknown) => (await api.post<TutoringRequest>('/requests', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests', 'student'] }),
  });
}

export function useCancelRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api.patch<TutoringRequest>(`/requests/${id}/cancel`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests', 'student'] }),
  });
}

export function useCreatePaymentOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: number) =>
      (await api.post<PaymentOrder>(`/requests/${requestId}/payment/order`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests', 'student'] }),
  });
}

export function useVerifyRequestPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, ...verification }: PaymentVerification & { requestId: number }) =>
      (await api.post(`/requests/${requestId}/payment/verify`, verification)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests', 'student'] }),
  });
}
