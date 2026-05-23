'use client';

import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';

interface TopbarProps {
  xpTotal?: number;
  level?: number;
}

export function Topbar({ xpTotal = 0, level = 1 }: TopbarProps) {
  const user = useAuthStore((s) => s.user);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <div>
        <p className="text-sm text-zinc-400">{greeting}</p>
        <p className="font-semibold text-zinc-900">{user?.name ?? 'Athlete'}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
          ⭐ {xpTotal} XP
        </Badge>
        <Badge variant="outline">
          Lv. {level}
        </Badge>
      </div>
    </header>
  );
}
