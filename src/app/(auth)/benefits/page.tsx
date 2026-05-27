import Link from 'next/link';
import { Button } from '@/components/ui/button';

const plans = [
  {
    type: 'NON_MEMBER',
    name: 'Non-Member',
    price: 'Rp 50.000',
    period: 'per visit',
    features: [
      { label: 'Gym floor access', included: true },
      { label: 'Basic equipment use', included: true },
      { label: 'Locker room access', included: true },
      { label: 'Group fitness classes', included: false },
      { label: 'Personal training', included: false },
      { label: 'XP & achievements', included: false },
      { label: 'Streak rewards', included: false },
      { label: 'Priority booking', included: false },
    ],
    cta: 'Book Gym Visit',
    href: '/book?plan=NONE',
    style: 'border-zinc-200',
    ctaStyle: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
  },
  {
    type: 'TRIAL',
    name: 'Trial',
    price: 'Rp 50.000',
    period: 'per visit · 14-day trial',
    features: [
      { label: 'Gym floor access (Rp 50k/visit)', included: true },
      { label: 'Basic equipment use', included: true },
      { label: 'Locker room access', included: true },
      { label: 'Group fitness classes', included: true },
      { label: '2 PT sessions', included: true },
      { label: 'XP & achievements', included: true },
      { label: 'Streak rewards', included: false },
      { label: 'Priority booking', included: false },
    ],
    cta: 'Start Trial',
    href: '/book?plan=TRIAL',
    style: 'border-orange-200',
    ctaStyle: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  {
    type: 'BASIC',
    name: 'Basic',
    price: 'Rp 250.000',
    period: 'per month',
    badge: 'Most Popular',
    features: [
      { label: 'Gym floor access', included: true },
      { label: 'All equipment & facilities', included: true },
      { label: 'Locker & shower access', included: true },
      { label: 'Unlimited group classes', included: true },
      { label: '4 PT sessions/month', included: true },
      { label: 'XP & achievements', included: true },
      { label: 'Streak rewards', included: true },
      { label: 'Priority booking', included: false },
    ],
    cta: 'Choose Basic',
    href: '/book?plan=BASIC',
    style: 'border-orange-500 ring-2 ring-orange-400 ring-offset-1',
    ctaStyle: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  {
    type: 'PREMIUM',
    name: 'Premium',
    price: 'Rp 500.000',
    period: 'per month',
    features: [
      { label: 'Everything in Basic', included: true },
      { label: 'Unlimited PT sessions', included: true },
      { label: 'Priority booking', included: true },
      { label: 'Nutrition consultation', included: true },
      { label: 'Body composition analysis', included: true },
      { label: 'VIP locker access', included: true },
      { label: 'XP & achievements', included: true },
      { label: 'Streak rewards', included: true },
    ],
    cta: 'Choose Premium',
    href: '/book?plan=PREMIUM',
    style: 'border-purple-300',
    ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700',
  },
];

const highlights = [
  {
    icon: '🧘',
    title: 'Group Classes',
    desc: 'Join 15+ weekly sessions — Morning Yoga, HIIT Blast, Power Lifting, Advanced CrossFit, and more. Led by certified instructors.',
  },
  {
    icon: '👟',
    title: 'Personal Training',
    desc: 'Work one-on-one with our expert trainers Alex, Maya, or Jordan. Your workouts are 100% tailored to your goals.',
  },
  {
    icon: '🏆',
    title: 'XP & Level System',
    desc: 'Every check-in earns XP. Level up as you visit more often. Track your rank on the leaderboard against other members.',
  },
  {
    icon: '🔥',
    title: 'Streaks & Rewards',
    desc: 'Maintain daily streaks and unlock exclusive badges, free protein drinks, guest passes, and branded gear.',
  },
  {
    icon: '📅',
    title: 'Online Booking',
    desc: 'Browse upcoming class schedules and book sessions from your phone. No more queuing at the front desk.',
  },
  {
    icon: '📊',
    title: 'Progress Dashboard',
    desc: 'See your complete attendance history, XP earned, badges unlocked, and challenges in your personal dashboard.',
  },
  {
    icon: '📱',
    title: 'QR Entry Card',
    desc: 'No physical card needed. Your QR code is your key. Show it at the entrance and you\'re in.',
  },
  {
    icon: '🎯',
    title: 'Smart Recommendations',
    desc: 'Get personalised class recommendations based on your fitness level, history, and goals.',
  },
];

export default function BenefitsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white/95 backdrop-blur z-40">
        <Link href="/" className="text-xl font-bold text-orange-500">🏋 Gymora</Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
            <Link href="/book">Book Now</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 text-center bg-gradient-to-b from-orange-50 to-white flex flex-col items-center gap-4">
        <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
          Member Benefits
        </span>
        <h1 className="text-4xl font-bold text-zinc-900 max-w-xl">
          Everything you get as a <span className="text-orange-500">Gymora Member</span>
        </h1>
        <p className="text-zinc-500 max-w-lg text-lg">
          More than just a gym. Gymora is a fitness community built around consistency, progress, and rewards.
        </p>
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          <Link href="/book?plan=TRIAL">
            <button className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">
              Start 14-Day Trial
            </button>
          </Link>
          <Link href="/book">
            <button className="border border-zinc-300 text-zinc-700 font-semibold px-6 py-3 rounded-xl hover:bg-zinc-50 transition-colors">
              Just Book a Visit
            </button>
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-6 py-16 flex flex-col items-center gap-10">
        <h2 className="text-2xl font-bold text-zinc-900 text-center">What&apos;s included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">
          {highlights.map((h) => (
            <div key={h.title} className="flex flex-col gap-3 p-5 rounded-xl border bg-white hover:shadow-sm transition-shadow">
              <span className="text-3xl">{h.icon}</span>
              <div>
                <p className="font-semibold text-zinc-900">{h.title}</p>
                <p className="text-sm text-zinc-500 mt-1">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plan comparison */}
      <section className="px-6 py-16 bg-zinc-50 flex flex-col items-center gap-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900">Compare Plans</h2>
          <p className="text-zinc-500 mt-1">Find the right fit for your fitness goals</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">
          {plans.map((plan) => (
            <div key={plan.type} className={`relative flex flex-col rounded-2xl border-2 p-6 gap-4 bg-white ${plan.style}`}>
              {'badge' in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{plan.name}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{plan.price}</p>
                <p className="text-xs text-zinc-400">{plan.period}</p>
              </div>
              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    <span className={f.included ? 'text-green-500' : 'text-zinc-300'}>
                      {f.included ? '✓' : '✗'}
                    </span>
                    <span className={f.included ? 'text-zinc-700' : 'text-zinc-400 line-through'}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors mt-auto ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial / stats */}
      <section className="px-6 py-16 flex flex-col items-center gap-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-3xl text-center">
          {[
            { num: '15+', label: 'Weekly Classes' },
            { num: '3',   label: 'Expert Trainers' },
            { num: '10K', label: 'XP to Level 10' },
            { num: '24h', label: 'QR Validity' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-orange-500">{s.num}</span>
              <span className="text-sm text-zinc-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 bg-orange-500 text-white text-center flex flex-col items-center gap-4">
        <h2 className="text-3xl font-bold">Ready to join?</h2>
        <p className="text-orange-100 max-w-md">Start with a free 14-day trial. No credit card required.</p>
        <Link href="/book?plan=TRIAL">
          <button className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors text-lg">
            Start Free Trial →
          </button>
        </Link>
        <Link href="/login" className="text-orange-200 text-sm hover:text-white underline">
          Already a member? Log in
        </Link>
      </section>

      <footer className="text-center py-6 text-sm text-zinc-400 border-t">
        © 2026 Gymora — Built with NestJS + Next.js
      </footer>
    </div>
  );
}
