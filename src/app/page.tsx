'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { sound } from '@/game/audio/SoundEffects';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
  };

  const handleCreate = async () => {
    sound.playJump();
    const finalName = name.trim() || `Kurir-${Math.floor(100 + Math.random() * 900)}`;
    const service = getMultiplayerService();
    const code = await service.createRoom(finalName);
    sessionStorage.setItem('player_name', finalName);
    router.push(`/room/${code}/lobby`);
  };

  const handleJoin = async () => {
    sound.playJump();
    if (!roomCode.trim()) {
      setError('Masukkan Room Code (contoh: MBG-123)!');
      return;
    }
    const finalName = name.trim() || `Kurir-${Math.floor(100 + Math.random() * 900)}`;
    const code = roomCode.trim().toUpperCase();
    const service = getMultiplayerService();
    await service.joinRoom(code, finalName);
    sessionStorage.setItem('player_name', finalName);
    router.push(`/room/${code}/lobby`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      {/* Sound toggle button */}
      <button
        onClick={toggleSound}
        className="absolute top-6 right-6 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-sm font-bold shadow-lg transition backdrop-blur z-20"
      >
        {isMuted ? '🔇 Audio Mati' : '🔊 Audio Aktif'}
      </button>

      {/* Background glowing decorations */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -top-32 -left-32"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -bottom-32 -right-32"></div>

      <div className="max-w-md w-full bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10 relative">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 font-extrabold px-3.5 py-1.5 rounded-full text-xs mb-3 uppercase tracking-widest border border-amber-500/40 shadow-inner">
            <span className="animate-spin text-sm">🛵</span> 2D MULTIPLAYER ARCADE
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 tracking-wider drop-shadow-md">
            DROP UR EMBEGE!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
            Lomba Balap Antar Makanan Bergizi Gratis (MBG) dari Dapur SPPG Menuju Sekolah!
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl mb-4 text-center font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Kurir Kamu
            </label>
            <input
              type="text"
              placeholder="Ketik namamu (opsional, ada default)"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-medium"
            />
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-[0.98] text-base tracking-wider uppercase cursor-pointer"
          >
            🚀 BIKIN ROOM BARU (HOST)
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">
              Atau Gabung Room
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Kode: MBG-123"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value);
                setError('');
              }}
              className="flex-1 bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3.5 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono font-bold"
            />
            <button
              onClick={handleJoin}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 rounded-xl transition active:scale-95 shadow-lg shadow-indigo-600/30 uppercase text-sm tracking-wider cursor-pointer"
            >
              Gabung
            </button>
          </div>
        </div>

        <div className="mt-7 pt-5 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <span>🎮</span> Cara Main & Kontrol:
          </p>
          <p>• Motor otomatis melaju cepat (*Auto-run*).</p>
          <p>• Tekan <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-bold font-mono">SPACE</kbd> / <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-bold font-mono">▲</kbd> atau <strong>Klik Layar</strong> untuk lompat!</p>
          <p>• Tekan <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-bold font-mono">A / D</kbd> untuk manuver maju / rem sejenak.</p>
        </div>
      </div>
    </main>
  );
}
