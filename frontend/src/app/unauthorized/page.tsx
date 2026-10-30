import { LinkButton } from '@/components/Button';

export default function Unauthorized() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold text-brand-800">Access denied</h1>
      <p className="mt-3 text-slate-600">Your account does not have permission to view this page.</p>
      <div className="mt-6 flex justify-center gap-3"><LinkButton href="/">Go Home</LinkButton><LinkButton href="/sign-in" variant="secondary">Sign In</LinkButton></div>
    </div>
  );
}
