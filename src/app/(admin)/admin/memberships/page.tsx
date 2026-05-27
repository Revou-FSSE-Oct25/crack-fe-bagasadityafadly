'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type MembershipType = 'TRIAL' | 'BASIC' | 'PREMIUM';

interface ActiveMembership {
  id: string;
  type: MembershipType;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  user: { id: string; name: string; email: string; role: string };
}

const typeColor: Record<MembershipType, string> = {
  TRIAL:   'bg-orange-100 text-orange-700',
  BASIC:   'bg-orange-500 text-white',
  PREMIUM: 'bg-purple-600 text-white',
};

const typePrice: Record<MembershipType, string> = {
  TRIAL:   'Rp 50.000/visit (14-day trial)',
  BASIC:   'Rp 250.000/month',
  PREMIUM: 'Rp 500.000/month',
};

function daysLeft(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
}

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<ActiveMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  async function load() {
    try {
      const data = await apiFetch<ActiveMembership[]>('/admin/memberships');
      setMemberships(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(id: string) {
    if (!confirm('Cancel this membership? The user will be downgraded to Non-Member.')) return;
    setCancellingId(id);
    try {
      await apiFetch(`/admin/memberships/${id}`, { method: 'DELETE' });
      await load();
    } catch { /* ignore */ }
    finally { setCancellingId(null); }
  }

  const filtered = memberships.filter(m =>
    filterType === 'ALL' || m.type === filterType,
  );

  const counts: Record<string, number> = memberships.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="font-bold text-zinc-900 text-xl">Active Memberships ({memberships.length})</h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {(['TRIAL', 'BASIC', 'PREMIUM'] as MembershipType[]).map(t => (
            <div key={t} className={`flex flex-col gap-1 p-4 rounded-xl ${typeColor[t]}`}>
              <p className="text-xs font-semibold opacity-80">{t}</p>
              <p className="text-2xl font-bold">{counts[t] ?? 0}</p>
              <p className="text-xs opacity-70">{typePrice[t]}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'TRIAL', 'BASIC', 'PREMIUM'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                filterType === t
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
              }`}
            >
              {t === 'ALL' ? 'All' : t} {t !== 'ALL' && counts[t] ? `(${counts[t]})` : ''}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {filterType === 'ALL' ? `All Active (${filtered.length})` : `${filterType} (${filtered.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No active memberships found.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map(m => {
                  const days = daysLeft(m.endDate);
                  const expiring = days <= 7;
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border bg-white gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                          {m.user.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-800 truncate">{m.user.name}</p>
                          <p className="text-xs text-zinc-400 truncate">{m.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${typeColor[m.type]}`}>
                          {m.type}
                        </span>
                        <span className={`text-xs font-medium ${expiring ? 'text-red-500' : 'text-zinc-500'}`}>
                          {expiring ? '⚠️ ' : ''}{days}d left · expires {new Date(m.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <button
                          disabled={cancellingId === m.id}
                          onClick={() => handleCancel(m.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40 transition-colors"
                        >
                          {cancellingId === m.id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      </div>
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
