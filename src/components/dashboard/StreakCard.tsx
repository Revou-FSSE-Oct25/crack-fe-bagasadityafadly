'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserXp } from '@/types';

interface StreakCardProps {
  data: UserXp | null;
  loading: boolean;
}

const milestones = [
  { days: 3,  label: '🥉 Bronze Border', reached: (n: number) => n >= 3 },
  { days: 7,  label: '🥤 Protein Drink', reached: (n: number) => n >= 7 },
  { days: 30, label: '💪 PT Pathway',    reached: (n: number) => n >= 30 },
];

export function StreakCard({ data, loading }: StreakCardProps) {
  const streak = data?.streakCount ?? 0;
  const nextMilestone = milestones.find((m) => streak < m.days);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="h-16 bg-zinc-100 rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-zinc-900">{streak}</p>
              <p className="text-zinc-500 pb-1">{streak === 1 ? 'day' : 'days'}</p>
            </div>

            {nextMilestone && (
              <p className="text-sm text-zinc-500">
                {nextMilestone.days - streak} more day{nextMilestone.days - streak !== 1 ? 's' : ''} to unlock{' '}
                <span className="font-medium text-zinc-700">{nextMilestone.label}</span>
              </p>
            )}

            {/* Milestone dots */}
            <div className="flex gap-3">
              {milestones.map((m) => (
                <div
                  key={m.days}
                  className={`flex flex-col items-center gap-1 text-xs ${
                    m.reached(streak) ? 'text-orange-500 font-medium' : 'text-zinc-400'
                  }`}
                >
                  <div
                    className={`size-3 rounded-full ${
                      m.reached(streak) ? 'bg-orange-400' : 'bg-zinc-200'
                    }`}
                  />
                  {m.days}d
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
