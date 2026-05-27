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

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = { name: '', email: '', password: '' };
    let valid = true;

    if (!form.name.trim()) {
      errs.name = 'Full name is required';
      valid = false;
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
      valid = false;
    }

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
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errs.password = 'Must include uppercase, lowercase, and a number';
      valid = false;
    }

    setFieldErrors(errs);
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setEmailTaken(false);

    if (!validate()) return;

    setLoading(true);

    try {
      const data = await apiFetch<{
        user: { id: string; email: string; name: string; role: 'ADMIN' | 'MEMBER' | 'NON_MEMBER' };
        access_token: string;
      }>('/auth/register', { method: 'POST', body: JSON.stringify(form) });

      login(data.access_token, data.user);
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';

      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('conflict')) {
        setEmailTaken(true);
        setFieldErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function clearField(field: keyof typeof fieldErrors) {
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    if (field === 'email') setEmailTaken(false);
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Link href="/" className="text-center text-2xl font-bold text-orange-500">
          🏋 Gymora
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start your fitness journey today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); clearField('name'); }}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
                    fieldErrors.name
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                  )}
                  placeholder="Bagas Aditya"
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="size-3 shrink-0" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); clearField('email'); }}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
                    fieldErrors.email
                      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                  )}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="size-3 shrink-0" /> {fieldErrors.email}
                  </p>
                )}
                {/* Extra hint when email is taken */}
                {emailTaken && (
                  <p className="text-xs text-zinc-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-orange-500 font-medium hover:underline">
                      Log in instead
                    </Link>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); clearField('password'); }}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition-colors',
                      fieldErrors.password
                        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    )}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
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
                    <AlertCircle className="size-3 shrink-0" /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Generic server error */}
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
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-zinc-500">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-500 font-medium hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
