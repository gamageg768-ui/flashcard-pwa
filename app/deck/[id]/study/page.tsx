'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  RotateCcw, ChevronLeft, MessageCircle, Lightbulb,
  ThumbsDown, Minus, ThumbsUp, Zap, Loader2, X, Send
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import PomodoroTimer from '@/components/PomodoroTimer';

interface Card {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionStart] = useState(Date.now());
  const [reviewed, setReviewed] = useState(0);
  const [deckTitle, setDeckTitle] = useState('');
  const [finished, setFinished] = useState(false);

  useEffect(() => { fetchCards(); }, [id]);

  async function fetchCards() {
    try {
      const res = await fetch(`/api/decks/${id}/cards`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
        setDeckTitle(data.deckTitle || 'Study');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  function flipCard() {
    setFlipped(f => !f);
    setShowHint(false);
    setShowExplanation(false);
  }

  async function handleRating(rating: 1 | 2 | 3 | 4) {
    if (!currentCard) return;
    try {
      await fetch(`/api/cards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
    } catch (e) { console.error(e); }

    setReviewed(r => r + 1);
    if (currentIndex + 1 >= cards.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
      setShowHint(false);
      setShowExplanation(false);
      setHintText('');
      setExplanation('');
    }
  }

  async function getHint() {
    if (!currentCard || hintText) { setShowHint(true); return; }
    setHintLoading(true);
    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hint', front: currentCard.front, back: currentCard.back }),
      });
      const data = await res.json();
      setHintText(data.hint || currentCard.hint || 'Think about the key concepts...');
      setShowHint(true);
    } catch {
      setHintText(currentCard.hint || 'Think about the key concepts...');
      setShowHint(true);
    } finally { setHintLoading(false); }
  }

  async function getExplanation() {
    if (!currentCard) return;
    if (!flipped) { flipCard(); return; }
    if (explanation) { setShowExplanation(true); return; }
    setExplanationLoading(true);
    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'explain', front: currentCard.front, back: currentCard.back }),
      });
      const data = await res.json();
      setExplanation(data.explanation || '');
      setShowExplanation(true);
    } catch (e) { console.error(e); }
    finally { setExplanationLoading(false); }
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(m => [...m, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', messages: [...chatMessages, userMsg], context: deckTitle }),
      });
      const data = await res.json();
      setChatMessages(m => [...m, { role: 'assistant', content: data.response }]);
    } catch {
      setChatMessages(m => [...m, { role: 'assistant', content: 'Sorry, I could not respond right now.' }]);
    } finally { setChatLoading(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  if (finished) {
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Session Complete!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">You reviewed {reviewed} cards</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-4">
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{reviewed}</div>
              <div className="text-xs text-indigo-600 dark:text-indigo-500 mt-1">Cards Reviewed</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{Math.floor(duration / 60)}m {duration % 60}s</div>
              <div className="text-xs text-green-600 dark:text-green-500 mt-1">Time Spent</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setFinished(false); setCurrentIndex(0); setFlipped(false); setReviewed(0); }}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Study Again
            </button>
            <button
              onClick={() => router.push(`/deck/${id}`)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium transition-colors"
            >
              Back to Deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400">No cards to study</p>
        <button onClick={() => router.push(`/deck/${id}`)} className="mt-4 text-indigo-600 font-medium">
          ← Back to deck
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push(`/deck/${id}`)}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {deckTitle}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Pomodoro timer */}
        <div className="flex justify-center mb-4">
          <PomodoroTimer />
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-8">
          <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Flashcard */}
        <div className="card-flip w-full" style={{ height: 320 }} onClick={flipCard}>
          <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
            <div className="card-front bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
              <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-4 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
                Question
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center leading-relaxed">{currentCard.front}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">Tap to reveal answer</p>
            </div>
            <div className="card-back bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 cursor-pointer">
              <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-4 bg-white/20 px-3 py-1 rounded-full">
                Answer
              </div>
              <p className="text-xl font-semibold text-white text-center leading-relaxed">{currentCard.back}</p>
            </div>
          </div>
        </div>

        {/* Hint */}
        {!flipped && (
          <div className="mt-4">
            {showHint && hintText ? (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
                💡 {hintText}
              </div>
            ) : (
              <button
                onClick={getHint}
                disabled={hintLoading}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-600 transition-colors mx-auto"
              >
                {hintLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />}
                {hintLoading ? 'Getting hint...' : 'Show hint'}
              </button>
            )}
          </div>
        )}

        {/* Explanation */}
        {flipped && (
          <div className="mt-4">
            {showExplanation && explanation ? (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                🧠 {explanation}
              </div>
            ) : (
              <button
                onClick={getExplanation}
                disabled={explanationLoading}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors mx-auto"
              >
                {explanationLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {explanationLoading ? 'Getting explanation...' : 'AI Explain'}
              </button>
            )}
          </div>
        )}

        {/* Rating buttons */}
        {flipped && (
          <div className="mt-6">
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-3 font-medium">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { rating: 1, label: 'Again', color: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900', icon: RotateCcw },
                { rating: 2, label: 'Hard', color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900', icon: ThumbsDown },
                { rating: 3, label: 'Good', color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900', icon: Minus },
                { rating: 4, label: 'Easy', color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900', icon: ThumbsUp },
              ].map(({ rating, label, color, icon: Icon }) => (
                <button
                  key={rating}
                  onClick={() => handleRating(rating as any)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border font-semibold text-sm transition-all hover:scale-105 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </main>

      {/* Chat drawer */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setShowChat(false)} />
          <div className="w-full max-w-md bg-white dark:bg-gray-900 flex flex-col h-full shadow-2xl border-l border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Tutor</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Llama 3 70B via Groq</p>
              </div>
              <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about {deckTitle}</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Ask about this topic..."
                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 bg-white dark:bg-gray-800"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
