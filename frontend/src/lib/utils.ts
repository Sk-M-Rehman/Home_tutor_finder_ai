import type { Role, TeachingMode } from '@/types';

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
export const MODE_LABEL: Record<TeachingMode, string> = { HOME: 'Home Tuition', ONLINE: 'Online', BOTH: 'Home & Online' };
export const dashboardPath = (r: Role) => (r === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard');
export const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
export const dayLabel = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();
export const fmtTime = (t: string) => t.slice(0, 5);
export const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
