'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────
type PlanType = 'NONE' | 'TRIAL' | 'BASIC' | 'PREMIUM';
type AuthMode = 'register' | 'login';

interface PlanInfo {
  name: string;
  price: string;
  color: string;
  badgeColor: string;
  features: string[];
}

const PLANS: Record<PlanType, PlanInfo> = {
  NONE:    { name: 'Non-Member',         price: 'Rp 50.000/visit',  color: 'border-zinc-200 bg-zinc-50',     badgeColor: 'bg-zinc-100 text-zinc-600',    features: ['Gym floor access', 'Basic equipment', 'Pay per visit'] },
  TRIAL:   { name: 'Trial (14 days)',    price: 'Rp 50.000/visit',  color: 'border-orange-200 bg-orange-50', badgeColor: 'bg-orange-100 text-orange-700', features: ['Group classes', '2 PT sessions', 'XP & achievements', 'Gym visit: Rp 50k/visit'] },
  BASIC:   { name: 'Basic Membership',   price: 'Rp 250.000/mo',   color: 'border-orange-400 bg-orange-50', badgeColor: 'bg-orange-500 text-white',      features: ['Unlimited gym access', 'All classes', '4 PT/month', 'Streak rewards'] },
  PREMIUM: { name: 'Premium Membership', price: 'Rp 500.000/mo',   color: 'border-purple-300 bg-purple-50', badgeColor: 'bg-purple-600 text-white',      features: ['Everything in Basic', 'Unlimited PT', 'Nutrition consult', 'VIP locker'] },
};

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// ── Main Component (wrapped by Suspense below) ────────────────────
function BookFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  const initialPlan = (searchParams.get('plan') ?? 'NONE') as PlanType;

  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<PlanType>(initialPlan);
  const [authMode, setAuthMode] = useState<AuthMode>('register');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [visitDate, setVisitDate] = useState('');
  const [visitHour, setVisitHour] = useState(9);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [result, setResult] = useState<{
    bookingId: string;
    qrData: string;
    userName: string;
    planName: string;
    visitDate: string;
    visitTime: string;
    isAnonymous: boolean;
    userEmail: string | null;
  } | null>(null);

  // Derived
  const isNoneMember = plan === 'NONE';
  const needsEmail = !isNoneMember; // paid plans always require an account
  const showPasswordField = needsEmail || email.trim().length > 0; // NONE plan: only show if email typed

  useEffect(() => { setPlan(initialPlan); }, [initialPlan]);

  const planInfo = PLANS[plan];
  const qrUrl = result
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(result.qrData)}&margin=10&color=000000&bgcolor=ffffff`
    : '';

  // ── Validation ──────────────────────────────────────────────────
  function validateStep2(): boolean {
    const e: Record<string, string> = {};

    if (isNoneMember) {
      // Anonymous / optional-email flow
      if (!name.trim() || name.trim().length < 2) e.name = 'Full name is required (min 2 chars)';
      if (email.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          e.email = 'Enter a valid email address';
        } else if (!password) {
          e.password = 'Password is required when an email is provided';
        } else if (password.length < 8) {
          e.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          e.password = 'Need uppercase, lowercase & number';
        }
      }
    } else if (authMode === 'register') {
      if (!name.trim() || name.trim().length < 2) e.name = 'Full name is required (min 2 chars)';
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
      if (!password || password.length < 8) e.password = 'Password min 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) e.password = 'Need uppercase, lowercase & number';
    } else {
      // login mode
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
      if (!password) e.password = 'Password is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep3(): boolean {
    const e: Record<string, string> = {};
    if (!visitDate) e.date = 'Please select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    setErrors({});
    try {
      const body: Record<string, unknown> = {
        planType: plan,
        visitDate,
        visitHour,
      };

      // name — required for register; optional for login (backend uses existing name)
      if (name.trim()) body.name = name.trim();

      // email / password
      if (email.trim()) {
        body.email = email.trim();
        body.password = password;
      }

      if (phone.trim()) body.phone = phone.trim();

      const data = await apiFetch<{
        isNewUser: boolean;
        isAnonymous: boolean;
        access_token: string | null;
        user: { id: string; name: string; email: string | null; role: 'ADMIN' | 'MEMBER' | 'NON_MEMBER' };
        booking: { id: string; bookingDate: string };
        qrData: string;
      }>('/bookings/guest', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // Only store auth token when the user has a real account
      if (data.access_token && data.user.email) {
        loginStore(data.access_token, {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
      }

      const dateObj = new Date(data.booking.bookingDate);
      setResult({
        bookingId: data.booking.id,
        qrData: data.qrData,
        userName: data.user.name,
        planName: planInfo.name,
        visitDate: dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        visitTime: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        isAnonymous: data.isAnonymous,
        userEmail: data.user.email,
      });
      setStep(5);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Booking failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  // ── Step progress bar ────────────────────────────────────────────
  const steps = ['Plan', 'Details', 'Schedule', 'Payment', 'Done'];

  // ── Shared field styles ──────────────────────────────────────────
  const fieldCls = (errKey: string) => cn(
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
    errors[errKey]
      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100',
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-orange-500">🏋 Gymora</Link>
        <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-700">Already a member? Login</Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6">
        {/* Progress steps */}
        {step < 5 && (
          <div className="flex items-center gap-1 w-full max-w-xl">
            {steps.slice(0, 4).map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                  i + 1 < step ? 'bg-orange-500 text-white' :
                  i + 1 === step ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                  'bg-zinc-200 text-zinc-400',
                )}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={cn('text-xs font-medium hidden sm:block', i + 1 <= step ? 'text-orange-600' : 'text-zinc-400')}>{s}</span>
                {i < 3 && <div className={cn('flex-1 h-0.5', i + 1 < step ? 'bg-orange-400' : 'bg-zinc-200')} />}
              </div>
            ))}
          </div>
        )}

        <div className="w-full max-w-xl">

          {/* ── STEP 1: Choose Plan ─────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border p-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Choose your plan</h2>
                <p className="text-sm text-zinc-500 mt-1">You can always upgrade later.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(PLANS) as [PlanType, PlanInfo][]).map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setPlan(type)}
                    className={cn(
                      'flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all',
                      plan === type ? info.color + ' shadow-sm' : 'border-zinc-100 bg-white hover:border-zinc-200',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-zinc-900">{info.name}</span>
                      {plan === type && <span className="text-orange-500 text-lg">✓</span>}
                    </div>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full self-start', info.badgeColor)}>
                      {info.price}
                    </span>
                    <ul className="mt-1 flex flex-col gap-1">
                      {info.features.map(f => (
                        <li key={f} className="text-xs text-zinc-500 flex items-center gap-1">
                          <span className="text-green-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <Button onClick={() => setStep(2)} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                Continue with {planInfo.name} <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── STEP 2: Details ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-zinc-600 text-sm">← Back</button>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    {isNoneMember ? 'Your details' : 'Create account or log in'}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {isNoneMember
                      ? 'Just your name is enough — email is optional.'
                      : 'You need an account to activate your membership.'}
                  </p>
                </div>
              </div>

              {/* Selected plan reminder */}
              <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border', planInfo.color)}>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', planInfo.badgeColor)}>{planInfo.name}</span>
                <span className="text-sm text-zinc-600">{planInfo.price}</span>
              </div>

              {/* ─── NONE PLAN: simple optional-email form ─────────── */}
              {isNoneMember && (
                <div className="flex flex-col gap-3">
                  {/* Name (required) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700">Full Name *</label>
                    <input
                      value={name}
                      onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                      className={fieldCls('name')}
                      placeholder="Bagas Aditya"
                    />
                    {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.name}</p>}
                  </div>

                  {/* Email (optional) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700">
                      Email <span className="text-zinc-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '', password: '' })); }}
                      className={fieldCls('email')}
                      placeholder="you@example.com"
                    />
                    <p className="text-xs text-zinc-400">
                      Add your email to receive a booking confirmation and access your dashboard later.
                    </p>
                    {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.email}</p>}
                  </div>

                  {/* Password — only shown when email is filled */}
                  {showPasswordField && (
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-zinc-700">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                          className={cn(fieldCls('password'), 'pr-10')}
                          placeholder="Min 8 chars, 1 uppercase, 1 number"
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" tabIndex={-1}>
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.password}</p>}
                    </div>
                  )}

                  {/* Phone (optional) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700">
                      Phone <span className="text-zinc-400 font-normal">(optional)</span>
                    </label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="08xx-xxxx-xxxx"
                    />
                  </div>
                </div>
              )}

              {/* ─── PAID PLANS: Register / Login tabs ─────────────── */}
              {!isNoneMember && (
                <div className="flex flex-col gap-4">
                  {/* Tab switcher */}
                  <div className="flex rounded-xl border border-zinc-200 p-1 gap-1">
                    <button
                      onClick={() => { setAuthMode('register'); setErrors({}); }}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                        authMode === 'register'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700',
                      )}
                    >
                      I&apos;m new — Register
                    </button>
                    <button
                      onClick={() => { setAuthMode('login'); setErrors({}); }}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                        authMode === 'login'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700',
                      )}
                    >
                      I have an account — Login
                    </button>
                  </div>

                  {/* Register fields */}
                  {authMode === 'register' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">Full Name *</label>
                        <input value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                          className={fieldCls('name')} placeholder="Bagas Aditya" />
                        {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.name}</p>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">Email *</label>
                        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                          className={fieldCls('email')} placeholder="you@example.com" />
                        {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.email}</p>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">Password *</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={password}
                            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                            className={cn(fieldCls('password'), 'pr-10')}
                            placeholder="Min 8 chars, 1 uppercase, 1 number" />
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" tabIndex={-1}>
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.password}</p>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">Phone <span className="text-zinc-400 font-normal">(optional)</span></label>
                        <input value={phone} onChange={e => setPhone(e.target.value)}
                          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          placeholder="08xx-xxxx-xxxx" />
                      </div>
                    </div>
                  )}

                  {/* Login fields */}
                  {authMode === 'login' && (
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                        Log in with your existing Gymora account. Your membership will be activated after booking.
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">Email</label>
                        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                          className={fieldCls('email')} placeholder="you@example.com" />
                        {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.email}</p>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-zinc-700">Password</label>
                          <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={password}
                            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                            className={cn(fieldCls('password'), 'pr-10')} placeholder="••••••••" />
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" tabIndex={-1}>
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.password}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => { if (validateStep2()) setStep(3); }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Next: Choose Schedule <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── STEP 3: Date & Time ─────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep(2)} className="text-zinc-400 hover:text-zinc-600 text-sm">← Back</button>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Pick your visit</h2>
                  <p className="text-sm text-zinc-500">Choose when you want to come in</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-700">Visit Date *</label>
                  <input type="date" value={visitDate} min={getMinDate()}
                    onChange={e => { setVisitDate(e.target.value); setErrors(p => ({ ...p, date: '' })); }}
                    className={cn('rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
                      errors.date ? 'border-red-400 bg-red-50' : 'border-zinc-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100')} />
                  {errors.date && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.date}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-700">Arrival Time</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {TIME_SLOTS.map(slot => {
                      const h = parseInt(slot);
                      return (
                        <button key={slot} onClick={() => setVisitHour(h)}
                          className={cn('py-2 rounded-lg text-xs font-semibold border transition-colors',
                            visitHour === h ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-zinc-600 border-zinc-200 hover:border-orange-300')}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button onClick={() => { if (validateStep3()) setStep(4); }} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                Next: Review & Pay <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          )}

          {/* ── STEP 4: Payment ─────────────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-4">

              {/* ── Membership upsell — NONE plan only ───────────────── */}
              {plan === 'NONE' && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg shrink-0">💡</div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm">Unlock more for the same visit</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        You&apos;re booking a free gym visit — great choice! Here&apos;s what members get on top of that:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: '🧘', label: '15+ group classes/week' },
                      { icon: '👟', label: 'Personal trainer sessions' },
                      { icon: '🏆', label: 'XP, badges & leaderboard' },
                      { icon: '🔥', label: 'Streak rewards & perks' },
                    ].map((f) => (
                      <div key={f.label} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-orange-100">
                        <span className="text-base">{f.icon}</span>
                        <span className="text-xs text-zinc-700 font-medium">{f.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button onClick={() => { setPlan('TRIAL'); setStep(1); }}
                      className="flex flex-col gap-1.5 p-3 rounded-xl border-2 border-orange-200 bg-white hover:border-orange-400 hover:shadow-sm text-left transition-all">
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full self-start">Trial</span>
                      <p className="text-xs font-semibold text-zinc-800">14 days</p>
                      <p className="text-[11px] text-zinc-500">Classes, 2 PT + Rp 50k/visit</p>
                    </button>
                    <button onClick={() => { setPlan('BASIC'); setStep(1); }}
                      className="flex flex-col gap-1.5 p-3 rounded-xl border-2 border-orange-400 bg-orange-500 hover:bg-orange-600 text-left transition-all">
                      <span className="text-xs font-bold text-orange-500 bg-white px-2 py-0.5 rounded-full self-start">Most Popular</span>
                      <p className="text-xs font-semibold text-white">Rp 250.000/mo</p>
                      <p className="text-[11px] text-orange-100">Unlimited + 4 PT/month</p>
                    </button>
                    <button onClick={() => { setPlan('PREMIUM'); setStep(1); }}
                      className="flex flex-col gap-1.5 p-3 rounded-xl border-2 border-purple-300 bg-white hover:border-purple-500 hover:shadow-sm text-left transition-all">
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full self-start">Premium</span>
                      <p className="text-xs font-semibold text-zinc-800">Rp 500.000/mo</p>
                      <p className="text-[11px] text-zinc-500">Unlimited PT + nutrition</p>
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 text-center">
                    Click any plan above to switch. You can always upgrade after your visit.
                  </p>
                </div>
              )}

              {/* ── Order summary + payment ───────────────────────────── */}
              <div className="bg-white rounded-2xl border p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(3)} className="text-zinc-400 hover:text-zinc-600 text-sm">← Back</button>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">Review & Pay</h2>
                    <p className="text-sm text-zinc-500">Confirm your booking details</p>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-xl border p-4 flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Name</span>
                    <span className="font-medium">{name || '—'}</span>
                  </div>
                  {email && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Email</span>
                      <span className="font-medium">{email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Plan</span>
                    <span className={cn('font-bold px-2 py-0.5 rounded-full text-xs', planInfo.badgeColor)}>{planInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Visit Date</span>
                    <span className="font-medium">
                      {visitDate ? new Date(visitDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Arrival</span>
                    <span className="font-medium">{String(visitHour).padStart(2, '0')}:00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">{planInfo.price}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Payment Method</p>
                  <div className="flex gap-2 flex-wrap">
                    {['Transfer Bank', 'QRIS', 'GoPay', 'OVO'].map(method => (
                      <span key={method} className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 bg-zinc-50">
                        {method}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 italic">
                    Demo mode — payment is simulated. Click the button below to complete.
                  </p>
                </div>

                {errors.submit && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{errors.submit}</span>
                  </div>
                )}

                <Button onClick={handleSubmit} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3">
                  {loading ? 'Processing…' : '✓ Complete Payment & Get QR Code'}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Success + QR Code ───────────────────────────── */}
          {step === 5 && result && (
            <div className="bg-white rounded-2xl border p-6 flex flex-col items-center gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="size-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Booking Confirmed!</h2>
                <p className="text-sm text-zinc-500">
                  Welcome to Gymora, <strong>{result.userName}</strong>!
                </p>
              </div>

              {/* Visit summary */}
              <div className="w-full bg-zinc-50 rounded-xl border p-4 text-sm text-left flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Plan</span>
                  <span className="font-semibold text-orange-600">{result.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Visit</span>
                  <span className="font-medium">{result.visitDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Time</span>
                  <span className="font-medium">{result.visitTime}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-semibold text-zinc-700">Your Entry QR Code</p>
                <div className="p-4 bg-white rounded-2xl border-2 border-orange-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="Entry QR Code" width={220} height={220} className="rounded-lg" />
                </div>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Show this QR code at the entrance. The staff will scan it to check you in.
                </p>
                {result.isAnonymous && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 max-w-xs text-left flex flex-col gap-1">
                    <p className="font-semibold">📸 Save or screenshot this QR code</p>
                    <p>You booked without an account, so this is the only way to retrieve your entry code.</p>
                  </div>
                )}
                <p className="text-xs font-mono text-zinc-400 bg-zinc-100 px-3 py-1 rounded-lg break-all">{result.qrData}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 w-full">
                {result.isAnonymous ? (
                  <>
                    <Button
                      onClick={() => router.push('/book?plan=NONE')}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Book Another Visit
                    </Button>
                    <Link href="/register">
                      <Button variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50">
                        Create an Account for Full Access
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Go to My Dashboard →
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.print()}>
                      Print / Save QR Code
                    </Button>
                  </>
                )}
              </div>

              {/* Account hint */}
              {!result.isAnonymous && result.userEmail && (
                <p className="text-xs text-zinc-400">
                  Your account has been created. Use <strong>{result.userEmail}</strong> to log in next time.
                </p>
              )}
              {result.isAnonymous && (
                <p className="text-xs text-zinc-400">
                  Want to track your visits and earn XP?{' '}
                  <Link href="/register" className="text-orange-500 hover:underline">Create a free account →</Link>
                </p>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
      </div>
    }>
      <BookFlow />
    </Suspense>
  );
}
