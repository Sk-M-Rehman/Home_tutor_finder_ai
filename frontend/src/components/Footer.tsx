import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row">
        <p>© {new Date().getFullYear()} Home Tutor Finder. All rights reserved.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-5">
          <Link href="/contact" className="hover:text-brand-700">Contact</Link>
          <Link href="/about" className="hover:text-brand-700">About</Link>
          <Link href="/privacy" className="hover:text-brand-700">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-700">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
