import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GlowButton } from '@/components/ui/shiny-button-1';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:cursor-not-allowed disabled:opacity-60';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-[#0077b6]',
  accent: 'bg-accent-600 text-white hover:bg-accent-700',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:border-[#0077b6] hover:bg-[#0077b6] hover:text-white',
  ghost: 'text-brand-700 hover:bg-[#0077b6] hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-[#0077b6]',
};

export const buttonClasses = (v: Variant = 'primary', extra?: string) => cn(base, variants[v], extra);

export function Button({ variant = 'primary', loading, className, children, disabled, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  if (variant === 'accent') {
    return <GlowButton className={className} disabled={disabled || loading} {...rest}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </GlowButton>;
  }
  return (
    <button className={buttonClasses(variant, className)} disabled={disabled || loading} {...rest}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

export function LinkButton({ href, variant = 'primary', className, children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={buttonClasses(variant, className)}>{children}</Link>;
}
