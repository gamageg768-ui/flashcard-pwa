'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

type Phase = 'work' | 'break' | 'longBreak';

const DURATIONS: Record<Phase, number> = {
  work: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
};

export default function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [pomodorosDone, setPomodorosDone] = useState(0);

  // Refs so the interval closure always reads latest values without re-creating
  const phaseRef = useRef<Phase>('work');
  const secondsRef = useRef(DURATIONS.work);
  const pomodorosRef = useRef(0);
  phaseRef.current = phase;
  secondsRef.current = secondsLeft;
  pomodorosRef.current = pomodorosDone;

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const next = secondsRef.current - 1;
      if (next > 0) {
        secondsRef.current = next;
        setSecondsLeft(next);
        return;
      }

      // Phase complete
      clearInterval(id);
      const currentPhase = phaseRef.current;
      let nextPhase: Phase;
      let nextDone = pomodorosRef.current;

      if (currentPhase === 'work') {
        nextDone += 1;
        nextPhase = nextDone % 4 === 0 ? 'longBreak' : 'break';
      } else {
        nextPhase = 'work';
      }

      phaseRef.current = nextPhase;
      secondsRef.current = DURATIONS[nextPhase];
      pomodorosRef.current = nextDone;

      setPhase(nextPhase);
      setSecondsLeft(DURATIONS[nextPhase]);
      setPomodorosDone(nextDone);
      setRunning(false);
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  // Auto-pause when tab is hidden
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  function toggle() {
    setStarted(true);
    setRunning(r => !r);
  }

  function reset() {
    setRunning(false);
    setStarted(false);
    setPhase('work');
    setSecondsLeft(DURATIONS.work);
    setPomodorosDone(0);
    phaseRef.current = 'work';
    secondsRef.current = DURATIONS.work;
    pomodorosRef.current = 0;
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const isWork = phase === 'work';
  const phaseLabel = isWork ? 'Focus' : phase === 'longBreak' ? 'Long Break' : 'Break';
  const cycleProgress = pomodorosDone % 4;

  return (
    <div className="flex items-center gap-2">
      {/* Timer badge */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-colors ${
        !started
          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
          : isWork
          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
      }`}>
        <Timer className="w-3 h-3 flex-shrink-0" />
        <span>{mins}:{secs}</span>
        {started && (
          <span className="text-[9px] opacity-70 font-sans ml-0.5">{phaseLabel}</span>
        )}
      </div>

      {/* Play/Pause */}
      <button
        onClick={toggle}
        title={running ? 'Pause timer' : 'Start timer'}
        className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {running
          ? <Pause className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          : <Play className="w-3 h-3 text-gray-600 dark:text-gray-300" />}
      </button>

      {/* Reset */}
      <button
        onClick={reset}
        title="Reset timer"
        className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <RotateCcw className="w-3 h-3 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Cycle dots: 4 pomodoros = long break */}
      <div className="flex gap-0.5" title={`${cycleProgress}/4 pomodoros this cycle`}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i < cycleProgress ? 'bg-red-400' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
