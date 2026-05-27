'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { Membership } from '@/types';
import { cn } from '@/lib/utils';

interface Plan {
  type: 'TRIAL' | 'BASIC' | 'PREMIUM';
  name: string;
  price: string;
  duration: string;
  features: string[];
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    type: 'TRIAL',
    name: 'Trial',
    price: 'Free',
    duration: '14 days',
    features: [
      'Access to all group classes',
      '2 PT sessions',
      'Gym floor access',
      'Locker room access',
    ],
  },
  {
    type: 'BASIC',
    name: 'Basic',
    price: 'Rp 250.000',
    duration: 'per month',
    highlight: true,
    features: [
      'Unlimited gym floor access',
      'All group fitness classes',
      '4 PT sessions per month',
      'Locker & shower access',
      'XP & achievement system',
    ],
  },
  {
    type: 'PREMIUM',
    name: 'Premium',
    price: 'Rp 500.000',
    duration: 'per month',
    features: [
      'Everything in Basic',
      'Unlimited PT sessions',
      'Priority class booking',
      'Nutrition consultation',
      'Body composition analysis',
      'VIP locker access',
    ],
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function MembershipPage() {
  const user = useAuthStore((s) => s.user);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);

  useEffect(() => {
    apiFetch<{ memberships?: Membership[] }>('/users/me')
      .then((profile) => {
        const active = profile.memberships?.[0] ?? null;
        setMembership(active);
      })
      .catch(() => {})
      .finally(() => setLoadingMembership(false));
  }, []);

  const isNonMember = user?.role === 'NON_MEMBER';

  return (
    <div className="flex flex-col flex-1">
      <Topbar />

      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Current status */}
        {!loadingMembership && (
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle>Membership Status</CardTitle>
            </CardHeader>
            <CardContent>
              {membership ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xl">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {membership.type} Membership — Active
                      </p>
                      <p className="text-sm text-zinc-500">
                        Valid until {formatDate(membership.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                    You have full access to all classes, PT sessions, and gym facilities.
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                      <span className="text-xl">🔓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">No Active Membership</p>
                      <p className="text-sm text-zinc-500">
                        You currently have free gym floor access only.
                      </p>
                    </div>
                  </div>
                  {isNonMember && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
                      Upgrade to unlock group fitness classes, personal training, and more.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Membership plans */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Membership Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.type}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6 gap-4',
                  plan.highlight
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-zinc-200 bg-white'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">{plan.name}</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{plan.price}</p>
                  <p className="text-xs text-zinc-400">{plan.duration}</p>
                </div>

                <ul className="flex flex-col gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                      <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {membership?.type === plan.type ? (
                    <div className="text-center text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg py-2">
                      Current Plan
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className={cn(
                        'text-center text-sm font-medium rounded-lg py-2 border',
                        plan.highlight
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-zinc-700 border-zinc-200'
                      )}>
                        Contact Reception
                      </p>
                      <p className="text-xs text-zinc-400 text-center">
                        Visit the front desk or speak to an admin to sign up for this plan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What you get banner */}
        {isNonMember && (
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-4xl shrink-0">🏋</div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold">Ready to unlock full access?</h3>
                  <p className="text-sm text-orange-100 mt-1">
                    Start with a free 14-day trial and experience all Gymora has to offer.
                    Speak to our team at the front desk to get started today.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits grid */}
        <Card>
          <CardHeader>
            <CardTitle>Member Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '🧘', title: 'Group Classes', desc: 'Yoga, HIIT, Strength — 15+ classes per week with certified instructors.' },
                { icon: '👟', title: 'Personal Training', desc: 'One-on-one sessions tailored to your goals with expert trainers.' },
                { icon: '🏆', title: 'XP & Achievements', desc: 'Earn points for every visit, unlock badges, and climb the leaderboard.' },
                { icon: '📅', title: 'Easy Booking', desc: 'Book classes and PT sessions online — no waiting in line.' },
                { icon: '🔥', title: 'Streak Rewards', desc: 'Stay consistent and unlock exclusive rewards for long streaks.' },
                { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your XP, attendance, and achievements over time.' },
              ].map((b) => (
                <div key={b.title} className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-2xl shrink-0">{b.icon}</span>
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{b.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
