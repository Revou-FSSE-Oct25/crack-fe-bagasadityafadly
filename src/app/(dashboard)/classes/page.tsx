'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { GymClass } from '@/types';

const difficultyColor: Record<string, string> = {
  BEGINNER:     'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED:     'bg-red-100 text-red-700',
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<GymClass[]>('/classes')
      .then(setClasses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <Topbar />
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Browse Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-zinc-400 py-8 text-center">
                No classes available yet. Check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex flex-col gap-3 p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-zinc-900">{cls.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[cls.difficulty] ?? ''}`}>
                        {cls.difficulty}
                      </span>
                    </div>
                    {cls.description && (
                      <p className="text-sm text-zinc-500">{cls.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>⏱ {cls.durationMinutes} min</span>
                      <span>👥 {cls.capacity} spots</span>
                      {cls.caloriesEstimate && <span>🔥 ~{cls.caloriesEstimate} cal</span>}
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
