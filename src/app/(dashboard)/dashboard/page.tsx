'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/layout/Topbar';
import { XpCard } from '@/components/dashboard/XpCard';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { QuickBookCard } from '@/components/dashboard/QuickBookCard';
import { RecommendationWidget } from '@/components/dashboard/RecommendationWidget';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { UserXp, LeaderboardEntry, Recommendation } from '@/types';

function NonMemberBanner({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl shrink-0">
          👋
        </div>
        <div>
          <p className="font-semibold text-zinc-900 text-sm">
            Welcome, {name}! You&apos;re visiting as a non-member.
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            You can book free gym visits anytime. Upgrade to unlock classes, PT sessions, XP rewards, and more.
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0 flex-wrap">
        <Link href="/book?plan=NONE">
          <Button size="sm" variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 text-xs">
            Book Gym Visit
          </Button>
        </Link>
        <Link href="/membership">
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
            Upgrade Plan →
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isNonMember = user?.role === 'NON_MEMBER';

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

      <main className="flex-1 p-6 flex flex-col gap-5">
        {/* Non-member welcome strip */}
        {isNonMember && user && (
          <NonMemberBanner name={user.name} />
        )}

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
