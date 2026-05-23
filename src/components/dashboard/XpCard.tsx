'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserXp } from '@/types';

interface XpCardProps {
  data: UserXp | null;
  loading: boolean;
}

export function XpCard({ data, loading }: XpCardProps) {
  const xpInCurrentLevel = (data?.xpTotal ?? 0) % 100;
  const progressPct = xpInCurrentLevel;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⭐ Experience Points
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="h-16 bg-zinc-100 rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-zinc-900">{data?.xpTotal ?? 0}</p>
                <p className="text-sm text-zinc-500">Total XP</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-500">Lv. {data?.level ?? 1}</p>
                <p className="text-sm text-zinc-500">{xpInCurrentLevel}/100 to next</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {data?.bronzeBorderUnlocked && (
              <p className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md border border-amber-200 w-fit">
                🥉 Bronze Border Unlocked
              </p>
            )}
            {data?.canApplyAsPT && (
              <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-200 w-fit">
                🏋 PT Application Available
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
