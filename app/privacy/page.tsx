import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

export const metadata = { title: 'Privacy Policy — FlashAI' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/login" className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium mb-8 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: October 2026</p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">1. Information We Collect</h2>
            <p>We collect your email address and name when you sign in via Google or GitHub OAuth. Guest users are assigned an anonymous identifier. We store the flashcard decks, cards, and study progress you create.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">2. How We Use Your Information</h2>
            <p>Your data is used solely to provide and improve the FlashAI service — displaying your decks, tracking study progress, and personalising your experience. We do not sell or share your personal information with third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">3. AI Queries</h2>
            <p>Flashcard generation requests are sent to the Groq API (groq.com). Please review Groq&apos;s privacy policy for details on how they handle API requests. We do not store your AI query content beyond your generated flashcards.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">4. Cookies &amp; Storage</h2>
            <p>We use a session cookie for authentication and <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">localStorage</code> for your theme preference. No advertising or tracking cookies are used.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">5. Data Retention &amp; Deletion</h2>
            <p>Your data is retained for as long as your account is active. To delete your account and all associated data, contact us via GitHub.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">6. Contact</h2>
            <p>Questions about this policy can be directed to the project repository on GitHub.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
