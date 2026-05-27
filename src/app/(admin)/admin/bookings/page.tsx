'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

interface AdminBooking {
  id: string;
  type: 'GYM' | 'CLASS' | 'PT';
  status: BookingStatus;
  bookingDate: string;
  createdAt: string;
  notes: string | null;
  user: { id: string; name: string; email: string; role: string };
  schedule: {
    id: string;
    startTime: string;
    endTime: string;
    roomOrZone: string | null;
    class: {
      name: string;
      durationMinutes: number;
      difficulty: string;
      caloriesEstimate: number | null;
    };
    trainer: { name: string; specialty: string | null } | null;
  } | null;
  trainer: { id: string; name: string; specialty: string | null } | null;
}

// ── Config ────────────────────────────────────────────────────────────────────
const statusColor: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-zinc-100 text-zinc-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW:   'bg-red-100 text-red-700',
};

const statusLabel: Record<BookingStatus, string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW:   'No Show',
};

const typeIcon: Record<string, string>  = { GYM: '🏋', CLASS: '🧘', PT: '👟' };
const typeLabel: Record<string, string> = { GYM: 'Gym Visit', CLASS: 'Class', PT: 'Personal Training' };

const diffColor: Record<string, string> = {
  BEGINNER:     'text-green-600',
  INTERMEDIATE: 'text-yellow-600',
  ADVANCED:     'text-red-600',
};

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW:   [],
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const [bookings, setBookings]     = useState<AdminBooking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType]     = useState<string>('ALL');
  const [search, setSearch]             = useState('');

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
    if (filterType   !== 'ALL' && b.type   !== filterType)   return false;
    if (search) {
      const q = search.toLowerCase();
      const name  = b.user.name.toLowerCase();
      const email = b.user.email.toLowerCase();
      const cls   = b.schedule?.class?.name?.toLowerCase() ?? '';
      if (!name.includes(q) && !email.includes(q) && !cls.includes(q)) return false;
    }
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

        {/* ── Summary chips ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['CONFIRMED', 'PENDING', 'COMPLETED', 'NO_SHOW', 'CANCELLED'] as BookingStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}
              className={`flex flex-col items-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                filterStatus === s ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <span className="text-lg font-bold">{counts[s] ?? 0}</span>
              {statusLabel[s]}
            </button>
          ))}
        </div>

        {/* ── Filters row ────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by member, email or class…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {/* Type filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-orange-400"
          >
            <option value="ALL">All Types</option>
            <option value="GYM">🏋 Gym Visit</option>
            <option value="CLASS">🧘 Class</option>
            <option value="PT">👟 Personal Training</option>
          </select>
          {/* Reset */}
          {(filterStatus !== 'ALL' || filterType !== 'ALL' || search) && (
            <button
              onClick={() => { setFilterStatus('ALL'); setFilterType('ALL'); setSearch(''); }}
              className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 text-zinc-500 hover:border-zinc-400"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Bookings list ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filtered.length === bookings.length
                ? `All Bookings (${bookings.length})`
                : `Showing ${filtered.length} of ${bookings.length} bookings`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No bookings match the current filters.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map(b => {
                  const transitions = STATUS_TRANSITIONS[b.status];
                  const busy = updatingId === b.id;
                  const sch  = b.schedule;

                  return (
                    <div key={b.id} className="flex flex-col gap-3 p-4 rounded-xl border bg-white">

                      {/* ── Row 1: Type + status + user ───────────── */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl shrink-0">{typeIcon[b.type]}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 text-sm">
                              {sch ? sch.class.name : typeLabel[b.type]}
                              {b.type === 'PT' && b.trainer && (
                                <span className="ml-1 font-normal text-zinc-500">w/ {b.trainer.name}</span>
                              )}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              <span className="font-medium text-zinc-700">{b.user.name}</span>
                              {' '}·{' '}{b.user.email}
                              {' '}·{' '}
                              <span className={`font-medium ${
                                b.user.role === 'MEMBER'     ? 'text-green-600'  :
                                b.user.role === 'ADMIN'      ? 'text-red-600'    :
                                b.user.role === 'ADMINISTRATOR' ? 'text-purple-600' :
                                'text-zinc-400'
                              }`}>{b.user.role.replace('_', ' ')}</span>
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${statusColor[b.status]}`}>
                          {statusLabel[b.status]}
                        </span>
                      </div>

                      {/* ── Row 2: Schedule details ────────────────── */}
                      {sch ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-50 rounded-lg px-3 py-2 text-xs">
                          <div>
                            <p className="text-zinc-400 mb-0.5">📅 Date</p>
                            <p className="font-medium text-zinc-800">{fmtDate(sch.startTime)}</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-0.5">🕐 Time</p>
                            <p className="font-medium text-zinc-800">
                              {fmtTime(sch.startTime)} – {fmtTime(sch.endTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-0.5">📍 Room / Zone</p>
                            <p className="font-medium text-zinc-800">{sch.roomOrZone ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-0.5">👟 Trainer</p>
                            <p className="font-medium text-zinc-800">
                              {sch.trainer?.name ?? '—'}
                              {sch.trainer?.specialty && (
                                <span className="text-zinc-400"> ({sch.trainer.specialty})</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-0.5">⏱ Duration</p>
                            <p className="font-medium text-zinc-800">{sch.class.durationMinutes} min</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-0.5">💪 Difficulty</p>
                            <p className={`font-semibold ${diffColor[sch.class.difficulty] ?? 'text-zinc-800'}`}>
                              {sch.class.difficulty}
                            </p>
                          </div>
                          {sch.class.caloriesEstimate && (
                            <div>
                              <p className="text-zinc-400 mb-0.5">🔥 Calories</p>
                              <p className="font-medium text-zinc-800">{sch.class.caloriesEstimate} cal</p>
                            </div>
                          )}
                          <div>
                            <p className="text-zinc-400 mb-0.5">📌 Booked on</p>
                            <p className="font-medium text-zinc-800">{fmtDate(b.createdAt)}</p>
                          </div>
                        </div>
                      ) : (
                        // GYM Visit — no schedule
                        <div className="flex gap-4 bg-zinc-50 rounded-lg px-3 py-2 text-xs">
                          <div>
                            <p className="text-zinc-400 mb-0.5">📅 Visit Date</p>
                            <p className="font-medium text-zinc-800">{fmtDate(b.bookingDate)}</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 mb-0.5">📌 Booked on</p>
                            <p className="font-medium text-zinc-800">{fmtDate(b.createdAt)}</p>
                          </div>
                          {b.notes && (
                            <div>
                              <p className="text-zinc-400 mb-0.5">📝 Notes</p>
                              <p className="font-medium text-zinc-800">{b.notes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Row 3: Status action buttons ──────────── */}
                      {transitions.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap border-t pt-2">
                          <span className="text-xs text-zinc-400 shrink-0">Change status:</span>
                          {transitions.map((newStatus) => (
                            <button
                              key={newStatus}
                              disabled={busy}
                              onClick={() => updateStatus(b.id, newStatus)}
                              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors disabled:opacity-40 ${
                                newStatus === 'CANCELLED' || newStatus === 'NO_SHOW'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                  : newStatus === 'COMPLETED'
                                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100'
                              }`}
                            >
                              {busy ? '…' : `→ ${statusLabel[newStatus]}`}
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
