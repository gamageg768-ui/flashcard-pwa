import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

// Spaced repetition algorithm (simplified SM-2)
export function calculateNextReview(difficulty: number, rating: number): { nextReview: Date; newDifficulty: number } {
  const now = new Date();

  // Rating: 1=again, 2=hard, 3=good, 4=easy
  let intervalDays = 1;
  let newDifficulty = difficulty;

  if (rating === 1) {
    // Forgot — reset
    intervalDays = 0.04; // ~1 hour
    newDifficulty = Math.max(0, difficulty - 1);
  } else if (rating === 2) {
    // Hard
    intervalDays = difficulty === 0 ? 1 : Math.max(1, difficulty * 1.5);
    newDifficulty = Math.min(5, difficulty);
  } else if (rating === 3) {
    // Good
    intervalDays = difficulty === 0 ? 1 : difficulty * 2.5;
    newDifficulty = Math.min(5, difficulty + 1);
  } else if (rating === 4) {
    // Easy
    intervalDays = difficulty === 0 ? 3 : difficulty * 4;
    newDifficulty = Math.min(5, difficulty + 2);
  }

  const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return { nextReview, newDifficulty };
}

export const DECK_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
];

export function getDifficultyLabel(d: number): string {
  if (d === 0) return 'New';
  if (d <= 1) return 'Easy';
  if (d <= 3) return 'Medium';
  return 'Hard';
}

export function getDifficultyColor(d: number): string {
  if (d === 0) return 'text-gray-500 bg-gray-100';
  if (d <= 1) return 'text-green-700 bg-green-100';
  if (d <= 3) return 'text-yellow-700 bg-yellow-100';
  return 'text-red-700 bg-red-100';
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

export function parseCSV(text: string): Array<{ front: string; back: string; hint?: string; tags?: string }> {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const fi = headers.indexOf('front');
  const bi = headers.indexOf('back');
  const hi = headers.indexOf('hint');
  const ti = headers.indexOf('tags');

  if (fi === -1 || bi === -1) throw new Error('CSV must have "front" and "back" columns');

  const results: Array<{ front: string; back: string; hint?: string; tags?: string }> = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const front = cols[fi]?.trim();
    const back = cols[bi]?.trim();
    if (!front || !back) continue;
    results.push({
      front,
      back,
      hint: hi >= 0 ? (cols[hi]?.trim() || undefined) : undefined,
      tags: ti >= 0 ? (cols[ti]?.trim() || undefined) : undefined,
    });
  }
  return results;
}
