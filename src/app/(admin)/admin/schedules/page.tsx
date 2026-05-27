'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import type { GymClass, Trainer, Schedule } from '@/types';

interface AdminSchedule {
  id: string;
  startTime: string;
  endTime: string;
  roomOrZone: string | null;
  isActive: boolean;
  class: { id: string; name: string; capacity: number };
  trainer: { id: string; name: string };
  _count: { bookings: number };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  // Format as YYYY-MM-DDTHH:MM for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localToIso(local: string) {
  return new Date(local).toISOString();
}

const emptyForm = {
  classId: '',
  trainerId: '',
  startTime: '',
  endTime: '',
  roomOrZone: '',
};

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [sc, cl, tr] = await Promise.all([
        apiFetch<AdminSchedule[]>('/admin/schedules'),
        apiFetch<GymClass[]>('/classes'),
        apiFetch<Trainer[]>('/trainers'),
      ]);
      setSchedules(sc);
      setClasses(cl);
      setTrainers(tr);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch('/admin/schedules', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          startTime: localToIso(form.startTime),
          endTime: localToIso(form.endTime),
          roomOrZone: form.roomOrZone || undefined,
        }),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiFetch(`/admin/schedules/${id}`, { method: 'DELETE' });
      await load();
    } catch { /* ignore */ }
    finally { setDeletingId(null); }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="font-bold text-zinc-900 text-xl">Schedules</h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Create form */}
        <Card>
          <CardHeader><CardTitle>Add New Session</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Class *</label>
                <select required value={form.classId} onChange={e => setForm({...form, classId: e.target.value})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400">
                  <option value="">Select a class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Trainer *</label>
                <select required value={form.trainerId} onChange={e => setForm({...form, trainerId: e.target.value})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400">
                  <option value="">Select a trainer…</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Start Time *</label>
                <input type="datetime-local" required value={form.startTime}
                  onChange={e => setForm({...form, startTime: e.target.value})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">End Time *</label>
                <input type="datetime-local" required value={form.endTime}
                  onChange={e => setForm({...form, endTime: e.target.value})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-zinc-700">Room / Zone</label>
                <input value={form.roomOrZone} onChange={e => setForm({...form, roomOrZone: e.target.value})}
                  placeholder="e.g. Studio A, Zone 2…"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              {error && (
                <p className="sm:col-span-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
              )}

              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {saving ? 'Creating…' : '+ Create Session'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Schedule list */}
        <Card>
          <CardHeader><CardTitle>Upcoming Sessions ({schedules.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-100 rounded-xl animate-pulse" />)}
              </div>
            ) : schedules.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No upcoming sessions. Create one above.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {schedules.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border bg-white gap-3 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col items-center justify-center w-12 shrink-0">
                        <span className="text-xs font-medium text-orange-500 uppercase">
                          {new Date(s.startTime).toLocaleDateString('en-GB', { weekday: 'short' })}
                        </span>
                        <span className="text-xl font-bold text-zinc-800 leading-none">
                          {new Date(s.startTime).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-800">
                          {s.class.name}
                          {s.roomOrZone && <span className="text-zinc-400 font-normal"> · {s.roomOrZone}</span>}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {formatDateTime(s.startTime)} · {s.trainer.name}
                        </p>
                        <p className="text-xs text-zinc-400">{s._count.bookings}/{s.class.capacity} booked</p>
                      </div>
                    </div>
                    <button
                      disabled={deletingId === s.id}
                      onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 font-medium shrink-0"
                    >
                      {deletingId === s.id ? 'Removing…' : 'Cancel'}
                    </button>
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
