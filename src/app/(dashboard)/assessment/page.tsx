'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
type GoalType      = 'MUSCLE_GAIN' | 'FAT_LOSS' | 'MAINTAIN' | 'ENDURANCE' | 'FLEXIBILITY';
type WorkoutLevel  = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type PreferredTime = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FLEXIBLE';

interface AssessmentForm {
  weightKg:      string;
  heightCm:      string;
  bodyFatPct:    string;
  goal:          GoalType | '';
  workoutLevel:  WorkoutLevel | '';
  preferredTime: PreferredTime | '';
}

// ── Option config ─────────────────────────────────────────────────────────────
const GOALS: { value: GoalType; label: string; emoji: string; desc: string }[] = [
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain',  emoji: '💪', desc: 'Build strength & size' },
  { value: 'FAT_LOSS',    label: 'Fat Loss',     emoji: '🔥', desc: 'Lose weight & tone up' },
  { value: 'MAINTAIN',    label: 'Maintain',     emoji: '⚖️', desc: 'Keep current fitness level' },
  { value: 'ENDURANCE',   label: 'Endurance',    emoji: '🏃', desc: 'Improve stamina & cardio' },
  { value: 'FLEXIBILITY', label: 'Flexibility',  emoji: '🧘', desc: 'Mobility & stretch focus' },
];

const LEVELS: { value: WorkoutLevel; label: string; emoji: string; desc: string }[] = [
  { value: 'BEGINNER',     label: 'Beginner',     emoji: '🌱', desc: 'New to working out' },
  { value: 'INTERMEDIATE', label: 'Intermediate', emoji: '🏋️', desc: 'Working out 1–3 years' },
  { value: 'ADVANCED',     label: 'Advanced',     emoji: '🚀', desc: 'Serious athlete / 3+ years' },
];

const TIMES: { value: PreferredTime; label: string; emoji: string }[] = [
  { value: 'MORNING',   label: 'Morning',   emoji: '🌅' },
  { value: 'AFTERNOON', label: 'Afternoon', emoji: '☀️' },
  { value: 'EVENING',   label: 'Evening',   emoji: '🌙' },
  { value: 'FLEXIBLE',  label: 'Flexible',  emoji: '🔄' },
];

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = ['Body Stats', 'Your Goal', 'Workout Level', 'Preferred Time'];

export default function AssessmentPage() {
  const router = useRouter();

  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState<AssessmentForm>({
    weightKg: '', heightCm: '', bodyFatPct: '',
    goal: '', workoutLevel: '', preferredTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function set<K extends keyof AssessmentForm>(key: K, val: AssessmentForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError('');
  }

  function canNext(): boolean {
    if (step === 0) {
      const w = parseFloat(form.weightKg);
      const h = parseFloat(form.heightCm);
      return !isNaN(w) && w >= 30 && w <= 300 && !isNaN(h) && h >= 100 && h <= 250;
    }
    if (step === 1) return form.goal !== '';
    if (step === 2) return form.workoutLevel !== '';
    if (step === 3) return form.preferredTime !== '';
    return false;
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {};
      if (form.weightKg)   payload.weightKg      = parseFloat(form.weightKg);
      if (form.heightCm)   payload.heightCm      = parseFloat(form.heightCm);
      if (form.bodyFatPct) payload.bodyFatPct    = parseFloat(form.bodyFatPct);
      if (form.goal)          payload.goal          = form.goal;
      if (form.workoutLevel)  payload.workoutLevel  = form.workoutLevel;
      if (form.preferredTime) payload.preferredTime = form.preferredTime;

      await apiFetch('/recommendations/assessment', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <CheckCircle className="size-16 text-green-500" />
            <h2 className="text-xl font-bold text-zinc-900">Assessment Complete!</h2>
            <p className="text-sm text-zinc-500">
              Your Smart Recommendations are ready. Head back to the dashboard to see your personalised classes.
            </p>
            <Button
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => router.push('/dashboard')}
            >
              View Recommendations →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">🧠 Smart Assessment</h1>
            <p className="text-sm text-zinc-500">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-200 rounded-full h-1.5">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step labels */}
        <div className="flex justify-between text-xs text-zinc-400 px-1">
          {STEPS.map((label, i) => (
            <span key={label} className={cn(i === step && 'text-orange-500 font-semibold')}>
              {label}
            </span>
          ))}
        </div>

        {/* ── Step 0: Body Stats ────────────────────────────────────────── */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📏 Body Stats</CardTitle>
              <CardDescription>We use this to calibrate class intensity for your body.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Weight */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Weight (kg) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min={30} max={300}
                  placeholder="e.g. 70"
                  value={form.weightKg}
                  onChange={(e) => set('weightKg', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              {/* Height */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Height (cm) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min={100} max={250}
                  placeholder="e.g. 170"
                  value={form.heightCm}
                  onChange={(e) => set('heightCm', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              {/* Body fat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">
                  Body Fat % <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  min={1} max={70}
                  placeholder="e.g. 18"
                  value={form.bodyFatPct}
                  onChange={(e) => set('bodyFatPct', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <p className="text-xs text-zinc-400">Leave blank if you don't know — that's totally fine.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 1: Goal ──────────────────────────────────────────────── */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>🎯 What's Your Goal?</CardTitle>
              <CardDescription>We'll prioritise classes that match your target.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              {GOALS.map(({ value, label, emoji, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('goal', value)}
                  className={cn(
                    'flex items-center gap-4 w-full rounded-xl border px-4 py-3 text-left transition-all',
                    form.goal === value
                      ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
                  )}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{label}</p>
                    <p className="text-xs text-zinc-400">{desc}</p>
                  </div>
                  {form.goal === value && (
                    <CheckCircle className="ml-auto size-5 text-orange-500 shrink-0" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Workout Level ─────────────────────────────────────── */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>🏋️ Fitness Level</CardTitle>
              <CardDescription>Be honest — this helps us match the right class difficulty.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              {LEVELS.map(({ value, label, emoji, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('workoutLevel', value)}
                  className={cn(
                    'flex items-center gap-4 w-full rounded-xl border px-4 py-3 text-left transition-all',
                    form.workoutLevel === value
                      ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
                  )}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{label}</p>
                    <p className="text-xs text-zinc-400">{desc}</p>
                  </div>
                  {form.workoutLevel === value && (
                    <CheckCircle className="ml-auto size-5 text-orange-500 shrink-0" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── Step 3: Preferred Time ────────────────────────────────────── */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>🕐 Preferred Workout Time</CardTitle>
              <CardDescription>When do you usually like to train?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {TIMES.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('preferredTime', value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-center transition-all',
                    form.preferredTime === value
                      ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
                  )}
                >
                  <span className="text-3xl">{emoji}</span>
                  <p className="font-semibold text-sm text-zinc-900">{label}</p>
                  {form.preferredTime === value && (
                    <CheckCircle className="size-4 text-orange-500" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg border border-red-200">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step < STEPS.length - 1 ? (
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
            >
              Next <ArrowRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!canNext() || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Saving…' : 'Complete Assessment ✓'}
            </Button>
          )}
        </div>

        {/* Skip link */}
        <p className="text-center text-xs text-zinc-400">
          Don&apos;t want to fill this in?{' '}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-orange-400 hover:underline"
          >
            Skip for now
          </button>
        </p>

      </div>
    </div>
  );
}
