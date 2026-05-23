'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recommendation } from '@/types';

interface RecommendationWidgetProps {
  data: Recommendation | null;
  loading: boolean;
  className?: string;
}

const difficultyColor: Record<string, string> = {
  BEGINNER:     'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED:     'bg-red-100 text-red-700',
};

export function RecommendationWidget({ data, loading, className }: RecommendationWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data?.hasAssessment ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-3xl">🧠</span>
            <p className="font-medium text-zinc-700">Activate Smart Recommendations</p>
            <p className="text-sm text-zinc-500 max-w-xs">
              Fill in a quick assessment and we'll match you with the best classes for your goal.
            </p>
            <Link
              href="/assessment"
              className="text-sm font-medium text-orange-500 hover:underline"
            >
              Take the assessment →
            </Link>
          </div>
        ) : (
          <>
            {/* Recovery advice */}
            {data.recovery && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs font-medium text-blue-600 mb-1">Recovery Advice</p>
                <p className="text-sm text-blue-800">{data.recovery.advice}</p>
                <p className="text-xs text-blue-400 mt-1">{data.recovery.checkInsLast7Days} check-ins this week</p>
              </div>
            )}

            {/* Class recommendations */}
            {data.classes.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Recommended Classes</p>
                {data.classes.map((cls, i) => (
                  <div
                    key={cls.classId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-zinc-50 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-zinc-400 text-sm font-medium w-4 shrink-0">
                        {i + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-zinc-800 truncate">{cls.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{cls.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[cls.difficulty] ?? ''}`}>
                        {cls.difficulty}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {cls.score}pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 text-center py-4">
                No classes available yet. Check back later.
              </p>
            )}

            {/* Challenge suggestion */}
            {data.challenge && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3">
                <p className="text-xs font-medium text-purple-600 mb-1">Suggested Challenge</p>
                <p className="text-sm font-medium text-purple-800">{data.challenge.name}</p>
                <p className="text-xs text-purple-400 mt-0.5">
                  {data.challenge.xpReward} XP reward · {data.challenge.target} check-ins
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
