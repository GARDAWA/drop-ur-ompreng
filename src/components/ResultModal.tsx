'use client';

import React from 'react';
import { PlayerState } from '@/services/IMultiplayerService';

interface ResultModalProps {
  players: PlayerState[];
  onPlayAgain: () => void;
  onExit: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  players,
  onPlayAgain,
  onExit,
}) => {
  const sorted = [...players].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return (a.finishTime ?? 999999) - (b.finishTime ?? 999999);
  });

  const medals = ['🥇', '🥈', '🥉', '🛵'];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
        <span className="text-5xl">🎉</span>
        <h2 className="text-3xl font-black text-amber-400 mt-3">MBG BERHASIL DI-DROP!</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">Hasil Balapan Pengantaran Sekolah</p>

        <div className="space-y-2.5 mb-8">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
                idx === 0
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-900/60 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{medals[idx] || '🛵'}</span>
                <span className="font-semibold text-sm">{p.name}</span>
              </div>
              <span className="font-mono text-xs">
                {p.finished && p.finishTime ? `${p.finishTime.toFixed(2)}s` : 'DNF'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onExit}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
          >
            Keluar
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg transition"
          >
            Balapan Lagi! 🔄
          </button>
        </div>
      </div>
    </div>
  );
};
