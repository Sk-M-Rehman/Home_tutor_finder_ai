import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function TutorLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute role="TUTOR"><div className="mx-auto max-w-6xl px-4 py-10">{children}</div></ProtectedRoute>;
}
