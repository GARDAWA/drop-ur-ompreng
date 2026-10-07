'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PlayerState } from '@/services/IMultiplayerService';
import { sound } from '@/game/audio/SoundEffects';
import { getTopLeaderboard, LeaderboardEntry } from '@/lib/supabase/leaderboard';

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
  const [globalRank, setGlobalRank] = useState<LeaderboardEntry[]>([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [showGlobal, setShowGlobal] = useState(false);

  const fetchGlobal = useCallback(async () => {
    setIsLoadingGlobal(true);
    try {
      const data = await getTopLeaderboard(5);
      setGlobalRank(data);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobal();
  }, [fetchGlobal]);

  const handleTabChange = (isGlobal: boolean) => {
    sound.playJump();
    setShowGlobal(isGlobal);
    if (isGlobal && globalRank.length === 0) {
      fetchGlobal();
    }
  };

  const sorted = [...players].sort((a, b) => {
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return (a.finishTime ?? 999999) - (b.finishTime ?? 999999);
  });

  const medals = ['🥇', '🥈', '🥉', '🚗'];
  const rankNames = ['JUARA 1', 'JUARA 2', 'JUARA 3', 'KURIR 4'];

  const handlePlayAgain = () => {
    sound.playJump();
    onPlayAgain();
  };

  const handleExit = () => {
    sound.playJump();
    onExit();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow accent */}
        <div className="absolute w-48 h-48 bg-amber-500/20 rounded-full blur-3xl -top-16 left-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <span className="text-5xl sm:text-6xl animate-bounce inline-block">🏆</span>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 mt-2">
            MBG BERHASIL DI-DROP!
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-5 font-medium">
            Makanan Bergizi Gratis telah sampai ke siswa SDN 01 Merdeka!
          </p>

          {/* Toggle Tab */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-4 text-xs font-bold">
            <button
              onClick={() => handleTabChange(false)}
              className={`flex-1 py-1.5 rounded-lg transition ${!showGlobal ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Hasil Match Ini
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-1.5 rounded-lg transition ${showGlobal ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Top 5 Global 🌐
            </button>
          </div>

          {!showGlobal ? (
            <div className="space-y-2.5 mb-6">
              {sorted.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center px-4 py-3 rounded-2xl border transition ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 border-amber-500/60 shadow-lg text-amber-200'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{medals[idx] || '🚗'}</span>
                    <div className="text-left">
                      <div className="font-extrabold text-sm">{p.name}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {rankNames[idx] || `POSISI ${idx + 1}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs sm:text-sm font-bold bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-700">
                      {p.finished && p.finishTime ? `${p.finishTime.toFixed(2)}s` : 'Masih Balap ⏳'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {isLoadingGlobal ? (
                <div className="text-xs text-slate-400 py-4 flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block">⏳</span> Memuat leaderboard Supabase...
                </div>
              ) : globalRank.length === 0 ? (
                <div className="text-xs text-slate-400 py-4">Belum ada catatan waktu balap.</div>
              ) : (
                globalRank.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex justify-between items-center px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">#{idx + 1}</span>
                      <span className="font-bold text-slate-200">{entry.username}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{entry.best_time.toFixed(2)}s</span>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleExit}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-3.5 rounded-xl transition active:scale-95 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              Menu Utama
            </button>
            <button
              onClick={handlePlayAgain}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/30 transition active:scale-95 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              Balap Lagi! 🔄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
