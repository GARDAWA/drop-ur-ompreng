'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { PlayerState } from '@/services/IMultiplayerService';
import { sound } from '@/game/audio/SoundEffects';

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const rawRoomId = params.roomId as string;
  const roomId = useMemo(() => (rawRoomId ? rawRoomId.toUpperCase() : 'MBG-100'), [rawRoomId]);

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const storedName =
      sessionStorage.getItem('player_name') ||
      `Kurir-${Math.floor(100 + Math.random() * 900)}`;
    setPlayerName(storedName);
    sessionStorage.setItem('player_name', storedName);

    const service = getMultiplayerService();

    // Pastikan terhubung ke room ini
    if (!service.getLocalPlayerId() || service.getCurrentRoomId() !== roomId) {
      service.joinRoom(roomId, storedName);
    }

    const localId = service.getLocalPlayerId();

    const unsubList = service.onPlayerListUpdate((list) => {
      setPlayers(list);
      const me = list.find((p) => p.id === localId) || list.find((p) => p.name === storedName);
      if (me !== undefined) {
        setIsReady(me.isReady);
      }
    });

    const unsubStart = service.onMatchStart(() => {
      sound.playCountdown(true);
      router.push(`/room/${roomId}/race`);
    });

    return () => {
      unsubList();
      unsubStart();
    };
  }, [roomId, router]);

  const toggleReady = () => {
    sound.playJump();
    const next = !isReady;
    setIsReady(next);
    getMultiplayerService().setReady(next);
  };

  const startRace = () => {
    if (isStarting) return;
    setIsStarting(true);
    sound.playCountdown(true);

    const service = getMultiplayerService();
    // Auto-set ready for the host when starting
    service.setReady(true);
    service.startMatch();

    // Host navigates immediately to race
    router.push(`/room/${roomId}/race`);
  };

  const copyCode = () => {
    sound.playJump();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    sound.playJump();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
  };

  const handleLeaveRoom = () => {
    sound.playJump();
    getMultiplayerService().leaveRoom();
    router.push('/');
  };

  // Identifikasi player lokal dan hak host
  const service = getMultiplayerService();
  const localId = service.getLocalPlayerId();
  const myPlayer =
    players.find((p) => p.id === localId) || players.find((p) => p.name === playerName);

  // Jika bermain sendiri di room, player otomatis bertindak sebagai Host
  const isHost =
    players.length <= 1 ||
    Boolean(myPlayer?.isHost) ||
    (typeof window !== 'undefined' && sessionStorage.getItem(`is_host_${roomId}`) === 'true');

  const readyCount = players.filter((p) => p.isReady).length;
  const allOthersReady = players.length > 1 && players.every((p) => p.id === localId || p.isReady);
  const isSolo = players.length <= 1;

  // Solo selalu bisa langsung mulai! Di multiplayer butuh kurir lain siap
  const canStart = isSolo || allOthersReady || readyCount === players.length;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative select-none">
      {/* Top action buttons */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <button
          onClick={handleLeaveRoom}
          className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition backdrop-blur cursor-pointer text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <span>←</span> Menu Utama
        </button>
      </div>

      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition backdrop-blur cursor-pointer z-20"
      >
        {isMuted ? '🔇 Audio Mati' : '🔊 Audio Aktif'}
      </button>

      <div className="max-w-lg w-full bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🛵</span>
              <h1 className="text-2xl font-black text-amber-400 tracking-wider">LOBBY BALAPAN</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Dapur SPPG ➔ SDN 01 Merdeka (14.000m)</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              title="Klik untuk salin kode room"
              className="flex items-center gap-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 px-3 py-2 rounded-xl text-xs font-mono font-bold text-indigo-300 transition active:scale-95 cursor-pointer shadow"
            >
              <span>{roomId}</span>
              <span>{copied ? '✅ Disalin!' : '📋 Salin Kode'}</span>
            </button>
            <button
              onClick={copyLink}
              title="Salin link room untuk teman"
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 transition active:scale-95 cursor-pointer"
            >
              🔗 Link
            </button>
          </div>
        </div>

        {/* Kurir list card */}
        <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Kurir Terdaftar ({Math.max(1, players.length)}/4)
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online Supabase
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
                  SIAP
                </span>
              </div>
            ) : (
              players.map((p) => {
                const isMe = p.id === localId || p.name === playerName;
                return (
                  <div
                    key={p.id}
                    className={`flex justify-between items-center px-4 py-3 rounded-xl border transition ${
                      isMe
                        ? 'bg-indigo-950/40 border-indigo-500/40'
                        : 'bg-slate-800/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🛵</span>
                      <span className="font-bold text-sm text-slate-200">
                        {p.name} {isMe ? '(Kamu)' : ''}
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
                      {p.isReady ? 'SIAP! ✅' : 'MENUNGGU ⏳'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Ready Button */}
          <button
            id="lobby-ready-btn"
            onClick={toggleReady}
            className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition active:scale-[0.98] shadow-lg cursor-pointer ${
              isReady
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isReady ? 'Batalkan Ready ⏳' : 'Siap Berangkat! ✅'}
          </button>

          {/* Start Button (Host only or Solo) */}
          {isHost && (
            <button
              id="lobby-start-btn"
              onClick={startRace}
              disabled={!canStart || isStarting}
              className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition active:scale-[0.98] shadow-lg ${
                canStart
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              {isStarting
                ? 'Memulai Balapan...'
                : isSolo
                ? 'Mulai Solo (Latihan) 🏁'
                : canStart
                ? 'Mulai Balapan! 🏁'
                : `Tunggu Siap (${readyCount}/${players.length}) ⏳`}
            </button>
          )}
        </div>

        {/* Online Info Tip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-1.5">
          <p className="text-xs font-semibold text-slate-300">
            {isSolo
              ? '💡 Kamu sendirian di room. Klik "Mulai Solo (Latihan)" kapan saja untuk langsung balapan!'
              : '👥 Mabar Online Aktif! Bagikan kode room ke temanmu untuk balap bersama.'}
          </p>
          <p className="text-[11px] text-slate-400">
            Kompatibel untuk mabar via HP Android/iOS maupun PC/Laptop secara bersamaan.
          </p>
        </div>
      </div>
    </main>
  );
}
