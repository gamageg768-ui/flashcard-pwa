'use client';
import { useState, useRef } from 'react';
import { X, Upload, Loader2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseCSV } from '@/lib/utils';

interface ImportCSVModalProps {
  deckId: string;
  isOpen: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}

interface ParsedCard {
  front: string;
  back: string;
  hint?: string;
  tags?: string;
}

export default function ImportCSVModal({ deckId, isOpen, onClose, onImported }: ImportCSVModalProps) {
  const [cards, setCards] = useState<ParsedCard[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError('');
    setCards([]);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target?.result as string);
        setCards(parsed);
      } catch (err: any) {
        setParseError(err.message || 'Failed to parse CSV');
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!cards.length) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      onImported(data.count);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setCards([]);
    setParseError('');
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Import Cards from CSV</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Format hint */}
          <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300">
            Expected columns: <code className="font-mono font-semibold">front, back, hint, tags</code> (header row required, hint & tags optional)
          </div>

          {/* File picker */}
          <div>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" id="csv-upload" />
            <label
              htmlFor="csv-upload"
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-8 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-gray-500 dark:text-gray-400"
            >
              {fileName ? (
                <>
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fileName}</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Click to choose a CSV file</span>
                </>
              )}
            </label>
          </div>

          {/* Parse error */}
          {parseError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}

          {/* Preview */}
          {cards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cards.length} cards parsed</span>
                <button onClick={reset} className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Clear</button>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium w-1/2">Front</th>
                      <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium w-1/2">Back</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cards.slice(0, 5).map((c, i) => (
                      <tr key={i} className="bg-white dark:bg-gray-900">
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{c.front}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{c.back}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {cards.length > 5 && (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 text-center">
                    …and {cards.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm transition-colors">
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!cards.length || importing}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? 'Importing...' : `Import ${cards.length || ''} Cards`}
          </button>
        </div>
      </div>
    </div>
  );
}
