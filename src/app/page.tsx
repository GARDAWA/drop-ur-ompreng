'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { sound } from '@/game/audio/SoundEffects';
import { signInAsGuest } from '@/lib/supabase/auth';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState<string>('Guest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('player_name') || sessionStorage.getItem('player_name');
      if (storedName) {
        setName(storedName);
        setAuthStatus(`Tersimpan: ${storedName}`);
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
  };

  const authenticatePlayer = async (): Promise<string> => {
    const finalName = name.trim() || `Kurir-${Math.floor(100 + Math.random() * 900)}`;
    setIsSubmitting(true);
    const authRes = await signInAsGuest(finalName, password.trim());
    setIsSubmitting(false);

    if (!authRes.success && authRes.error) {
      setError(`Gagal autentikasi: ${authRes.error}`);
      throw new Error(authRes.error);
    }

    sessionStorage.setItem('player_name', finalName);
    setAuthStatus(`Login: ${finalName}`);
    return finalName;
  };

  const handleCreate = async () => {
    sound.playJump();
    try {
      const finalName = await authenticatePlayer();
      const service = getMultiplayerService();
      const code = await service.createRoom(finalName);
      router.push(`/room/${code}/lobby`);
    } catch {
      if (!error) setError('Gagal membuat room. Coba lagi.');
    }
  };

  const handleJoin = async () => {
    sound.playJump();
    const raw = roomCode.trim();
    if (!raw) {
      setError('Masukkan Kode Room (contoh: MBG-123 atau cukup ketik 123)!');
      return;
    }
    const formattedCode = /^\d{3,4}$/.test(raw) ? `MBG-${raw}` : raw.toUpperCase();

    if (!/^MBG-\d{3,4}$/.test(formattedCode)) {
      setError('Format kode salah! Contoh kode yang benar: MBG-123 (atau ketik 123 saja).');
      return;
    }

    try {
      const finalName = await authenticatePlayer();
      const service = getMultiplayerService();
      const success = await service.joinRoom(formattedCode, finalName);
      if (!success) {
        setError('Gagal bergabung ke room. Pastikan kode room benar dan coba lagi.');
        return;
      }
      router.push(`/room/${formattedCode}/lobby`);
    } catch {
      if (!error) setError('Terjadi kesalahan saat bergabung ke room. Coba lagi.');
    }
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 font-extrabold px-3.5 py-1.5 rounded-full text-xs mb-3 uppercase tracking-widest border border-amber-500/40 shadow-inner">
            <span className="text-sm">⚡</span> {authStatus}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 tracking-wider drop-shadow-md">
            DROP UR EMBEGE!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
            Lomba Balap Antar Truk Satuan Pelayanan Pemenuhan Gizi (SPPG)!
          </p>
        </div>

        {/* Visual Preview Truk SPPG Resmi */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 mb-5 flex items-center gap-3">
          <img
            src="/assets/images/car.png"
            alt="Truk MBG SPPG"
            className="w-20 h-14 object-contain rounded-lg bg-slate-900/50 p-1 border border-slate-700/60 shadow"
          />
          <div className="text-xs">
            <div className="font-bold text-emerald-400">Truk Resmi MBG SPPG</div>
            <div className="text-[11px] text-slate-400">Siap meluncur antar nutrisi gratis ke sekolah!</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl mb-4 text-center font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Username Kurir / Pemain
            </label>
            <input
              type="text"
              placeholder="Username kurir (opsional)"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              PIN / Password (Guest Auth)
            </label>
            <input
              type="password"
              placeholder="Password kurir (opsional, min. 6 karakter)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono text-sm"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-[0.98] text-base tracking-wider uppercase cursor-pointer"
          >
            {isSubmitting ? 'MEMPROSES...' : '🚀 BIKIN ROOM BARU (HOST)'}
          </button>

          <div className="relative flex py-1 items-center">
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
              className="flex-1 bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-3 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono font-bold"
            />
            <button
              onClick={handleJoin}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-6 rounded-xl transition active:scale-95 shadow-lg shadow-indigo-600/30 uppercase text-sm tracking-wider cursor-pointer"
            >
              Gabung
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <span>🎮</span> Cara Main & Kontrol:
          </p>
          <p>• Mobil MBG otomatis melaju cepat (*Auto-run*).</p>
          <p>• Tekan <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-bold font-mono">SPACE</kbd> / <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-bold font-mono">▲</kbd> atau <strong>Klik Layar</strong> untuk lompat!</p>
          <p>• Tekan <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-300 font-bold font-mono">A / D</kbd> untuk manuver maju / rem sejenak.</p>
        </div>
      </div>
    </main>
  );
}
