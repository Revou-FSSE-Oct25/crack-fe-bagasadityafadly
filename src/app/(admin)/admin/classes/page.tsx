'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import type { GymClass } from '@/types';

type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

const difficultyColor: Record<Difficulty, string> = {
  BEGINNER:     'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED:     'bg-red-100 text-red-700',
};

const emptyForm = {
  name: '',
  description: '',
  difficulty: 'BEGINNER' as Difficulty,
  durationMinutes: 60,
  capacity: 20,
  caloriesEstimate: '',
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await apiFetch<GymClass[]>('/classes');
      setClasses(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch('/admin/classes', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          durationMinutes: Number(form.durationMinutes),
          capacity: Number(form.capacity),
          caloriesEstimate: form.caloriesEstimate ? Number(form.caloriesEstimate) : undefined,
        }),
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiFetch(`/admin/classes/${id}`, { method: 'DELETE' });
      await load();
    } catch { /* ignore */ }
    finally { setDeletingId(null); }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="font-bold text-zinc-900 text-xl">Classes</h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Create form */}
        <Card>
          <CardHeader><CardTitle>Add New Class</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Class Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="e.g. Morning Yoga" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Difficulty *</label>
                <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value as Difficulty})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Duration (minutes) *</label>
                <input type="number" min={5} max={300} required value={form.durationMinutes}
                  onChange={e => setForm({...form, durationMinutes: Number(e.target.value)})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Capacity *</label>
                <input type="number" min={1} max={200} required value={form.capacity}
                  onChange={e => setForm({...form, capacity: Number(e.target.value)})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700">Calories Estimate</label>
                <input type="number" min={0} value={form.caloriesEstimate}
                  onChange={e => setForm({...form, caloriesEstimate: e.target.value})}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="e.g. 300" />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-zinc-700">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={2} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                  placeholder="Brief description of the class..." />
              </div>

              {error && (
                <p className="sm:col-span-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
              )}

              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {saving ? 'Creating…' : '+ Create Class'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Class list */}
        <Card>
          <CardHeader><CardTitle>Active Classes ({classes.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2].map(i => <div key={i} className="h-24 bg-zinc-100 rounded-xl animate-pulse" />)}
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No classes yet. Create one above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classes.map(cls => (
                  <div key={cls.id} className="flex flex-col gap-3 p-4 rounded-xl border bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-zinc-900">{cls.name}</h3>
                        {cls.description && <p className="text-xs text-zinc-500 mt-0.5">{cls.description}</p>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${difficultyColor[cls.difficulty as Difficulty] ?? ''}`}>
                        {cls.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs text-zinc-400">
                        <span>⏱ {cls.durationMinutes}min</span>
                        <span>👥 {cls.capacity}</span>
                        {cls.caloriesEstimate && <span>🔥 {cls.caloriesEstimate}cal</span>}
                      </div>
                      <button
                        disabled={deletingId === cls.id}
                        onClick={() => handleDelete(cls.id)}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 font-medium"
                      >
                        {deletingId === cls.id ? 'Removing…' : 'Remove'}
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
