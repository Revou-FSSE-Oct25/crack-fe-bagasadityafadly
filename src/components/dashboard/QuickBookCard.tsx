'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

type BookingType = 'GYM' | 'CLASS' | 'PT';

const typeConfig: Record<BookingType, { label: string; icon: string; desc: string; feature: string }> = {
  GYM:   { label: 'Gym',   icon: '🏋', desc: 'Open floor session — no membership required', feature: 'gym visits' },
  CLASS: { label: 'Class', icon: '🧘', desc: 'Group fitness class — requires active membership', feature: 'group classes' },
  PT:    { label: 'PT',    icon: '👟', desc: 'Personal trainer session — requires active membership', feature: 'personal training sessions' },
};

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function QuickBookCard() {
  const user = useAuthStore((s) => s.user);
  const isNonMember = user?.role === 'NON_MEMBER';

  const [type, setType] = useState<BookingType>('GYM');
  const [date, setDate] = useState(getTomorrow());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

  function handleTypeClick(t: BookingType) {
    setError('');
    setSuccess(false);

    // NON_MEMBER may not book CLASS or PT — intercept with upgrade modal
    if (isNonMember && t !== 'GYM') {
      setUpgradeFeature(typeConfig[t].feature);
      return; // don't switch the tab
    }

    setType(t);
  }

  async function handleGymBook() {
    setLoading(true);
    setError('');
    setSuccess(false);

    const bookingDate = new Date(`${date}T09:00:00`).toISOString();

    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({ type: 'GYM', bookingDate }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Upgrade modal — shown when NON_MEMBER clicks CLASS or PT tab */}
      {upgradeFeature && (
        <UpgradeModal
          feature={upgradeFeature}
          onClose={() => setUpgradeFeature(null)}
        />
      )}

      <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🏃 Quick Book</CardTitle>
          <CardDescription>Choose a session type to get started.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">

          {/* Booking type selector */}
          <div className="flex gap-2">
            {(Object.keys(typeConfig) as BookingType[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTypeClick(t)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition-colors ${
                  type === t
                    ? 'bg-orange-500 text-white border-orange-500'
                    : isNonMember && t !== 'GYM'
                    ? 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-pointer hover:border-orange-200'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-orange-300'
                }`}
              >
                <span className="text-lg">{typeConfig[t].icon}</span>
                <span className="flex items-center gap-0.5">
                  {typeConfig[t].label}
                  {isNonMember && t !== 'GYM' && (
                    <span className="ml-0.5 text-[9px] bg-orange-100 text-orange-500 rounded px-0.5">
                      🔒
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-zinc-400 text-center -mt-2">
            {typeConfig[type].desc}
          </p>

          {/* GYM — inline date picker + book button */}
          {type === 'GYM' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">Visit Date</label>
                <input
                  type="date"
                  value={date}
                  min={getToday()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <Button
                onClick={handleGymBook}
                disabled={loading || success || !date}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading
                  ? 'Booking…'
                  : success
                  ? '✓ Gym visit booked!'
                  : `Book Gym — ${date}`}
              </Button>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  {error}
                </p>
              )}
            </>
          )}

          {/* CLASS — only reachable for MEMBER/ADMIN */}
          {type === 'CLASS' && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex flex-col gap-2">
              <p className="text-sm font-medium text-blue-800">Browse Class Schedules</p>
              <p className="text-xs text-blue-600">
                Choose from our upcoming sessions — yoga, HIIT, strength training and more.
              </p>
              <Link href="/classes">
                <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-1">
                  Browse & Book a Class →
                </Button>
              </Link>
            </div>
          )}

          {/* PT — only reachable for MEMBER/ADMIN */}
          {type === 'PT' && (
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 flex flex-col gap-2">
              <p className="text-sm font-medium text-purple-800">Book a PT Session</p>
              <p className="text-xs text-purple-600">
                Work one-on-one with one of our certified personal trainers.
              </p>
              <Link href="/classes?type=PT">
                <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-1">
                  View PT Sessions →
                </Button>
              </Link>
            </div>
          )}

        </CardContent>
      </Card>
    </>
  );
}
