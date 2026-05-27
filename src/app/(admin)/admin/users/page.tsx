'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Role = 'ADMINISTRATOR' | 'ADMIN' | 'MEMBER' | 'NON_MEMBER';
type MembershipType = 'BASIC' | 'PREMIUM' | 'TRIAL' | 'NONE';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  xpTotal: number;
  level: number;
  streakCount: number;
  isActive: boolean;
  createdAt: string;
  memberships: Array<{ type: MembershipType; status: string; endDate: string }>;
}

const roleColor: Record<Role, string> = {
  ADMINISTRATOR: 'bg-purple-100 text-purple-700',
  ADMIN:         'bg-red-100 text-red-700',
  MEMBER:        'bg-green-100 text-green-700',
  NON_MEMBER:    'bg-zinc-100 text-zinc-500',
};

const membershipOptions: { label: string; type: MembershipType; days: number }[] = [
  { label: 'Trial (7 days)',    type: 'TRIAL',   days: 7 },
  { label: 'Basic (30 days)',   type: 'BASIC',   days: 30 },
  { label: 'Premium (30 days)', type: 'PREMIUM', days: 30 },
  { label: 'Premium (90 days)', type: 'PREMIUM', days: 90 },
];

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdministrator = currentUser?.role === 'ADMINISTRATOR';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function load() {
    try {
      const data = await apiFetch<AdminUser[]>('/admin/users');
      setUsers(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function changeRole(userId: string, role: Role) {
    setActionId(userId);
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      await load();
    } catch { /* ignore */ }
    finally { setActionId(null); }
  }

  async function assignMembership(userId: string, type: MembershipType, durationDays: number) {
    setActionId(userId);
    try {
      await apiFetch(`/admin/users/${userId}/membership`, {
        method: 'POST',
        body: JSON.stringify({ type, durationDays }),
      });
      await load();
    } catch { /* ignore */ }
    finally { setActionId(null); }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="font-bold text-zinc-900 text-xl">Users ({users.length})</h1>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-100 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {users.map((u) => {
                  const membership = u.memberships[0];
                  const busy = actionId === u.id;
                  return (
                    <div key={u.id} className="flex flex-col gap-3 p-4 rounded-xl border bg-white">
                      {/* User info row */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                            {u.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 truncate">{u.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]}`}>
                            {u.role}
                          </span>
                          <span className="text-xs text-zinc-400">Lv.{u.level} · {u.xpTotal} XP · 🔥{u.streakCount}</span>
                          {membership && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              {membership.type} until {new Date(membership.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action row */}
                      <div className="flex gap-2 flex-wrap border-t pt-3">
                        {/* Role buttons — ADMINISTRATOR sees all options, ADMIN can only promote NON_MEMBER→MEMBER */}
                        <div className="flex gap-1 flex-wrap">
                          {isAdministrator ? (
                            // ADMINISTRATOR: full role control
                            (['NON_MEMBER', 'MEMBER', 'ADMIN', 'ADMINISTRATOR'] as Role[]).map((r) => (
                              <button
                                key={r}
                                disabled={busy || u.role === r}
                                onClick={() => changeRole(u.id, r)}
                                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors disabled:opacity-40 ${
                                  u.role === r
                                    ? 'bg-zinc-200 text-zinc-500 cursor-default'
                                    : r === 'ADMINISTRATOR'
                                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                      : r === 'ADMIN'
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                }`}
                              >
                                → {r.replace('_', ' ')}
                              </button>
                            ))
                          ) : (
                            // ADMIN: can only promote NON_MEMBER → MEMBER
                            u.role === 'NON_MEMBER' ? (
                              <button
                                disabled={busy}
                                onClick={() => changeRole(u.id, 'MEMBER')}
                                className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-40"
                              >
                                → MEMBER
                              </button>
                            ) : (
                              <span className="text-xs text-zinc-400 italic">Role locked</span>
                            )
                          )}
                        </div>

                        {/* Membership buttons */}
                        <div className="flex gap-1 flex-wrap">
                          {membershipOptions.map((m) => (
                            <button
                              key={`${m.type}-${m.days}`}
                              disabled={busy}
                              onClick={() => assignMembership(u.id, m.type, m.days)}
                              className="px-2 py-1 text-xs rounded-md font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-40"
                            >
                              {busy ? '…' : m.label}
                            </button>
                          ))}
                        </div>
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
