'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Plus, Wand2, BookOpen, Loader2, ChevronDown, ChevronUp, X, Check, Upload, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { DECK_COLORS, parseCSV } from '@/lib/utils';

interface GeneratedCard {
  front: string;
  back: string;
  hint?: string;
  tags?: string;
}

type Mode = 'ai' | 'manual' | 'csv';

export default function NewDeckPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAIMode = searchParams.get('ai') === 'true';

  const [mode, setMode] = useState<Mode>(isAIMode ? 'ai' : 'ai');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DECK_COLORS[0]);
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [cardStyle, setCardStyle] = useState<'qa' | 'definition' | 'fill-blank' | 'concept'>('qa');
  const [generating, setGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [csvFileName, setCSVFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (!topic.trim()) { setError('Please enter a topic'); return; }
    setError('');
    setGenerating(true);
    setGeneratedCards([]);
    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count: cardCount, difficulty, style: cardStyle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGeneratedCards(data.cards);
      if (!title) setTitle(`${topic} — ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`);
    } catch (e: any) {
      setError(e.message || 'Failed to generate cards');
    } finally {
      setGenerating(false);
    }
  }

  function handleCSVFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCSVFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target?.result as string);
        setGeneratedCards(parsed);
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV');
        setGeneratedCards([]);
      }
    };
    reader.readAsText(file);
  }

  async function handleSave() {
    if (!title.trim()) { setError('Please enter a deck title'); return; }
    if (generatedCards.length === 0 && mode !== 'manual') { setError('Add some cards first'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, color, topic, cards: generatedCards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(`/deck/${data.deck.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to save deck');
    } finally {
      setSaving(false);
    }
  }

  function removeCard(index: number) {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Deck</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">AI generate, import CSV, or create manually</p>
        </div>

        {/* Mode toggle */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-1 flex mb-6 shadow-sm">
          {([
            { key: 'ai', label: 'AI Generate', icon: Sparkles },
            { key: 'csv', label: 'Import CSV', icon: Upload },
            { key: 'manual', label: 'Manual', icon: Plus },
          ] as { key: Mode; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setGeneratedCards([]); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                mode === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Deck info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Deck Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deck Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Spanish Vocabulary, React Hooks, World History..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of what you'll learn"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deck Color</label>
              <div className="flex gap-2 flex-wrap">
                {DECK_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Generation panel */}
        {mode === 'ai' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">AI Generation</h2>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">Llama 3 70B</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, JavaScript promises, World War II causes..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Cards', value: cardCount, onChange: (v: any) => setCardCount(Number(v)), options: [5,10,15,20,25,30,50].map(n => ({ value: n, label: `${n} cards` })) },
                  { label: 'Difficulty', value: difficulty, onChange: (v: any) => setDifficulty(v), options: [{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }] },
                  { label: 'Style', value: cardStyle, onChange: (v: any) => setCardStyle(v), options: [{ value: 'qa', label: 'Q&A' }, { value: 'definition', label: 'Definition' }, { value: 'fill-blank', label: 'Fill Blank' }, { value: 'concept', label: 'Concept' }] },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                    <select
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      {options.map(o => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !topic.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating with Llama 3 70B...</> : <><Wand2 className="w-4 h-4" />Generate {cardCount} Flashcards</>}
              </button>
            </div>
          </div>
        )}

        {/* CSV Import panel */}
        {mode === 'csv' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Import from CSV</h2>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300 mb-4">
              Required columns: <code className="font-mono font-semibold">front, back</code> — optional: <code className="font-mono">hint, tags</code>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSVFile} className="hidden" id="new-deck-csv" />
            <label
              htmlFor="new-deck-csv"
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-10 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-gray-500 dark:text-gray-400"
            >
              {csvFileName ? (
                <><FileText className="w-5 h-5 text-indigo-500" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">{csvFileName}</span></>
              ) : (
                <><Upload className="w-5 h-5" /><span className="text-sm">Click to choose a CSV file</span></>
              )}
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Cards preview */}
        {generatedCards.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">{generatedCards.length} cards ready</span>
              </div>
              {mode === 'ai' && (
                <button onClick={handleGenerate} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />Regenerate
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
              {generatedCards.map((card, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpandedCard(expandedCard === i ? null : i)}>
                        <span className="text-xs font-medium text-gray-400 flex-shrink-0">#{i + 1}</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{card.front}</p>
                        {expandedCard === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      </div>
                      {expandedCard === i && (
                        <div className="mt-2 pl-6">
                          <p className="text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 rounded-lg px-3 py-2">{card.back}</p>
                          {card.hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">💡 {card.hint}</p>}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeCard(i)}
                      className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 text-gray-300 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || (mode !== 'manual' && generatedCards.length === 0)}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-base shadow-sm"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving deck...</> : <><BookOpen className="w-4 h-4" />Save Deck {generatedCards.length > 0 ? `(${generatedCards.length} cards)` : ''}</>}
        </button>
      </main>
    </div>
  );
}
