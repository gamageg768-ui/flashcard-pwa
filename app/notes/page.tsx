'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, BookOpen, Clock, Brain } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { formatDate } from '@/lib/utils';

interface NoteItem {
  id: string;
  title: string;
  summary?: string;
  content: string;
  deckId?: string;
  deck?: { title: string; color: string };
  updatedAt: string;
}

type Filter = 'all' | 'standalone' | 'linked';

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { fetchNotes(); }, []);

  async function fetchNotes() {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = notes.filter(n => {
    if (filter === 'standalone') return !n.deckId;
    if (filter === 'linked') return !!n.deckId;
    return true;
  });

  const preview = (n: NoteItem) => (n.summary || n.content).slice(0, 120) + ((n.summary || n.content).length > 120 ? '…' : '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Notes</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Capture ideas, summarise with AI, extract flashcards</p>
          </div>
          <Link
            href="/notes/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 mb-6 w-fit shadow-sm">
          {(['all', 'standalone', 'linked'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="shimmer h-4 w-3/4 rounded mb-3" />
                <div className="shimmer h-3 w-full rounded mb-2" />
                <div className="shimmer h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {filter === 'all' ? 'No notes yet' : `No ${filter} notes`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              Write notes, get AI summaries, and extract flashcards from your notes automatically
            </p>
            <Link
              href="/notes/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            >
              <Plus className="w-4 h-4" />
              Create your first note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(note => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{note.title}</h3>
                    {note.deck && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: note.deck.color }} />
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{note.deck.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                  {preview(note)}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(note.updatedAt)}
                  </span>
                  {note.summary && (
                    <span className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
                      Summarised
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
