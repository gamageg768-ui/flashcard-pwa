'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Pencil, Save, Trash2, Sparkles, BookOpen,
  Loader2, X, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { formatDate } from '@/lib/utils';

interface NoteData {
  id: string;
  title: string;
  content: string;
  summary?: string;
  deckId?: string;
  deck?: { id: string; title: string; color: string };
  createdAt: string;
  updatedAt: string;
}

interface GeneratedCard {
  front: string;
  back: string;
  hint?: string;
  tags?: string;
}

export default function NoteDetailPage() {
  const { noteId } = useParams();
  const router = useRouter();

  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [summarising, setSummarising] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedCards, setExtractedCards] = useState<GeneratedCard[]>([]);
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [deckCreated, setDeckCreated] = useState(false);

  useEffect(() => { fetchNote(); }, [noteId]);

  async function fetchNote() {
    try {
      const res = await fetch(`/api/notes/${noteId}`);
      if (res.ok) {
        const data = await res.json();
        setNote(data.note);
        setEditTitle(data.note.title);
        setEditContent(data.note.content);
      } else {
        router.push('/notes');
      }
    } catch { router.push('/notes'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!note) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setNote(data.note);
        setEditing(false);
      }
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!note || !confirm('Delete this note?')) return;
    setDeleting(true);
    await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
    router.push('/notes');
  }

  async function handleSummarise() {
    if (!note) return;
    setSummarising(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summarise' }),
      });
      const data = await res.json();
      if (res.ok) setNote(prev => prev ? { ...prev, summary: data.summary } : prev);
    } finally { setSummarising(false); }
  }

  async function handleExtract() {
    if (!note) return;
    setExtracting(true);
    setExtractedCards([]);
    try {
      const res = await fetch(`/api/notes/${note.id}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract-cards' }),
      });
      const data = await res.json();
      if (res.ok && data.cards?.length) {
        setExtractedCards(data.cards);
        setShowExtractModal(true);
        setDeckCreated(false);
      }
    } finally { setExtracting(false); }
  }

  async function handleCreateDeck() {
    if (!note || !extractedCards.length) return;
    setCreatingDeck(true);
    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${note.title} — Flashcards`,
          cards: extractedCards,
          color: '#6366f1',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeckCreated(true);
        setTimeout(() => router.push(`/deck/${data.deck.id}`), 800);
      }
    } finally { setCreatingDeck(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  if (!note) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/notes" className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium mb-6 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          Notes
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            {editing ? (
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="flex-1 text-xl font-bold bg-transparent border-b-2 border-indigo-500 text-gray-900 dark:text-gray-100 focus:outline-none pb-1"
                autoFocus
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex-1">{note.title}</h1>
            )}

            <div className="flex items-center gap-2 flex-shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={() => { setEditing(false); setEditTitle(note.title); setEditContent(note.content); }}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 flex items-center justify-center text-gray-400"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>

          {note.deck && (
            <Link href={`/deck/${note.deck.id}`} className="inline-flex items-center gap-1.5 mb-4 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: note.deck.color }} />
              {note.deck.title}
            </Link>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500">Updated {formatDate(note.updatedAt)}</p>
        </div>

        {/* AI actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSummarise}
            disabled={summarising}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {summarising ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {summarising ? 'Summarising...' : note.summary ? 'Re-summarise' : 'Summarise with AI'}
          </button>
          <button
            onClick={handleExtract}
            disabled={extracting}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            {extracting ? 'Extracting...' : 'Extract Flashcards'}
          </button>
        </div>

        {/* AI Summary */}
        {note.summary && (
          <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">AI Summary</span>
            </div>
            <p className="text-sm text-indigo-800 dark:text-indigo-200 whitespace-pre-line leading-relaxed">{note.summary}</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Content</h2>
          {editing ? (
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={16}
              className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono resize-none"
            />
          ) : (
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{note.content}</pre>
          )}
        </div>
      </main>

      {/* Extract Flashcards Modal */}
      {showExtractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowExtractModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Extracted Flashcards</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{extractedCards.length} cards found in your notes</p>
              </div>
              <button onClick={() => setShowExtractModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800">
              {extractedCards.map((card, i) => (
                <div key={i} className="px-6 py-4">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                  >
                    <span className="text-xs text-gray-400 font-medium w-5">#{i + 1}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 line-clamp-1">{card.front}</p>
                    {expandedCard === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                  {expandedCard === i && (
                    <div className="mt-2 ml-7">
                      <p className="text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 rounded-lg px-3 py-2">{card.back}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleCreateDeck}
                disabled={creatingDeck || deckCreated}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-semibold text-sm transition-colors"
              >
                {deckCreated ? (
                  <><Check className="w-4 h-4" /> Deck created! Redirecting…</>
                ) : creatingDeck ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating deck…</>
                ) : (
                  <><BookOpen className="w-4 h-4" /> Create Deck from These Cards</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
