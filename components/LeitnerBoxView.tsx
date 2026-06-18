'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Card {
  id: string;
  front: string;
  difficulty: number;
}

interface Props {
  cards: Card[];
}

const BOXES = [
  {
    label: 'Box 1',
    sub: 'Daily',
    ring: 'ring-red-200 dark:ring-red-800',
    bg: 'bg-red-50 dark:bg-red-950',
    badge: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    preview: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    min: 0, max: 0,
  },
  {
    label: 'Box 2',
    sub: 'Every 2 days',
    ring: 'ring-orange-200 dark:ring-orange-800',
    bg: 'bg-orange-50 dark:bg-orange-950',
    badge: 'bg-orange-500',
    text: 'text-orange-700 dark:text-orange-400',
    preview: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    min: 1, max: 1,
  },
  {
    label: 'Box 3',
    sub: 'Weekly',
    ring: 'ring-yellow-200 dark:ring-yellow-800',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    badge: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
    preview: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    min: 2, max: 2,
  },
  {
    label: 'Box 4',
    sub: 'Bi-weekly',
    ring: 'ring-blue-200 dark:ring-blue-800',
    bg: 'bg-blue-50 dark:bg-blue-950',
    badge: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
    preview: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    min: 3, max: 3,
  },
  {
    label: 'Box 5',
    sub: 'Mastered',
    ring: 'ring-green-200 dark:ring-green-800',
    bg: 'bg-green-50 dark:bg-green-950',
    badge: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
    preview: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    min: 4, max: Infinity,
  },
];

export default function LeitnerBoxView({ cards }: Props) {
  const [open, setOpen] = useState(false);

  const boxes = BOXES.map(box => ({
    ...box,
    cards: cards.filter(c => c.difficulty >= box.min && c.difficulty <= box.max),
  }));

  const total = cards.length || 1;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-6 py-4 text-left"
      >
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>📦</span> Leitner Boxes
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Card distribution by mastery level</p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4">
          {/* Progress bar breakdown */}
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            {boxes.map((box, i) => (
              <div
                key={i}
                className={box.badge}
                style={{ width: `${(box.cards.length / total) * 100}%`, minWidth: box.cards.length > 0 ? 4 : 0 }}
                title={`${box.label}: ${box.cards.length} cards`}
              />
            ))}
          </div>

          {/* Box columns */}
          <div className="grid grid-cols-5 gap-2">
            {boxes.map((box, i) => (
              <div
                key={i}
                className={`ring-1 ${box.ring} ${box.bg} rounded-xl p-3 flex flex-col items-center gap-2`}
              >
                <div className="text-center">
                  <div className={`text-xl font-bold ${box.text}`}>{box.cards.length}</div>
                  <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 leading-tight">{box.label}</div>
                  <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{box.sub}</div>
                </div>
                {box.cards.length > 0 && (
                  <div className="w-full space-y-1">
                    {box.cards.slice(0, 2).map(c => (
                      <div
                        key={c.id}
                        className={`text-[9px] truncate rounded px-1.5 py-0.5 ${box.preview}`}
                        title={c.front}
                      >
                        {c.front}
                      </div>
                    ))}
                    {box.cards.length > 2 && (
                      <div className="text-[9px] text-center text-gray-400">+{box.cards.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-600">
            Correct answer → moves card forward · Wrong answer → back to Box 1
          </p>
        </div>
      )}
    </div>
  );
}
