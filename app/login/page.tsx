'use client';

import { useState } from 'react';
import { Brain, Github, Chrome, Sparkles, UserRound } from 'lucide-react';
import Link from 'next/link';
import { signInAsGuest } from '@/app/actions/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = (provider: string) => {
    setLoading(provider);
    window.location.href = `/api/auth/signin/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand shadow-lg shadow-indigo-200 mb-4">
            <Brain className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome to FlashAI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">AI-powered flashcards with Llama 3 70B</p>
        </div>

        {/* Auth card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">Sign in to continue</h2>

          <div className="space-y-3">
            <button
              onClick={() => handleSignIn('google')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </button>

            <button
              onClick={() => handleSignIn('github')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="w-5 h-5 text-gray-800 dark:text-gray-300" />
              {loading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            </div>

            <form action={signInAsGuest}>
              <button
                type="submit"
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-gray-500 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserRound className="w-5 h-5 text-gray-400" />
                Continue as Guest
              </button>
            </form>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                <strong>Powered by Groq & Llama 3 70B</strong> — Generate complete flashcard decks on any topic in seconds.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-indigo-600 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
