'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);

  function validate() {
    const errs = { email: '', password: '' };
    let valid = true;

    if (!form.email.trim()) {
      errs.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
      valid = false;
    }

    if (!form.password) {
      errs.password = 'Password is required';
      valid = false;
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setFieldErrors(errs);
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setHasAuthError(false);

    if (!validate()) return;

    setLoading(true);

    try {
      const data = await apiFetch<{
        user: { id: string; email: string; name: string; role: 'ADMIN' | 'MEMBER' | 'NON_MEMBER' };
        access_token: string;
      }>('/auth/login', { method: 'POST', body: JSON.stringify(form) });

      login(data.access_token, data.user);
      const isStaff = data.user.role === 'ADMIN' || data.user.role === 'ADMINISTRATOR';
      router.push(isStaff ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';

      if (msg.toLowerCase().includes('invalid credentials') || msg.toLowerCase().includes('unauthorized')) {
        setError('Wrong email or password. Please try again.');
        setHasAuthError(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function clearFieldError(field: 'email' | 'password') {
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setHasAuthError(false);
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm flex flex-col gap-5">

        <Link href="/" className="text-center text-2xl font-bold text-orange-500">
          🏋 Gymora
        </Link>

        {/* ── Login Card ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Login to your Gymora account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); clearFieldError('email'); }}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
                    fieldErrors.email || hasAuthError
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                  )}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="size-3 shrink-0" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); clearFieldError('password'); }}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition-colors',
                      fieldErrors.password || hasAuthError
                        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="size-3 shrink-0" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Server / auth error */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? 'Logging in…' : 'Login'}
              </Button>

              <p className="text-center text-sm text-zinc-500">
                No account?{' '}
                <Link href="/register" className="text-orange-500 font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* ── Divider ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-xs text-zinc-400 font-medium">or</span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>

        {/* ── No-login booking CTA ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl shrink-0">
              🏋
            </div>
            <div>
              <p className="font-semibold text-zinc-900 text-sm">Just want to visit the gym?</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                No account needed. Book a free gym visit in 2 minutes — pick a date, get your QR entry code, and walk in.
              </p>
            </div>
          </div>

          {/* Quick benefit pills */}
          <div className="flex flex-wrap gap-1.5">
            {['Free entry', 'QR code ticket', 'No membership', '2-min setup'].map((b) => (
              <span key={b} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-0.5 rounded-full">
                ✓ {b}
              </span>
            ))}
          </div>

          <Link href="/book?plan=NONE">
            <Button
              variant="outline"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold"
            >
              Book Now Without Login →
            </Button>
          </Link>

          <p className="text-xs text-center text-zinc-400">
            Want classes or PT?{' '}
            <Link href="/book?plan=TRIAL" className="text-orange-500 hover:underline">
              Start a free 14-day trial
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
