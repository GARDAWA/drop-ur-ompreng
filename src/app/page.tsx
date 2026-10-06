'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { sound } from '@/game/audio/SoundEffects';
import { signInUser, signUpUser, signInAsGuest, getActiveSession } from '@/lib/supabase/auth';
import { getTopLeaderboard, LeaderboardEntry } from '@/lib/supabase/leaderboard';

export default function HomePage() {
  const router = useRouter();

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Room & Game States
  const [currentUsername, setCurrentUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameError, setGameError] = useState('');
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Leaderboard Modal State
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    getActiveSession().then((session) => {
      if (session) {
        setIsAuthenticated(true);
        setCurrentUsername(session.username);
        setUsername(session.username);
      }
    });
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    sound.playJump();

    try {
      if (authTab === 'signup') {
        const res = await signUpUser(username, password);
        if (!res.success) {
          setAuthError(res.error || 'Pendaftaran gagal');
          setIsAuthLoading(false);
          return;
        }
        setIsAuthenticated(true);
        setCurrentUsername(res.user?.username || username);
      } else {
        const res = await signInUser(username, password);
        if (!res.success) {
          setAuthError(res.error || 'Login gagal');
          setIsAuthLoading(false);
          return;
        }
        setIsAuthenticated(true);
        setCurrentUsername(res.user?.username || username);
      }
    } catch {
      setAuthError('Terjadi kesalahan koneksi autentikasi.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGuestPlay = async () => {
    setIsAuthLoading(true);
    sound.playJump();
    try {
      const res = await signInAsGuest();
      if (res.success && res.user) {
        setIsAuthenticated(true);
        setCurrentUsername(res.user.username);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('player_name');
    localStorage.removeItem('player_auth_id');
    sessionStorage.removeItem('player_name');
    sessionStorage.removeItem('player_auth_id');
    setIsAuthenticated(false);
    setCurrentUsername('');
    setPassword('');
  };

  const handleCreateRoom = async () => {
    sound.playJump();
    setIsGameLoading(true);
    setGameError('');
    try {
      const service = getMultiplayerService();
      const code = await service.createRoom(currentUsername);
      router.push(`/room/${code}/lobby`);
    } catch {
      setGameError('Gagal membuat room. Coba lagi.');
      setIsGameLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    sound.playJump();
    const raw = roomCode.trim();
    if (!raw) {
      setGameError('Masukkan Kode Room (contoh: MBG-123 atau ketik 123)!');
      return;
    }
    const formattedCode = /^\d{3,4}$/.test(raw) ? `MBG-${raw}` : raw.toUpperCase();

    if (!/^MBG-\d{3,4}$/.test(formattedCode)) {
      setGameError('Format kode salah! Contoh yang benar: MBG-123 (atau ketik 123 saja).');
      return;
    }

    setIsGameLoading(true);
    setGameError('');
    try {
      const service = getMultiplayerService();
      const success = await service.joinRoom(formattedCode, currentUsername);
      if (!success) {
        setGameError('Room tidak ditemukan atau balapan sudah dimulai!');
        setIsGameLoading(false);
        return;
      }
      router.push(`/room/${formattedCode}/lobby`);
    } catch {
      setGameError('Terjadi kesalahan saat memeriksa room. Coba lagi.');
      setIsGameLoading(false);
    }
  };

  const openLeaderboard = async () => {
    sound.playJump();
    setShowLeaderboard(true);
    const data = await getTopLeaderboard(10);
    setLeaderboardList(data);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden select-none">
      {/* Top action bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={openLeaderboard}
          className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition backdrop-blur flex items-center gap-1.5 cursor-pointer"
        >
          <span>🏆</span> Leaderboard
        </button>
        <button
          onClick={toggleSound}
          className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition backdrop-blur cursor-pointer"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Background glow effects */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -top-32 -left-32"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -bottom-32 -right-32"></div>

      <div className="max-w-md w-full bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10 relative">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 font-extrabold px-3.5 py-1.5 rounded-full text-xs mb-2.5 uppercase tracking-widest border border-amber-500/40 shadow-inner">
            <span className="text-sm">🚗</span> MULTIPLAYER RACE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 tracking-wider drop-shadow-md">
            DROP UR EMBEGE!
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Balap Pengantaran Makanan Bergizi Gratis (SPPG) ke Sekolah!
          </p>
        </div>

        {/* SCREEN 1: MANDATORY AUTHENTICATION IF NOT LOGGED IN */}
        {!isAuthenticated ? (
          <div>
            <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthTab('signin'); setAuthError(''); }}
                className={`flex-1 py-2 rounded-xl transition ${authTab === 'signin' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400'}`}
              >
                Masuk (Sign In)
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                className={`flex-1 py-2 rounded-xl transition ${authTab === 'signup' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400'}`}
              >
                Daftar (Sign Up)
              </button>
            </div>

            {authError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl mb-3.5 text-center font-semibold">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik username (min. 3 karakter)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Password (min. 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-[0.98] text-sm uppercase tracking-wider cursor-pointer mt-1"
              >
                {isAuthLoading ? 'Memproses...' : authTab === 'signin' ? 'MASUK KE GAME' : 'DAFTAR AKUN BARU'}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  Atau Main Cepat
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGuestPlay}
                disabled={isAuthLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition active:scale-[0.98] text-xs uppercase tracking-wider cursor-pointer"
              >
                🎭 Main Sebagai Tamu (Guest)
              </button>
            </form>
          </div>
        ) : (
          /* SCREEN 2: GAME LOBBY CREATION & JOINING (UNLOCKED AFTER AUTH) */
          <div>
            {/* Authenticated user badge */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👤</span>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Akun Terhubung</div>
                  <div className="text-xs font-black text-amber-400">{currentUsername}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-[11px] text-slate-400 hover:text-rose-400 font-bold px-2 py-1 rounded border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
              >
                Ganti Akun
              </button>
            </div>

            {gameError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl mb-3.5 text-center font-semibold">
                {gameError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleCreateRoom}
                disabled={isGameLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-[0.98] text-sm tracking-wider uppercase cursor-pointer"
              >
                {isGameLoading ? 'Membuat Room...' : '🚀 BIKIN ROOM BARU (HOST)'}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
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
                    setGameError('');
                  }}
                  className="flex-1 bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-3 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono font-bold text-sm"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={isGameLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black px-5 rounded-xl transition active:scale-95 shadow-lg shadow-indigo-600/30 uppercase text-xs sm:text-sm tracking-wider cursor-pointer"
                >
                  Gabung
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300 flex items-center gap-1">
            <span>🎮</span> Kontrol:
          </p>
          <p>• Lompat: <kbd className="bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-amber-300 font-bold font-mono">SPACE</kbd> / Tombol LOMPAT</p>
          <p>• Turbo: <kbd className="bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-amber-300 font-bold font-mono">SHIFT / S</kbd> / Tombol GAS POL</p>
        </div>
      </div>

      {/* Global Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl relative">
            <span className="text-4xl inline-block mb-1">🏆</span>
            <h3 className="text-xl font-black text-amber-400">LEADERBOARD TOP 10</h3>
            <p className="text-xs text-slate-400 mb-4">Catatan Waktu Tercepat Kurir MBG</p>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-5 text-left pr-1">
              {leaderboardList.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">Belum ada catatan waktu.</div>
              ) : (
                leaderboardList.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex justify-between items-center px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${idx === 0 ? 'text-amber-400 text-sm' : 'text-slate-400'}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-200">{entry.username}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{entry.best_time}s</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowLeaderboard(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
