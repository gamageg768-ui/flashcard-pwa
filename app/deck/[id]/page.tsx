'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play, Plus, Trash2, ChevronLeft, Clock,
  BookOpen, Target, Sparkles, Loader2, FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ImportCSVModal from '@/components/ImportCSVModal';
import ExportButton from '@/components/ExportButton';
import { getDifficultyLabel, getDifficultyColor } from '@/lib/utils';

interface Card {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  reviewCount: number;
  nextReview: string;
}

interface NoteItem {
  id: string;
  title: string;
  summary?: string;
  updatedAt: string;
}

interface Deck {
  id: string;
  title: string;
  description?: string;
  color: string;
  topic?: string;
  cards: Card[];
  _count: { cards: number };
}

export default function DeckDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => { fetchDeck(); }, [id]);

  async function fetchDeck() {
    try {
      const [deckRes, notesRes] = await Promise.all([
        fetch(`/api/decks/${id}`),
        fetch(`/api/notes?deckId=${id}`),
      ]);
      if (deckRes.ok) setDeck(await deckRes.json());
      else router.push('/dashboard');
      if (notesRes.ok) {
        const nd = await notesRes.json();
        setNotes(nd.notes || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function deleteDeck() {
    if (!confirm('Delete this deck and all its cards?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/decks/${id}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (e) { console.error(e); setDeleting(false); }
  }

  const dueCards = deck?.cards.filter(c => new Date(c.nextReview) <= new Date()).length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!deck) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Link href="/dashboard" className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium mb-6 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          My Decks
        </Link>

        {/* Deck header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
                style={{ backgroundColor: deck.color }}
              >
                {deck.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{deck.title}</h1>
                {deck.description && <p className="text-gray-500 dark:text-gray-400 mt-1">{deck.description}</p>}
                {deck.topic && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                    <Sparkles className="w-3 h-3" />
                    {deck.topic}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={deleteDeck}
              disabled={deleting}
              className="w-9 h-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 text-gray-400 flex items-center justify-center transition-colors"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{deck.cards.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{dueCards}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Due Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {deck.cards.filter(c => c.difficulty >= 3).length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Mastered</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Link
              href={`/deck/${id}/study`}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            >
              <Play className="w-4 h-4" />
              Study {dueCards > 0 ? `(${dueCards} due)` : 'All'}
            </Link>
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Import CSV
            </button>
            <ExportButton deckId={id as string} deckTitle={deck.title} />
          </div>
        </div>

        {/* Notes panel */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Notes ({notes.length})
            </h2>
            <Link
              href={`/notes/new?deckId=${id}`}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Note
            </Link>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">
              <p className="text-sm">No notes yet</p>
              <Link href={`/notes/new?deckId=${id}`} className="text-xs text-indigo-500 hover:underline mt-1 block">Add your first note →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {notes.map(note => (
                <Link key={note.id} href={`/notes/${note.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{note.title}</span>
                  {note.summary && <span className="text-xs bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full ml-3 flex-shrink-0">AI Summary</span>}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Cards list */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Cards ({deck.cards.length})</h2>
          </div>

          {deck.cards.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No cards yet — import a CSV or use AI to generate</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {deck.cards.map((card, i) => (
                <div key={card.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div
                    className="flex items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xs text-gray-400 font-medium flex-shrink-0 mt-0.5">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{card.front}</p>
                        {expandedCard === card.id && (
                          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg px-3 py-2">{card.back}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getDifficultyColor(card.difficulty)}`}>
                      {getDifficultyLabel(card.difficulty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ImportCSVModal
        deckId={id as string}
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(count) => { fetchDeck(); setImportOpen(false); }}
      />
    </div>
  );
}
