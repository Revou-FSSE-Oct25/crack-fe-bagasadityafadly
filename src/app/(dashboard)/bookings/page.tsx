'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import type { Booking } from '@/types';

const statusColor: Record<string, string> = {
  CONFIRMED:  'bg-green-100 text-green-700',
  PENDING:    'bg-yellow-100 text-yellow-700',
  CANCELLED:  'bg-zinc-100 text-zinc-500',
  COMPLETED:  'bg-blue-100 text-blue-700',
  NO_SHOW:    'bg-red-100 text-red-700',
};

const typeIcon: Record<string, string> = {
  GYM: '🏋',
  CLASS: '🧘',
  PT: '👟',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function fetchBookings() {
    try {
      const data = await apiFetch<Booking[]>('/bookings/my');
      setBookings(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, []);

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH' });
      await fetchBookings();
    } catch {
      // ignore
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">
                No bookings yet. Use Quick Book on the dashboard to get started.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-white gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{typeIcon[b.type] ?? '📅'}</span>
                      <div>
                        <p className="font-medium text-zinc-800">
                          {b.schedule?.class?.name ?? `${b.type} Visit`}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {new Date(b.bookingDate).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] ?? ''}`}>
                        {b.status}
                      </span>
                      {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={cancelling === b.id}
                          onClick={() => handleCancel(b.id)}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
