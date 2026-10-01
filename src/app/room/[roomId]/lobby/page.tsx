'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { PlayerState } from '@/services/IMultiplayerService';

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const service = getMultiplayerService();

    service.onPlayerListUpdate((list) => {
      setPlayers(list);
    });

    service.onMatchStart(() => {
      router.push(`/room/${roomId}/race`);
    });
  }, [roomId, router]);

  const toggleReady = () => {
    const next = !isReady;
    setIsReady(next);
    getMultiplayerService().setReady(next);
  };

  const startRace = () => {
    getMultiplayerService().startMatch();
  };

  const copyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const playerName = typeof window !== 'undefined' ? sessionStorage.getItem('player_name') : '';
  const isHost = players.find((p) => p.isHost)?.name === playerName;
  const allReady = players.length >= 1 && players.every((p) => p.isReady);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-amber-400">LOBBY BALAPAN</h1>
            <p className="text-xs text-slate-400">Tunggu semua kurir siap sebelum berangkat</p>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition"
          >
            <span>{roomId}</span>
            <span>{copied ? '✅' : '📋'}</span>
          </button>
        </div>

        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-700/60 mb-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Kurir Terdaftar ({players.length}/4)
          </div>
          {players.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-slate-800/60 px-4 py-2.5 rounded-lg border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🛵</span>
                <span className="font-bold text-sm text-slate-200">{p.name}</span>
                {p.isHost && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/40">
                    HOST
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded ${
                  p.isReady
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {p.isReady ? 'READY' : 'MENUNGGU'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleReady}
            className={`flex-1 py-3.5 rounded-xl font-extrabold transition ${
              isReady
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isReady ? 'Batalkan Ready' : 'Siap! (Ready)'}
          </button>

          {isHost && (
            <button
              onClick={startRace}
              disabled={!allReady}
              className={`flex-1 py-3.5 rounded-xl font-extrabold transition ${
                allReady
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              Mulai Balapan! 🏁
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
