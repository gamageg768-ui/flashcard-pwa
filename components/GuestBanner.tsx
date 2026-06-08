'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function GuestBanner() {
  const { data: session } = useSession();
  if (!session?.user?.isGuest) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4">
      <p className="text-sm text-amber-800 dark:text-amber-300">
        <strong>You're browsing as a guest.</strong> Your decks are saved temporarily — sign in to keep them forever.
      </p>
      <Link
        href="/login"
        className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-amber-900 dark:text-amber-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Sign in
      </Link>
    </div>
  );
}
