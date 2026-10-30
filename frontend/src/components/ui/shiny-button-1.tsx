import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

const shell = 'group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-2xl p-[2px] text-sm font-extrabold shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-300 disabled:cursor-not-allowed disabled:opacity-60';

function GlowSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`relative inline-flex min-h-[44px] w-full items-center justify-center rounded-[0.9rem] bg-[#0b1f3a] px-5 text-white transition-colors duration-200 group-hover:bg-[#0077b6] ${className}`}><span className="relative z-10">{children}</span></span>;
}

export function GlowButton({ children, className = '', ...props }: GlowButtonProps) {
  return <button className={`${shell} ${className}`} {...props}>
    <span aria-hidden className="absolute inset-[-160%] animate-[speen_3s_linear_infinite] bg-[conic-gradient(from_90deg,#fc9,#0000_25%_75%,#9cf)]" />
    <GlowSurface>{children}</GlowSurface>
    <style jsx>{`@keyframes speen { to { transform: rotate(360deg); } }`}</style>
  </button>;
}

export function GlowLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <Link href={href} className={`${shell} ${className}`}>
    <span aria-hidden className="absolute inset-[-160%] animate-[speen_3s_linear_infinite] bg-[conic-gradient(from_90deg,#fc9,#0000_25%_75%,#9cf)]" />
    <GlowSurface>{children}</GlowSurface>
    <style jsx>{`@keyframes speen { to { transform: rotate(360deg); } }`}</style>
  </Link>;
}
