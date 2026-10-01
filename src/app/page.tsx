'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Masukkan nama kamu terlebih dahulu!');
      return;
    }
    const service = getMultiplayerService();
    const code = await service.createRoom(name.trim());
    sessionStorage.setItem('player_name', name.trim());
    router.push(`/room/${code}/lobby`);
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Masukkan nama kamu terlebih dahulu!');
      return;
    }
    if (!roomCode.trim()) {
      setError('Masukkan Room Code!');
      return;
    }
    const code = roomCode.trim().toUpperCase();
    const service = getMultiplayerService();
    await service.joinRoom(code, name.trim());
    sessionStorage.setItem('player_name', name.trim());
    router.push(`/room/${code}/lobby`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <div className="text-center mb-6">
          <div className="inline-block bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full text-xs mb-2 uppercase tracking-widest border border-amber-500/40">
            2D Arcade Racing
          </div>
          <h1 className="text-4xl font-black text-amber-400 tracking-wider">DROP UR EMBEGE!</h1>
          <p className="text-sm text-slate-400 mt-2">
            Antar Makanan Bergizi Gratis dari SPPG ke Sekolah secepat mungkin!
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nama Kurir
            </label>
            <input
              type="text"
              placeholder="Contoh: Kurir Budi"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition active:scale-[0.98]"
          >
            🚀 Bikin Room Baru
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase">Atau Gabung</span>
            <div className="flex-grow border-t border-slate-700"></div>
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
              className="flex-1 bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:border-amber-400 transition"
            />
            <button
              onClick={handleJoin}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 rounded-xl transition"
            >
              Gabung
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/60 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">💡 Kontrol Bermain:</p>
          <p>• Kendaraan melaju otomatis (Auto-run).</p>
          <p>• Tekan <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">Space</kbd> untuk lompat melewati rintangan.</p>
          <p>• Tekan <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">A / D</kbd> untuk atur jarak aman.</p>
        </div>
      </div>
    </main>
  );
}
