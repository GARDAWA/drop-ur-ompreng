'use client';

import React from 'react';
import { PlayerState } from '@/services/IMultiplayerService';

interface GameHUDProps {
  countdown: number | null;
  timeElapsed: number;
  progressRatio: number;
  currentX: number;
  playerSpeedKmh: number;
  playerName: string;
  isMuted: boolean;
  onToggleSound: () => void;
  onTogglePause?: () => void;
  players: PlayerState[];
  approachingObstacleWarning?: string | null;
  isFinished?: boolean;
  localPlayerId?: string;
  nitroGauge?: number;
  isBoosting?: boolean;
  shieldTimer?: number;
  onBoostStart?: () => void;
  onBoostEnd?: () => void;
  onJump?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  countdown,
  timeElapsed,
  progressRatio,
  currentX,
  playerSpeedKmh,
  playerName,
  isMuted,
  onToggleSound,
  onTogglePause,
  players,
  approachingObstacleWarning,
  isFinished = false,
  localPlayerId,
  nitroGauge = 50,
  isBoosting = false,
  shieldTimer = 0,
  onBoostStart,
  onBoostEnd,
  onJump,
}) => {
  // Start is at 100, Finish is at 5800
  const normalizedPercent = isFinished
    ? 100
    : Math.max(0, Math.min(100, ((currentX - 100) / 5700) * 100));
  const distanceLeftMeters = isFinished
    ? 0
    : Math.max(0, Math.round((5800 - currentX) / 10));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20 select-none">
      {/* Top HUD: Precise Multi-Player Progress Track */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
        <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {/* Header Row */}
          <div className="flex justify-between items-center text-xs font-black text-slate-300 mb-2 px-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="text-base">🏢</span> DAPUR SPPG (0m)
            </span>

            <div className="flex items-center gap-3">
              <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl text-emerald-400 font-mono text-sm shadow font-bold">
                ⏱ {timeElapsed.toFixed(1)}s
              </span>
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl text-xs font-mono font-bold">
                {isFinished ? 'SELESAI (0m)' : `${distanceLeftMeters} m ke Sekolah`}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {normalizedPercent.toFixed(0)}%
              </span>
            </div>

            <span className="flex items-center gap-1.5 text-rose-400">
              SDN 01 MERDEKA <span className="text-base">🏫</span>
            </span>
          </div>

          {/* Progress Track Container */}
          <div className="relative w-full h-5 bg-slate-900 border border-slate-700/80 rounded-full px-1 flex items-center shadow-inner">
            {/* 50% Midpoint Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700/80 z-0">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 font-bold">
                50%
              </span>
            </div>

            {/* Fill Bar for Local Player */}
            <div
              className="h-3 bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 rounded-full transition-all duration-75 shadow-lg"
              style={{ width: `${normalizedPercent}%` }}
            />

            {/* Remote Players Markers */}
            {players
              .filter((p) => (localPlayerId ? p.id !== localPlayerId : p.name !== playerName))
              .map((p) => {
                const remotePercent = p.finished
                  ? 100
                  : Math.max(0, Math.min(100, ((p.x - 100) / 5700) * 100));
                return (
                  <div
                    key={p.id}
                    title={p.name}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-100"
                    style={{ left: `${Math.min(97, Math.max(3, remotePercent))}%` }}
                  >
                    <span className="text-xs">🛵</span>
                    <span className="text-[8px] bg-blue-600/90 text-white font-bold px-1 rounded truncate max-w-[45px] -mt-1 shadow">
                      {p.name}
                    </span>
                  </div>
                );
              })}

            {/* Local Player Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-20 transition-all duration-75"
              style={{ left: `${Math.min(97, Math.max(3, normalizedPercent))}%` }}
            >
              <span className="text-sm drop-shadow-md animate-bounce">🛵</span>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full shadow-md -mt-1">
                KAMU
              </span>
            </div>

            {/* Finish Line Flag */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-sm z-10">
              🏁
            </div>
          </div>
        </div>

        {/* Celebratory finish banner */}
        {isFinished && (
          <div className="self-center bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 text-slate-950 px-6 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xl animate-bounce flex items-center gap-2 border border-amber-300">
            <span>🏆</span> BALAPAN SELESAI! MBG TELAH SAMPAI DI SEKOLAH! 🏁
          </div>
        )}

        {/* Shield active banner */}
        {!isFinished && shieldTimer > 0 && (
          <div className="self-center bg-cyan-950/90 text-cyan-300 border border-cyan-400/80 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-pulse flex items-center gap-1.5 backdrop-blur">
            <span>🛡️</span> PERISAI KEBAL AKTIF: {shieldTimer.toFixed(1)}s (ANTI RINTANGAN!)
          </div>
        )}

        {/* Warning notification banner if approaching high obstacle */}
        {!isFinished && approachingObstacleWarning && (
          <div className="self-center bg-rose-600/90 text-white border border-rose-400/80 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg animate-pulse flex items-center gap-1.5">
            <span>⚠️</span> {approachingObstacleWarning}
          </div>
        )}
      </div>

      {/* Center Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <div className="self-center my-auto flex flex-col items-center">
          <div className="relative">
            <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-400 to-amber-500 drop-shadow-[0_15px_30px_rgba(245,158,11,0.6)] animate-ping">
              {countdown}
            </span>
          </div>
          <span className="text-lg sm:text-2xl font-black uppercase tracking-widest text-white mt-4 bg-slate-900/90 px-7 py-2.5 rounded-2xl border border-amber-500/40 backdrop-blur-md shadow-2xl">
            SIAP-SIAP ANTAR MBG!
          </span>
        </div>
      )}

      {/* Bottom Controls & Speedometer */}
      <div className="flex justify-between items-end gap-3">
        {/* Speedometer & Nitro Cockpit */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-950/90 border border-slate-700/80 px-4 py-3 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-3.5">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kecepatan</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                {isFinished ? 0 : playerSpeedKmh} <span className="text-xs font-normal text-slate-300">km/h</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kurir</div>
              <div className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[110px]">
                {playerName}
              </div>
            </div>
          </div>

          {/* Nitro Energy Dashboard */}
          <div className={`bg-slate-950/90 border ${isBoosting ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]' : 'border-slate-700/80'} px-3.5 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col gap-1 transition-all`}>
            <div className="flex justify-between items-center gap-4 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1 text-orange-400">
                🔥 GAS POL (NITRO)
              </span>
              <span className={`font-mono font-bold ${nitroGauge > 20 ? 'text-amber-300' : 'text-slate-500'}`}>
                {Math.round(nitroGauge)}%
              </span>
            </div>
            <div className="w-28 sm:w-36 h-3 bg-slate-900 border border-slate-700 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isBoosting
                    ? 'bg-gradient-to-r from-orange-500 via-amber-300 to-rose-500 animate-pulse'
                    : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, nitroGauge))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Instructions & Interactive Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Dedicated Gas Pol Boost Button */}
          {!isFinished && (
            <button
              onMouseDown={onBoostStart}
              onMouseUp={onBoostEnd}
              onTouchStart={(e) => { e.preventDefault(); onBoostStart?.(); }}
              onTouchEnd={(e) => { e.preventDefault(); onBoostEnd?.(); }}
              disabled={nitroGauge < 1}
              title="Tekan dan tahan untuk Gas Pol Nitro (Shift / S)"
              className={`pointer-events-auto px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-xl backdrop-blur cursor-pointer flex items-center gap-1.5 ${
                isBoosting
                  ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white border border-amber-300 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse'
                  : nitroGauge > 10
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border border-amber-400 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
              }`}
            >
              <span>🔥</span> GAS POL!
            </button>
          )}

          <div className="hidden lg:block bg-slate-950/85 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs text-slate-300 font-medium backdrop-blur shadow">
            <kbd className="bg-slate-800 border border-slate-700 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">SPACE</kbd> = Lompat • <kbd className="bg-slate-800 border border-slate-700 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">SHIFT / S</kbd> = Gas Pol
          </div>

          {onTogglePause && !isFinished && (
            <button
              onClick={onTogglePause}
              title="Pause Permainan (ESC)"
              className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-200 transition active:scale-95 shadow-xl backdrop-blur cursor-pointer"
            >
              ⏸️
            </button>
          )}

          <button
            onClick={onToggleSound}
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
            className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl text-xs font-bold text-slate-200 transition active:scale-95 shadow-xl backdrop-blur cursor-pointer"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </div>
  );
};
