import Link from 'next/link';
import { Button } from '@/components/ui/button';

const plans = [
  {
    type: 'NONE',
    name: 'Non-Member',
    price: 'Rp 50.000',
    period: '/visit',
    color: 'border-zinc-200',
    badge: '',
    features: ['Gym floor access', 'Locker room access', 'Basic equipment use', 'Pay per visit'],
    cta: 'Book a Visit',
    href: '/book?plan=NONE',
    ctaStyle: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
  },
  {
    type: 'TRIAL',
    name: 'Trial',
    price: 'Rp 50.000',
    period: '/visit · 14-day trial',
    color: 'border-orange-200',
    badge: 'Try First',
    features: ['All gym equipment', 'Group fitness classes', '2 PT sessions', 'XP & achievements', 'Gym visit: Rp 50k/visit'],
    cta: 'Start Trial',
    href: '/book?plan=TRIAL',
    ctaStyle: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  },
  {
    type: 'BASIC',
    name: 'Basic',
    price: 'Rp 250.000',
    period: '/month',
    color: 'border-orange-500 ring-2 ring-orange-500 ring-offset-2',
    badge: 'Most Popular',
    features: ['Unlimited gym access included', 'All group classes', '4 PT sessions/month', 'Priority booking', 'Streak rewards'],
    cta: 'Choose Basic',
    href: '/book?plan=BASIC',
    ctaStyle: 'bg-orange-500 text-white hover:bg-orange-600',
  },
  {
    type: 'PREMIUM',
    name: 'Premium',
    price: 'Rp 500.000',
    period: '/month',
    color: 'border-purple-300',
    badge: 'Best Value',
    features: ['Everything in Basic', 'Unlimited PT sessions', 'Nutrition consultation', 'Body composition analysis', 'VIP locker'],
    cta: 'Choose Premium',
    href: '/book?plan=PREMIUM',
    ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700',
  },
];

const benefits = [
  { icon: '🧘', title: 'Group Classes', desc: '15+ weekly sessions — Yoga, HIIT, Strength & more.' },
  { icon: '👟', title: 'Personal Training', desc: 'Work 1-on-1 with certified trainers tailored to your goals.' },
  { icon: '🏆', title: 'XP & Achievements', desc: 'Earn points every visit. Unlock badges. Climb the leaderboard.' },
  { icon: '📅', title: 'Easy Online Booking', desc: 'Book classes and gym visits from anywhere, any time.' },
  { icon: '🔥', title: 'Streak Rewards', desc: 'Keep your streak alive and earn exclusive gym rewards.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Monitor attendance, XP history, and achievements over time.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white/95 backdrop-blur z-40">
        <span className="text-xl font-bold text-orange-500">🏋 Gymora</span>
        <div className="flex items-center gap-3">
          <Link href="/benefits" className="text-sm text-zinc-600 hover:text-zinc-900 hidden sm:block">
            Member Benefits
          </Link>
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
            <Link href="/book">Book Now</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 gap-6 bg-gradient-to-b from-orange-50 to-white">
        <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
          Jakarta's Smartest Gym
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight max-w-2xl">
          Your fitness journey<br className="hidden sm:block" /> starts <span className="text-orange-500">today</span>.
        </h1>
        <p className="text-lg text-zinc-500 max-w-lg">
          Book a gym visit in minutes — no membership required. Or upgrade to unlock classes, personal training, and exclusive rewards.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
            <Link href="/book">Book a Gym Visit</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/benefits">View Member Benefits</Link>
          </Button>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="px-6 py-16 flex flex-col items-center gap-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-900">Choose Your Plan</h2>
          <p className="text-zinc-500 mt-2">Start free, upgrade when you're ready. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className={`relative flex flex-col rounded-2xl border-2 p-6 gap-4 bg-white ${plan.color}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{plan.name}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{plan.price}</p>
                {plan.period && <p className="text-xs text-zinc-400">{plan.period}</p>}
              </div>
              <ul className="flex flex-col gap-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                    <span className="text-green-500 shrink-0 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits preview */}
      <section className="px-6 py-16 bg-zinc-50 flex flex-col items-center gap-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-900">Why become a member?</h2>
          <p className="text-zinc-500 mt-2">Everything you need to stay consistent and motivated.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-4xl">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-start gap-4 p-5 rounded-xl bg-white border">
              <span className="text-3xl shrink-0">{b.icon}</span>
              <div>
                <p className="font-semibold text-zinc-900">{b.title}</p>
                <p className="text-sm text-zinc-500 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/benefits">
          <Button variant="outline" size="lg">See All Benefits →</Button>
        </Link>
      </section>

      {/* CTA banner */}
      <section className="px-6 py-16 flex flex-col items-center gap-6 bg-orange-500 text-white text-center">
        <h2 className="text-3xl font-bold">Ready to start?</h2>
        <p className="text-orange-100 max-w-md">
          No sign-up hassle. Pick a time, book your visit, and walk in with your QR code.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/book?plan=NONE">
            <button className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Free Gym Visit
            </button>
          </Link>
          <Link href="/book?plan=TRIAL">
            <button className="border-2 border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors">
              Start Free Trial
            </button>
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-zinc-400 border-t flex items-center justify-center gap-4 flex-wrap px-6">
        <span>© 2026 Gymora</span>
        <Link href="/benefits" className="hover:text-zinc-600">Member Benefits</Link>
        <Link href="/login" className="hover:text-zinc-600">Login</Link>
        <Link href="/register" className="hover:text-zinc-600">Register</Link>
      </footer>
    </div>
  );
}
