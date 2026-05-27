'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');  // demo only
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    if (!email.trim()) { setEmailError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email address'); return false; }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await apiFetch<{ message: string; resetToken?: string }>(
        '/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email }) }
      );
      setResetToken(data.resetToken ?? '');
      setSubmitted(true);
    } catch {
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  const resetLink = resetToken
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002'}/reset-password?token=${resetToken}`
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Link href="/" className="text-center text-2xl font-bold text-orange-500">
          🏋 Gymora
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
                      emailError
                        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    )}
                    placeholder="you@example.com"
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="size-3 shrink-0" /> {emailError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </Button>

                <p className="text-center text-sm text-zinc-500">
                  Remember it?{' '}
                  <Link href="/login" className="text-orange-500 font-medium hover:underline">
                    Back to login
                  </Link>
                </p>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Success message */}
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle className="size-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Reset link generated</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      If <span className="font-medium">{email}</span> is registered, a reset link has been created.
                    </p>
                  </div>
                </div>

                {/* Demo mode — show reset link on screen */}
                {resetLink && (
                  <div className="flex flex-col gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Mail className="size-4 shrink-0" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Demo Mode</p>
                    </div>
                    <p className="text-xs text-amber-600">
                      In production this link would be emailed to you. For demo purposes, use it directly:
                    </p>
                    <Link
                      href={`/reset-password?token=${resetToken}`}
                      className="text-xs text-orange-600 font-medium break-all hover:underline"
                    >
                      {resetLink}
                    </Link>
                    <Link href={`/reset-password?token=${resetToken}`}>
                      <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-1">
                        Reset Password Now →
                      </Button>
                    </Link>
                  </div>
                )}

                <Link href="/login" className="text-center text-sm text-orange-500 font-medium hover:underline">
                  ← Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
