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
  startX?: number;
  finishX?: number;
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
  startX = 100,
  finishX = 14000,
  onBoostStart,
  onBoostEnd,
  onJump,
}) => {
  const totalTrackMeters = finishX - startX;
  const normalizedPercent = isFinished
    ? 100
    : Math.max(0, Math.min(100, ((currentX - startX) / totalTrackMeters) * 100));

  const distanceLeftMeters = isFinished
    ? 0
    : Math.max(0, Math.round(finishX - currentX));

  // Strictly filter out the local player by ID (or fallback to name only if localPlayerId is unavailable)
  const remotePlayers = players.filter((p) => {
    if (localPlayerId) {
      return p.id !== localPlayerId;
    }
    return p.name !== playerName;
  });

  // Live race participants sorted by position (furthest ahead first)
  const raceLeaderboard = [
    {
      id: localPlayerId || 'local',
      name: playerName || 'Kamu',
      x: isFinished ? finishX : currentX,
      percent: normalizedPercent,
      finished: isFinished,
      isLocal: true,
    },
    ...remotePlayers.map((p) => ({
      id: p.id,
      name: p.name,
      x: p.finished ? finishX : p.x,
      percent: p.finished
        ? 100
        : Math.max(0, Math.min(100, ((p.x - startX) / totalTrackMeters) * 100)),
      finished: p.finished,
      isLocal: false,
    })),
  ].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return b.x - a.x;
  });

  const medals = ['🥇', '🥈', '🥉', '4️⃣'];
  const remoteColors = [
    { bg: 'bg-cyan-400', text: 'text-cyan-950', border: 'border-cyan-200', arrow: 'border-b-cyan-400', dot: 'bg-cyan-400' },
    { bg: 'bg-fuchsia-400', text: 'text-fuchsia-950', border: 'border-fuchsia-200', arrow: 'border-b-fuchsia-400', dot: 'bg-fuchsia-400' },
    { bg: 'bg-emerald-400', text: 'text-emerald-950', border: 'border-emerald-200', arrow: 'border-b-emerald-400', dot: 'bg-emerald-400' },
    { bg: 'bg-sky-400', text: 'text-sky-950', border: 'border-sky-200', arrow: 'border-b-sky-400', dot: 'bg-sky-400' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-20 select-none">
      {/* Top HUD: Precise Multi-Player Progress Track */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-2">
        <div className="bg-slate-950/95 border border-amber-500/40 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.85)]">
          {/* Header Row */}
          <div className="flex justify-between items-center text-xs font-black text-slate-300 mb-1 px-1">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="text-base">🏢</span> DAPUR SPPG (0m)
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="bg-slate-900 border border-slate-700 px-2.5 sm:px-3 py-1 rounded-xl text-emerald-400 font-mono text-xs sm:text-sm shadow font-bold">
                ⏱ {timeElapsed.toFixed(1)}s
              </span>
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-mono font-bold">
                {isFinished ? 'SELESAI (0m)' : `${distanceLeftMeters.toLocaleString('id-ID')} m ke Sekolah`}
              </span>
              <span className="text-xs text-slate-300 font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                {normalizedPercent.toFixed(0)}%
              </span>
            </div>

            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              SDN 01 MERDEKA (14.000m) <span className="text-base">🏫</span>
            </span>
          </div>

          {/* Progress Track Container with upper/lower margin for non-colliding indicators */}
          <div className="relative w-full h-5 sm:h-6 bg-slate-900 border border-slate-700/90 rounded-full px-1 flex items-center shadow-inner overflow-visible my-7 sm:my-8">
            {/* Distance milestones on track */}
            <div className="absolute left-1/4 top-1 bottom-1 w-px bg-slate-700/50" />
            <div className="absolute left-1/2 top-0.5 bottom-0.5 w-0.5 bg-slate-600/70" />
            <div className="absolute left-3/4 top-1 bottom-1 w-px bg-slate-700/50" />

            {/* Fill Bar for Local Player */}
            <div
              className="h-3 sm:h-3.5 bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 rounded-full transition-[width] duration-100 ease-linear shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${normalizedPercent}%` }}
            />

            {/* Local Player Marker (UPPER TIER: Perched strictly ABOVE the track with DOWN arrow) */}
            <div
              className="absolute -top-7 -translate-x-1/2 flex flex-col items-center z-30 pointer-events-none transition-[left] duration-100 ease-linear"
              style={{ left: `${Math.min(97, Math.max(3, normalizedPercent))}%` }}
            >
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-[0_3px_10px_rgba(245,158,11,0.6)] border border-amber-200 tracking-wider whitespace-nowrap animate-bounce">
                <span>🚗</span>
                <span>KAMU</span>
              </div>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-amber-400 -mt-0.5"></div>
            </div>

            {/* Local Player Track Dot Indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 border-2 border-slate-950 rounded-full z-25 shadow-[0_0_8px_rgba(251,191,36,0.9)] pointer-events-none transition-[left] duration-100 ease-linear"
              style={{ left: `${Math.min(97, Math.max(3, normalizedPercent))}%` }}
            />

            {/* Remote Players Markers (LOWER TIER: Perched strictly BELOW the track with UP arrow) */}
            {remotePlayers.map((p, idx) => {
              const remotePercent = p.finished
                ? 100
                : Math.max(0, Math.min(100, ((p.x - startX) / totalTrackMeters) * 100));
              const styleColor = remoteColors[idx % remoteColors.length];

              return (
                <React.Fragment key={p.id}>
                  {/* Remote Dot on Track */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 ${styleColor.dot} border-2 border-slate-950 rounded-full z-20 shadow pointer-events-none transition-[left] duration-100 ease-linear`}
                    style={{ left: `${Math.min(97, Math.max(3, remotePercent))}%` }}
                  />

                  {/* Remote Pin Label Below */}
                  <div
                    title={`${p.name} (${Math.round(p.x)}m)`}
                    className="absolute -bottom-6.5 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none transition-[left] duration-100 ease-linear"
                    style={{ left: `${Math.min(97, Math.max(3, remotePercent))}%` }}
                  >
                    <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] ${styleColor.arrow} -mb-0.5`}></div>
                    <div className={`flex items-center gap-1 ${styleColor.bg} ${styleColor.text} font-black text-[9px] px-2 py-0.5 rounded-full shadow-md border ${styleColor.border} whitespace-nowrap`}>
                      <span>🚗</span>
                      <span className="truncate max-w-[65px]">{p.name}</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Finish Line Flag */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-sm z-10 flex items-center justify-center filter drop-shadow">
              🏁
            </div>
          </div>

          {/* Multiplayer Live Leaderboard Widget */}
          {remotePlayers.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span>⚡</span> Posisi Balapan:
              </span>
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                {raceLeaderboard.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${
                      item.isLocal
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{medals[idx] || `${idx + 1}.`}</span>
                    <span className="truncate max-w-[75px]">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.finished ? 'FINISH' : `${Math.round(item.x)}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          {/* Jump Button (Touch & Mobile Friendly) */}
          {!isFinished && onJump && (
            <button
              onClick={onJump}
              title="Lompat hindari rintangan (SPACE / ▲)"
              className="pointer-events-auto px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-xl backdrop-blur cursor-pointer flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/80 shadow-indigo-600/30"
            >
              <span>🦘</span> LOMPAT!
            </button>
          )}

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
