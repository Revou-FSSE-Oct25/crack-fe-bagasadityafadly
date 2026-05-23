import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-xl font-bold text-orange-500">GYMORA</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24 gap-8">
        <div className="flex flex-col items-center gap-4 max-w-2xl">
          <span className="text-sm font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Your Smart Gym Companion
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Train smarter.<br />Level up daily.
          </h1>
          <p className="text-xl text-zinc-500 max-w-lg">
            Book classes, track your XP, maintain streaks, and get personalized recommendations — all in one place.
          </p>
          <div className="flex gap-4 mt-4">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
              <Link href="/register">Start for Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">I have an account</Link>
            </Button>
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl w-full text-left">
          {[
            { icon: '⭐', title: 'XP & Levels', desc: 'Earn XP every check-in. Level up as you stay consistent.' },
            { icon: '🔥', title: 'Streak Tracking', desc: 'Keep your daily streak alive and unlock milestone rewards.' },
            { icon: '🎯', title: 'Smart Recommendations', desc: 'Get class recommendations tailored to your goal and level.' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-2 p-5 rounded-xl border bg-zinc-50">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="font-semibold text-zinc-900">{f.title}</h3>
              <p className="text-sm text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-zinc-400 border-t">
        Gymora — Built with NestJS + Next.js
      </footer>
    </div>
  );
}
