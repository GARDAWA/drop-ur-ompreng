'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { PlayerState } from '@/services/IMultiplayerService';
import { sound } from '@/game/audio/SoundEffects';

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [isReady, setIsReady] = useState(true);
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem('player_name') || `Kurir-${Math.floor(100 + Math.random() * 900)}`;
    setPlayerName(storedName);
    sessionStorage.setItem('player_name', storedName);

    const service = getMultiplayerService();

    service.onPlayerListUpdate((list) => {
      setPlayers(list);
    });

    service.onMatchStart(() => {
      sound.playCountdown(true);
      router.push(`/room/${roomId}/race`);
    });
  }, [roomId, router]);

  const toggleReady = () => {
    sound.playJump();
    const next = !isReady;
    setIsReady(next);
    getMultiplayerService().setReady(next);
  };

  const startRace = () => {
    sound.playCountdown(true);
    getMultiplayerService().startMatch();
  };

  const copyCode = () => {
    sound.playJump();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
  };

  // Find if current user is host
  const myPlayer = players.find((p) => p.name === playerName);
  const isHost = myPlayer ? myPlayer.isHost : true; // default to true if alone
  const allReady = players.length >= 1 && players.every((p) => p.isReady);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative">
      {/* Sound toggle floating button */}
      <button
        onClick={toggleSound}
        className="absolute top-6 right-6 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-sm font-bold shadow-lg transition backdrop-blur"
      >
        {isMuted ? '🔇 Audio Mati' : '🔊 Audio Aktif'}
      </button>

      <div className="max-w-lg w-full bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🛵</span>
              <h1 className="text-2xl font-black text-amber-400 tracking-wider">LOBBY BALAPAN</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Dapur SPPG ➔ SDN 01 Merdeka</p>
          </div>
          <button
            onClick={copyCode}
            title="Klik untuk salin kode room"
            className="flex items-center gap-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-indigo-300 transition active:scale-95"
          >
            <span>{roomId}</span>
            <span>{copied ? '✅ Tersalin!' : '📋 Salin'}</span>
          </button>
        </div>

        {/* Kurir list card */}
        <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Kurir Siap Antar ({players.length}/4)
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ● Room Online
            </span>
          </div>

          <div className="space-y-2.5">
            {players.length === 0 ? (
              <div className="flex justify-between items-center bg-slate-800/40 px-4 py-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🛵</span>
                  <span className="font-bold text-sm text-slate-200">{playerName || 'Kamu'}</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/40">
                    HOST
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  READY
                </span>
              </div>
            ) : (
              players.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center bg-slate-800/40 px-4 py-3 rounded-xl border border-slate-800 transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🛵</span>
                    <span className="font-bold text-sm text-slate-200">
                      {p.name} {p.name === playerName ? '(Kamu)' : ''}
                    </span>
                    {p.isHost && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/40">
                        HOST
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-lg ${
                      p.isReady
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {p.isReady ? 'SIAP!' : 'MENUNGGU'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={toggleReady}
            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition active:scale-[0.98] shadow-lg ${
              isReady
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isReady ? 'Batalkan Ready' : 'Siap Berangkat! ✅'}
          </button>

          {isHost && (
            <button
              onClick={startRace}
              disabled={!allReady}
              className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition active:scale-[0.98] shadow-lg ${
                allReady
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              {players.length <= 1 ? 'Mulai Solo (Latihan) 🏁' : 'Mulai Balapan! 🏁'}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Tip: Buka tab baru di browser untuk mencoba 2–4 kurir balapan bersama secara realtime!
        </p>
      </div>
    </main>
  );
}
