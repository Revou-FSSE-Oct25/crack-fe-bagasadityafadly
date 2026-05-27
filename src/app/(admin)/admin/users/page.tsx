'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Role buttons config — label, target role, and colors
const ROLE_BUTTONS: { label: string; role: Role; style: string }[] = [
  { label: '→ NON MEMBER', role: 'NON_MEMBER',    style: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200' },
  { label: '→ MEMBER',     role: 'MEMBER',         style: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { label: '→ ADMIN',      role: 'ADMIN',          style: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { label: '→ SUPER ADMIN',role: 'ADMINISTRATOR',  style: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
];

const membershipOptions: { label: string; type: MembershipType; days: number }[] = [
  { label: 'Trial (7d)',    type: 'TRIAL',   days: 7 },
  { label: 'Basic (30d)',   type: 'BASIC',   days: 30 },
  { label: 'Premium (30d)', type: 'PREMIUM', days: 30 },
  { label: 'Premium (90d)', type: 'PREMIUM', days: 90 },
];

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdministrator = currentUser?.role === 'ADMINISTRATOR';

  const [users, setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await apiFetch<AdminUser[]>('/admin/users');
      setUsers(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Whether ADMIN role is allowed to set a given target role on a given user
  function adminCanSetRole(targetRole: Role, currentUserRole: Role): boolean {
    // ADMIN can only toggle between NON_MEMBER and MEMBER
    // Cannot touch ADMIN or ADMINISTRATOR accounts
    if (currentUserRole === 'ADMIN' || currentUserRole === 'ADMINISTRATOR') return false;
    return targetRole === 'MEMBER' || targetRole === 'NON_MEMBER';
  }

  async function changeRole(userId: string, role: Role) {
    setRoleError(null);
    setActionId(userId);
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      await load();
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : 'Failed to change role');
    } finally {
      setActionId(null);
    }
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
        {/* Permission notice for ADMIN role */}
        {!isAdministrator && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <strong>Admin permissions:</strong> You can toggle MEMBER ↔ NON_MEMBER and assign memberships.
            To assign ADMIN or SUPER ADMIN roles, contact a Super Administrator.
          </div>
        )}

        {roleError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
            ⚠️ {roleError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-zinc-100 rounded-lg animate-pulse" />)}
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No users found.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {users.map((u) => {
                  const membership = u.memberships[0];
                  const busy = actionId === u.id;

                  return (
                    <div key={u.id} className="flex flex-col gap-3 p-4 rounded-xl border bg-white">

                      {/* ── User info ───────────────────────────────── */}
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
                            {u.role.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-zinc-400">
                            Lv.{u.level} · {u.xpTotal} XP · 🔥{u.streakCount}
                          </span>
                          {membership && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              {membership.type} until {new Date(membership.endDate).toLocaleDateString()}
                            </span>
                          )}
                          {!u.isActive && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                              Deactivated
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Actions ─────────────────────────────────── */}
                      <div className="flex flex-col gap-2 border-t pt-3">

                        {/* Role change row */}
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-xs font-medium text-zinc-400 w-16 shrink-0">Role:</span>
                          {ROLE_BUTTONS.map(({ label, role, style }) => {
                            const isCurrent  = u.role === role;
                            const isAllowed  = isAdministrator || adminCanSetRole(role, u.role);
                            // ADMIN: can toggle NON_MEMBER↔MEMBER only; ADMINISTRATOR: any change
                            const isApplicable = isAdministrator
                              ? !isCurrent
                              : !isCurrent && (u.role === 'NON_MEMBER' || u.role === 'MEMBER') && (role === 'MEMBER' || role === 'NON_MEMBER');

                            return (
                              <button
                                key={role}
                                disabled={busy || isCurrent || !isAllowed || !isApplicable}
                                title={
                                  !isAllowed
                                    ? 'Only Super Administrators can set this role'
                                    : isCurrent
                                      ? 'Already this role'
                                      : !isApplicable
                                        ? 'Admins can only change MEMBER ↔ NON_MEMBER'
                                        : undefined
                                }
                                onClick={() => changeRole(u.id, role)}
                                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors
                                  ${isCurrent
                                    ? 'bg-zinc-200 text-zinc-400 cursor-default'
                                    : (!isAllowed || !isApplicable)
                                      ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                                      : style
                                  } disabled:opacity-50`}
                              >
                                {busy ? '…' : label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Membership assignment row */}
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-xs font-medium text-zinc-400 w-16 shrink-0">Membership:</span>
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
