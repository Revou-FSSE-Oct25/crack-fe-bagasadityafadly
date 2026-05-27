'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalCheckIns: number;
  activeMembers: number;
  totalNonMembers: number;
  estimatedRevenue: number;
}

const quickLinks = [
  { href: '/admin/users',       label: 'Manage Users',       icon: '👥', color: 'bg-orange-500 hover:bg-orange-600' },
  { href: '/admin/memberships', label: 'Memberships',        icon: '🏅', color: 'bg-purple-600 hover:bg-purple-700' },
  { href: '/admin/bookings',    label: 'All Bookings',       icon: '📅', color: 'bg-blue-600 hover:bg-blue-700' },
  { href: '/admin/classes',     label: 'Manage Classes',     icon: '🧘', color: 'bg-zinc-800 hover:bg-zinc-900' },
  { href: '/admin/schedules',   label: 'Manage Schedules',   icon: '🗓',  color: 'bg-green-600 hover:bg-green-700' },
  { href: '/admin/trainers',    label: 'Manage Trainers',    icon: '👟', color: 'bg-teal-600 hover:bg-teal-700' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Stats>('/admin/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Users',       value: stats?.totalUsers,       icon: '👥', color: 'text-blue-600' },
    { label: 'Active Members',    value: stats?.activeMembers,    icon: '⭐', color: 'text-purple-600' },
    { label: 'Non-Members',       value: stats?.totalNonMembers,  icon: '🏋', color: 'text-zinc-600' },
    { label: 'Total Bookings',    value: stats?.totalBookings,    icon: '📅', color: 'text-orange-600' },
    { label: 'Check-ins',         value: stats?.totalCheckIns,    icon: '✅', color: 'text-green-600' },
    {
      label: 'Est. Revenue (visits)',
      value: stats ? fmt(stats.estimatedRevenue) : null,
      icon: '💰',
      color: 'text-emerald-600',
      isText: true,
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Admin Panel</p>
          <h1 className="font-bold text-zinc-900 text-xl">Overview</h1>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <span>{s.icon}</span> {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 bg-zinc-100 rounded animate-pulse" />
                ) : (
                  <p className={`text-2xl font-bold ${s.color}`}>
                    {s.value ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing reminder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { plan: 'Non-Member',  price: 'Rp 50.000/visit',  color: 'bg-zinc-100 text-zinc-700' },
                { plan: 'Trial',       price: 'Rp 50.000/visit',  color: 'bg-orange-100 text-orange-700' },
                { plan: 'Basic',       price: 'Rp 250.000/month', color: 'bg-orange-500 text-white' },
                { plan: 'Premium',     price: 'Rp 500.000/month', color: 'bg-purple-600 text-white' },
              ].map((p) => (
                <div key={p.plan} className={`flex flex-col gap-1 p-3 rounded-xl ${p.color}`}>
                  <p className="text-xs font-semibold opacity-80">{p.plan}</p>
                  <p className="text-sm font-bold">{p.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 px-4 py-2 ${l.color} text-white text-sm font-medium rounded-lg transition-colors`}
              >
                <span>{l.icon}</span> {l.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
