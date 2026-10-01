'use client';

import React from 'react';

interface GameHUDProps {
  countdown: number | null;
  timeElapsed: number;
  progressRatio: number;
  playerName: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  countdown,
  timeElapsed,
  progressRatio,
  playerName,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Top Progress Bar */}
      <div className="w-full max-w-2xl mx-auto bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3 backdrop-blur shadow-xl">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5 px-1">
          <span>📍 Dapur SPPG</span>
          <span className="text-amber-400 font-mono text-sm">
            ⏱ {(timeElapsed).toFixed(1)}s
          </span>
          <span>🏫 Gerbang Sekolah</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-75 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }}
          />
        </div>
      </div>

      {/* Center Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="self-center my-auto flex flex-col items-center animate-bounce">
          <span className="text-8xl font-black text-amber-400 drop-shadow-[0_10px_20px_rgba(251,191,36,0.5)]">
            {countdown}
          </span>
          <span className="text-xl font-bold uppercase tracking-widest text-slate-300 mt-2">
            Persiapan Berangkat!
          </span>
        </div>
      )}

      {/* Bottom Info Tag */}
      <div className="flex justify-between items-end text-xs text-slate-400">
        <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 shadow">
          Kurir: <strong className="text-amber-400">{playerName}</strong>
        </div>
        <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 shadow">
          [SPACE] Lompat | [A/D] Koreksi Posisi
        </div>
      </div>
    </div>
  );
};
