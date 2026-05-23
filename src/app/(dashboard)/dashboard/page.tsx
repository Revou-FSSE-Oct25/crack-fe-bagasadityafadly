'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { XpCard } from '@/components/dashboard/XpCard';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { QuickBookCard } from '@/components/dashboard/QuickBookCard';
import { RecommendationWidget } from '@/components/dashboard/RecommendationWidget';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { apiFetch } from '@/lib/api';
import type { UserXp, LeaderboardEntry, Recommendation } from '@/types';

export default function DashboardPage() {
  const [xp, setXp] = useState<UserXp | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [xpData, lbData, recData] = await Promise.all([
          apiFetch<UserXp>('/xp/my'),
          apiFetch<LeaderboardEntry[]>('/xp/leaderboard?limit=5'),
          apiFetch<Recommendation>('/recommendations/me'),
        ]);
        setXp(xpData);
        setLeaderboard(lbData);
        setRecommendation(recData);
      } catch {
        // Silently fail — individual cards show their own empty states
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <Topbar xpTotal={xp?.xpTotal} level={xp?.level} />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Row 1: XP + Streak + Quick Book */}
          <XpCard data={xp} loading={loading} />
          <StreakCard data={xp} loading={loading} />
          <QuickBookCard />

          {/* Row 2: Recommendations (wide) + Leaderboard */}
          <RecommendationWidget
            data={recommendation}
            loading={loading}
            className="lg:col-span-2"
          />
          <LeaderboardCard data={leaderboard} loading={loading} />
        </div>
      </main>
    </div>
  );
}
