'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LayoutDashboard, Users, CalendarDays, Dumbbell, LogOut, Clock, UserCheck, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin',             label: 'Overview',    icon: LayoutDashboard },
  { href: '/admin/users',       label: 'Users',       icon: Users },
  { href: '/admin/memberships', label: 'Memberships', icon: CreditCard },
  { href: '/admin/bookings',    label: 'Bookings',    icon: CalendarDays },
  { href: '/admin/classes',     label: 'Classes',     icon: Dumbbell },
  { href: '/admin/schedules',   label: 'Schedules',   icon: Clock },
  { href: '/admin/trainers',    label: 'Trainers',    icon: UserCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, _hasHydrated, logout } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) { router.replace('/login'); return; }
    if (user?.role !== 'ADMIN') { router.replace('/dashboard'); }
  }, [_hasHydrated, token, user, router]);

  if (!_hasHydrated || !token || user?.role !== 'ADMIN') return null;

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Admin sidebar */}
      <aside className="hidden lg:flex flex-col w-56 min-h-screen border-r bg-white px-4 py-6 shrink-0">
        <div className="mb-8 px-2">
          <span className="text-xl font-bold text-orange-500">🏋 Gymora</span>
          <p className="text-xs text-zinc-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t pt-4 flex flex-col gap-3">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-zinc-800 truncate">{user?.name}</p>
            <p className="text-xs text-red-500 font-medium">ADMIN</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">{children}</div>
    </div>
  );
}
