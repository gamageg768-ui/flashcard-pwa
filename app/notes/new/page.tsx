'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface DeckOption {
  id: string;
  title: string;
  color: string;
}

function NewNotePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillDeckId = searchParams.get('deckId') || '';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deckId, setDeckId] = useState(prefillDeckId);
  const [decks, setDecks] = useState<DeckOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/decks').then(r => r.json()).then(d => setDecks(d.decks || [])).catch(() => {});
  }, []);

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), deckId: deckId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/notes/${data.note.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/notes" className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium mb-6 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          Notes
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">New Note</h1>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Deck link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link to deck (optional)</label>
            <select
              value={deckId}
              onChange={e => setDeckId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">— None (standalone note) —</option>
              {decks.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your notes here... You can use AI to summarise them or extract flashcards later."
              rows={14}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function NewNotePage() {
  return (
    <Suspense>
      <NewNotePageInner />
    </Suspense>
  );
}
