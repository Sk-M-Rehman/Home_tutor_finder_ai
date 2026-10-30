'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth, useLogout } from '@/features/auth/useAuth';
import { dashboardPath } from '@/lib/utils';
import { Button, LinkButton } from './Button';

const links = [
  { href: '/', label: 'Home' },
  { href: '/find-tutors', label: 'Find Tutors' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/sign-up?role=TUTOR', label: 'Become a Tutor' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const logout = useLogout();
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6" aria-label="Main">
        <Link href="/" className="group flex items-center gap-2 text-lg font-extrabold tracking-tight text-brand-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-sm text-white shadow-lg shadow-brand-700/20 transition group-hover:rotate-3">HT</span>
          <span>Home<span className="text-accent-600">Tutor</span>Finder</span>
        </Link>
        <button className="rounded-lg p-2 md:hidden" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <span className="block h-0.5 w-6 bg-slate-800" /><span className="mt-1.5 block h-0.5 w-6 bg-slate-800" /><span className="mt-1.5 block h-0.5 w-6 bg-slate-800" />
        </button>
        <div className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-slate-200 bg-white p-4 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:p-0`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={close} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-800">{l.label}</Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 md:ml-2 md:mt-0 md:flex-row md:items-center">
            {user ? (
              <>
                <span className="px-2 text-sm text-slate-600">Hi, <strong>{user.fullName.split(' ')[0]}</strong></span>
                <LinkButton href={dashboardPath(user.role)} variant="secondary">Dashboard</LinkButton>
                <Button variant="ghost" onClick={() => { close(); logout.mutate(); }} loading={logout.isPending}>Logout</Button>
              </>
            ) : (
              <>
                <LinkButton href="/sign-in" variant="ghost">Sign In</LinkButton>
                <LinkButton href="/sign-up">Sign Up</LinkButton>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
