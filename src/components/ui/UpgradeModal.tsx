'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  /** Short label of the feature the user tried to access, e.g. "group classes" */
  feature?: string;
  onClose: () => void;
}

/**
 * Shown to NON_MEMBER users when they attempt to access a membership-gated feature.
 * Offers two paths: upgrade plan → /membership, or free gym visit → /book?plan=NONE.
 */
export function UpgradeModal({ feature = 'this feature', onClose }: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">

        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl shrink-0">
            🏆
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-400 hover:text-zinc-600 text-xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Copy */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Membership Required</h2>
          <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
            {`Access to ${feature} is available to Gymora members. Upgrade your plan to unlock classes, personal training, XP rewards, and more.`}
          </p>
        </div>

        {/* Benefit pills */}
        <div className="flex flex-wrap gap-2">
          {['Group classes', 'PT sessions', 'XP & streaks', 'Priority booking'].map((b) => (
            <span key={b} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full">
              ✓ {b}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          <Link href="/membership" onClick={onClose}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
              Upgrade My Plan
            </Button>
          </Link>
          <Link href="/book?plan=NONE" onClick={onClose}>
            <Button variant="outline" className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50">
              Book a Free Gym Visit
            </Button>
          </Link>
        </div>

        {/* Login hint */}
        <div className="border-t pt-3 text-center">
          <p className="text-xs text-zinc-400">
            Already a member with a different account?{' '}
            <Link
              href="/login"
              className="text-orange-500 hover:underline font-medium"
              onClick={onClose}
            >
              Log in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
