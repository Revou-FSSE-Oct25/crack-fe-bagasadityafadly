'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new link.');
  }, [token]);

  function validate() {
    const errs = { password: '', confirm: '' };
    let valid = true;

    if (!form.password) {
      errs.password = 'New password is required';
      valid = false;
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errs.password = 'Must include uppercase, lowercase, and a number';
      valid = false;
    }

    if (!form.confirm) {
      errs.confirm = 'Please confirm your password';
      valid = false;
    } else if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match';
      valid = false;
    }

    setFieldErrors(errs);
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password: form.password }),
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle className="size-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Password updated!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Your password has been changed. Redirecting to login…
            </p>
          </div>
        </div>
        <Link href="/login">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* No token error */}
      {!token && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>Invalid reset link. <Link href="/forgot-password" className="font-medium underline">Request a new one</Link>.</span>
        </div>
      )}

      {/* New password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors((p) => ({ ...p, password: '' })); }}
            disabled={!token}
            className={cn(
              'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition-colors',
              fieldErrors.password
                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100',
              !token && 'opacity-50 cursor-not-allowed'
            )}
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" tabIndex={-1}>
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="size-3 shrink-0" /> {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setFieldErrors((p) => ({ ...p, confirm: '' })); }}
            disabled={!token}
            className={cn(
              'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition-colors',
              fieldErrors.confirm
                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100',
              !token && 'opacity-50 cursor-not-allowed'
            )}
            placeholder="Re-enter your new password"
          />
          <button type="button" onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" tabIndex={-1}>
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {fieldErrors.confirm && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="size-3 shrink-0" /> {fieldErrors.confirm}
          </p>
        )}
      </div>

      {/* Server error */}
      {error && !error.includes('missing reset') && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            {error}{' '}
            <Link href="/forgot-password" className="font-medium underline">Request a new link</Link>.
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !token}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
      >
        {loading ? 'Updating…' : 'Update Password'}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/login" className="text-orange-500 font-medium hover:underline">
          ← Back to login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Link href="/" className="text-center text-2xl font-bold text-orange-500">
          🏋 Gymora
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-40 bg-zinc-100 rounded-xl animate-pulse" />}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
