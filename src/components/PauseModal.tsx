'use client';

import React from 'react';
import { sound } from '@/game/audio/SoundEffects';

interface PauseModalProps {
  onResume: () => void;
  onExitLobby: () => void;
  onExitHome: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onExitLobby,
  onExitHome,
  isMuted,
  onToggleSound,
}) => {
  const handleResume = () => {
    sound.playJump();
    onResume();
  };

  const handleLobby = () => {
    sound.playJump();
    onExitLobby();
  };

  const handleHome = () => {
    sound.playJump();
    onExitHome();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn select-none">
      <div className="max-w-sm w-full bg-slate-900/95 border border-indigo-500/40 rounded-3xl p-7 text-center shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl -top-12 left-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <span className="text-5xl inline-block mb-2">⏸️</span>
          <h2 className="text-2xl font-black text-amber-400 tracking-wider">
            BALAPAN DI-PAUSE
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Tekan <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">ESC</kbd> untuk melanjutkan
          </p>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleResume}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 text-sm uppercase tracking-wider cursor-pointer"
            >
              ▶️ Lanjut Balapan
            </button>

            <button
              onClick={onToggleSound}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isMuted ? '🔇 Audio: Mati' : '🔊 Audio: Aktif'}</span>
            </button>

            <button
              onClick={handleLobby}
              className="w-full bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
            >
              🏁 Kembali ke Lobby
            </button>

            <button
              onClick={handleHome}
              className="w-full bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-3 px-4 rounded-xl transition active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
            >
              🏠 Keluar ke Menu Utama
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
