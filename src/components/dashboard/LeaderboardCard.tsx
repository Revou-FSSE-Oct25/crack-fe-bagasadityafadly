'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardCardProps {
  data: LeaderboardEntry[];
  loading: boolean;
}

const rankEmoji: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function LeaderboardCard({ data, loading }: LeaderboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4">No data yet</p>
        ) : (
          data.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-base w-6 text-center">
                  {rankEmoji[entry.rank] ?? `#${entry.rank}`}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-800">{entry.name}</p>
                  <p className="text-xs text-zinc-400">
                    Lv. {entry.level} · 🔥 {entry.streakCount}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-orange-500">{entry.xpTotal} XP</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
