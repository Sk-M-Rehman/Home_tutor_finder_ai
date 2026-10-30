import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // the JWT lives in an HttpOnly cookie set by the backend
});

export function errorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) return 'Cannot reach the server. Is the backend running?';
    const d = e.response.data as { message?: string; fieldErrors?: Record<string, string> } | undefined;
    if (d?.fieldErrors && Object.keys(d.fieldErrors).length) return Object.values(d.fieldErrors).join(' · ');
    return d?.message ?? 'Request failed';
  }
  return 'Something went wrong';
}
