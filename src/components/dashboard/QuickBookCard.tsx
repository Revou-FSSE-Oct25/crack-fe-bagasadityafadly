'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

export function QuickBookCard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleQuickBook() {
    setLoading(true);
    setError('');
    setSuccess(false);

    // Book for tomorrow at 9am
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    try {
      await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          type: 'GYM',
          bookingDate: tomorrow.toISOString(),
        }),
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
    <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏃 Quick Book
        </CardTitle>
        <CardDescription>
          Book a GYM visit for tomorrow at 9:00 AM with one tap.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          onClick={handleQuickBook}
          disabled={loading || success}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? 'Booking…' : success ? '✓ Booked for tomorrow!' : 'Book Tomorrow → Gym Visit'}
        </Button>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
