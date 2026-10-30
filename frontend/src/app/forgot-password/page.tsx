import { LinkButton } from '@/components/Button';

export default function ForgotPassword() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-extrabold text-brand-800">Forgot password</h1>
        <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Password reset by email is <strong>not configured</strong> in this installation, so no reset email can be sent.
          Please contact the site administrator, or sign in and use “Change password” from your profile page if you remember your current password.
        </p>
        <LinkButton href="/sign-in" variant="secondary" className="mt-5">Back to Sign In</LinkButton>
      </div>
    </div>
  );
}
