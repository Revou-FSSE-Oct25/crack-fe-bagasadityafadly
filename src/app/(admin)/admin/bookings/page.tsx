'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

interface AdminBooking {
  id: string;
  type: string;
  status: BookingStatus;
  bookingDate: string;
  createdAt: string;
  notes: string | null;
  user: { id: string; name: string; email: string; role: string };
  schedule: { class: { name: string } | null; trainer: { name: string } | null } | null;
}

const statusColor: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-zinc-100 text-zinc-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW:   'bg-red-100 text-red-700',
};

const typeIcon: Record<string, string> = { GYM: '🏋', CLASS: '🧘', PT: '👟' };

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW:   [],
};

const statusLabel: Record<BookingStatus, string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW:   'No Show',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  async function load() {
    try {
      const data = await apiFetch<AdminBooking[]>('/admin/bookings?limit=200');
      setBookings(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdatingId(id);
    try {
      await apiFetch(`/admin/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  }

  const filtered = bookings.filter((b) => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (filterType !== 'ALL' && b.type !== filterType) return false;
    return true;
  });

  const counts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="font-bold text-zinc-900 text-xl">All Bookings ({bookings.length})</h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4">
        {/* Status summary chips */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'NO_SHOW', 'CANCELLED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                filterStatus === s
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
              }`}
            >
              {s === 'ALL' ? 'All' : statusLabel[s]} {s !== 'ALL' && counts[s] ? `(${counts[s]})` : ''}
            </button>
          ))}

          <div className="flex-1" />

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-1 text-xs outline-none focus:border-orange-400"
          >
            <option value="ALL">All Types</option>
            <option value="GYM">🏋 Gym</option>
            <option value="CLASS">🧘 Class</option>
            <option value="PT">👟 PT</option>
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {filterStatus === 'ALL' && filterType === 'ALL'
                ? `All Bookings (${filtered.length})`
                : `Filtered: ${filtered.length} bookings`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No bookings match the current filters.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map(b => {
                  const transitions = STATUS_TRANSITIONS[b.status];
                  const busy = updatingId === b.id;
                  return (
                    <div key={b.id} className="flex flex-col gap-2 p-3 rounded-xl border bg-white">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl shrink-0">{typeIcon[b.type] ?? '📅'}</span>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-800 truncate">
                              {b.schedule?.class?.name ?? `${b.type} Visit`}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {b.user.name} · {b.user.email} ·{' '}
                              {new Date(b.bookingDate).toLocaleDateString('en-GB', {
                                weekday: 'short', day: 'numeric', month: 'short',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusColor[b.status]}`}>
                          {statusLabel[b.status]}
                        </span>
                      </div>

                      {/* Status transition buttons */}
                      {transitions.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap border-t pt-2">
                          <span className="text-xs text-zinc-400 self-center mr-1">Set:</span>
                          {transitions.map((newStatus) => (
                            <button
                              key={newStatus}
                              disabled={busy}
                              onClick={() => updateStatus(b.id, newStatus)}
                              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors disabled:opacity-40 ${
                                newStatus === 'CANCELLED' || newStatus === 'NO_SHOW'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : newStatus === 'COMPLETED'
                                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {busy ? '…' : statusLabel[newStatus]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
