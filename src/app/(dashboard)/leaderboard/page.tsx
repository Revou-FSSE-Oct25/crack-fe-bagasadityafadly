'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { LeaderboardEntry } from '@/types';

const rankEmoji: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<LeaderboardEntry[]>('/xp/leaderboard?limit=20')
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <Topbar />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>🏆 Leaderboard — Top Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-zinc-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">
                No athletes yet. Be the first to check in!
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                      entry.rank <= 3 ? 'bg-amber-50 border-amber-100' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl w-8 text-center">
                        {rankEmoji[entry.rank] ?? `#${entry.rank}`}
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-900">{entry.name}</p>
                        <p className="text-xs text-zinc-400">
                          Level {entry.level} · 🔥 {entry.streakCount} day streak
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-500 text-lg">{entry.xpTotal}</p>
                      <p className="text-xs text-zinc-400">XP</p>
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
