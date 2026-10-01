'use client';

import React from 'react';
import { PlayerState } from '@/services/IMultiplayerService';

interface GameHUDProps {
  countdown: number | null;
  timeElapsed: number;
  progressRatio: number;
  playerSpeedKmh: number;
  playerName: string;
  isMuted: boolean;
  onToggleSound: () => void;
  players: PlayerState[];
  currentX: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  countdown,
  timeElapsed,
  progressRatio,
  playerSpeedKmh,
  playerName,
  isMuted,
  onToggleSound,
  players,
  currentX,
}) => {
  const distanceLeftMeters = Math.max(0, Math.round((5800 - currentX) / 10));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
      {/* Top Bar: Progress Track & Stats */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
        <div className="bg-slate-950/85 border border-slate-700/80 rounded-2xl p-3.5 backdrop-blur-md shadow-2xl">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2 px-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span>🏢</span> Dapur SPPG
            </span>
            <div className="flex items-center gap-3">
              <span className="bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-lg text-emerald-400 font-mono text-sm shadow">
                ⏱ {timeElapsed.toFixed(1)}s
              </span>
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                {distanceLeftMeters} m lagi
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span>🏫</span> SDN 01 Merdeka
            </span>
          </div>

          {/* Progress Bar with Mini-Track */}
          <div className="relative w-full h-4 bg-slate-900 border border-slate-700 rounded-full overflow-visible">
            {/* Fill Bar */}
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 rounded-full transition-all duration-75 shadow-lg"
              style={{ width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }}
            />
            {/* Local Player Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-base transition-all duration-75"
              style={{ left: `${Math.min(98, Math.max(2, progressRatio * 100))}%` }}
            >
              🛵
            </div>
          </div>
        </div>
      </div>

      {/* Center Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="self-center my-auto flex flex-col items-center">
          <div className="relative">
            <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-orange-500 drop-shadow-[0_15px_30px_rgba(245,158,11,0.6)] animate-ping">
              {countdown}
            </span>
          </div>
          <span className="text-lg sm:text-2xl font-black uppercase tracking-widest text-white mt-4 bg-slate-900/80 px-6 py-2 rounded-2xl border border-amber-500/40 backdrop-blur shadow-xl">
            SIAP-SIAP ANTAR MBG!
          </span>
        </div>
      )}

      {/* Bottom Controls & Speedometer */}
      <div className="flex justify-between items-end">
        {/* Speedometer */}
        <div className="bg-slate-950/85 border border-slate-700 px-4 py-2.5 rounded-2xl backdrop-blur shadow-xl flex items-center gap-3">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kecepatan</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {playerSpeedKmh} <span className="text-xs font-normal text-slate-300">km/h</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kurir</div>
            <div className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[120px]">
              {playerName}
            </div>
          </div>
        </div>

        {/* Instructions & Sound toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block bg-slate-950/80 border border-slate-700 px-3.5 py-2 rounded-xl text-xs text-slate-300 font-medium backdrop-blur">
            <kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">SPACE</kbd> / Klik Layar = Lompat
          </div>
          <button
            onClick={onToggleSound}
            className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 transition active:scale-95 shadow-lg backdrop-blur"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </div>
  );
};
