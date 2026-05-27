'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

interface AdminTrainer {
  id: string;
  name: string;
  email: string;
  specialty: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  _count: { schedules: number };
}

const emptyForm = { name: '', email: '', specialty: '', bio: '' };

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<AdminTrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await apiFetch<AdminTrainer[]>('/admin/trainers');
      setTrainers(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiFetch('/admin/trainers', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          specialty: form.specialty.trim() || undefined,
          bio: form.bio.trim() || undefined,
        }),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trainer');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(trainer: AdminTrainer) {
    setTogglingId(trainer.id);
    try {
      await apiFetch(`/admin/trainers/${trainer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !trainer.isActive }),
      });
      await load();
    } catch { /* ignore */ }
    finally { setTogglingId(null); }
  }

  const inputCls = 'rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 w-full';

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="font-bold text-zinc-900 text-xl">Trainers ({trainers.length})</h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Create form */}
        <Card>
          <CardHeader><CardTitle>Add New Trainer</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Full Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className={inputCls} placeholder="e.g. Alex Rivera" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className={inputCls} placeholder="trainer@gymora.com" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Specialty</label>
                <input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})}
                  className={inputCls} placeholder="e.g. HIIT & Strength Training" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Bio</label>
                <input value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                  className={inputCls} placeholder="Short bio…" />
              </div>

              {error && (
                <p className="sm:col-span-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
              )}

              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {saving ? 'Adding…' : '+ Add Trainer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Trainer list */}
        <Card>
          <CardHeader><CardTitle>All Trainers ({trainers.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />)}
              </div>
            ) : trainers.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No trainers yet. Add one above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trainers.map(t => (
                  <div
                    key={t.id}
                    className={`flex flex-col gap-3 p-4 rounded-xl border transition-opacity ${
                      t.isActive ? 'bg-white' : 'bg-zinc-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg shrink-0">
                          {t.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{t.name}</p>
                          <p className="text-xs text-zinc-400">{t.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        t.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {t.specialty && (
                      <p className="text-xs text-orange-600 font-medium">🏅 {t.specialty}</p>
                    )}
                    {t.bio && (
                      <p className="text-xs text-zinc-500 line-clamp-2">{t.bio}</p>
                    )}

                    <div className="flex items-center justify-between border-t pt-3">
                      <p className="text-xs text-zinc-400">{t._count.schedules} scheduled sessions</p>
                      <button
                        disabled={togglingId === t.id}
                        onClick={() => toggleActive(t)}
                        className={`text-xs font-medium transition-colors disabled:opacity-40 ${
                          t.isActive
                            ? 'text-red-500 hover:text-red-700'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {togglingId === t.id ? '…' : t.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
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
