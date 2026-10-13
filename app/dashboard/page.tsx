'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Brain, BookOpen, Target, Sparkles, Clock, ChevronRight, Flame } from 'lucide-react';
import Navbar from '@/components/Navbar';
import GuestBanner from '@/components/GuestBanner';
import SearchBar from '@/components/SearchBar';

interface DeckSummary {
  id: string;
  title: string;
  description?: string;
  color: string;
  cardCount: number;
  dueCount: number;
  lastStudied?: string;
}

export default function DashboardPage() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCards: 0, dueToday: 0, streak: 0, mastered: 0 });
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDecks(); }, []);

  async function fetchDecks() {
    try {
      const res = await fetch('/api/decks');
      if (res.ok) {
        const data = await res.json();
        setDecks(data.decks || []);
        setStats(data.stats || stats);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const q = search.toLowerCase();
  const filteredDecks = q
    ? decks.filter(d => d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q))
    : decks;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <GuestBanner />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Decks</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your AI-powered study library</p>
          </div>
          <Link
            href="/deck/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Deck
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} placeholder="Search decks by title or description…" />
        </div>

        {/* Stats row */}
        {!search && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Cards', value: stats.totalCards, icon: BookOpen, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
              { label: 'Due Today', value: stats.dueToday, icon: Clock, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950' },
              { label: 'Day Streak', value: stats.streak, icon: Flame, color: 'text-red-600 bg-red-50 dark:bg-red-950' },
              { label: 'Mastered', value: stats.mastered, icon: Target, color: 'text-green-600 bg-green-50 dark:bg-green-950' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* AI Generate Banner */}
        {!search && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Generate with AI</h3>
                  <p className="text-indigo-200 text-sm">Create a full deck on any topic with GPT-OSS 120B</p>
                </div>
              </div>
              <Link
                href="/deck/new?ai=true"
                className="flex-shrink-0 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors text-sm"
              >
                Generate now →
              </Link>
            </div>
          </div>
        )}

        {/* Decks grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="shimmer h-4 w-3/4 rounded mb-3" />
                <div className="shimmer h-3 w-1/2 rounded mb-6" />
                <div className="shimmer h-8 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            {search ? (
              <>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No decks match "{search}"</h3>
                <p className="text-gray-500 dark:text-gray-400">Try a different search term</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No decks yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                  Create your first AI-powered flashcard deck and start learning smarter
                </p>
                <Link
                  href="/deck/new"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  Create your first deck
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => (
              <Link
                key={deck.id}
                href={`/deck/${deck.id}`}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: deck.color }}
                  >
                    {deck.title.charAt(0).toUpperCase()}
                  </div>
                  {deck.dueCount > 0 && (
                    <span className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {deck.dueCount} due
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{deck.title}</h3>
                {deck.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{deck.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span>{deck.cardCount} cards</span>
                  <span className="flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Study <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
