'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { useToast } from '@/store/toast';
import type { Tutor } from '@/types';
import { Button } from './Button';
import { RequestDialog } from './RequestDialog';

export function SendRequestButton({ tutor, variant = 'accent' }: { tutor: Tutor; variant?: 'accent' | 'primary' }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [open, setOpen] = useState(false);

  const click = () => {
    if (!user) return router.push('/sign-in');
    if (user.role !== 'STUDENT') return toast('error', 'Only student accounts can send tutoring requests.');
    setOpen(true);
  };

  return (
    <>
      <Button variant={variant} onClick={click}>Send Request</Button>
      {open && <RequestDialog tutor={tutor} onClose={() => setOpen(false)} />}
    </>
  );
}
