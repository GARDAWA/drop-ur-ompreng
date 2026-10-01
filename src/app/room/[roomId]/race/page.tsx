'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CanvasView } from '@/components/CanvasView';
import { GameHUD } from '@/components/GameHUD';
import { ResultModal } from '@/components/ResultModal';
import { GameApp } from '@/game/core/GameApp';
import { GameLoop } from '@/game/core/GameLoop';
import { RemotePlayer } from '@/game/entities/RemotePlayer';
import { PixiSceneRenderer } from '@/game/renderer/PixiSceneRenderer';
import { getMultiplayerService } from '@/services/multiplayerSingleton';
import { PlayerState } from '@/services/IMultiplayerService';

export default function RacePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [countdown, setCountdown] = useState<number | null>(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progressRatio, setProgressRatio] = useState(0);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [showResult, setShowResult] = useState(false);

  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<PixiSceneRenderer | null>(null);
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map());
  const inputRef = useRef({ left: false, right: false });

  const playerName =
    typeof window !== 'undefined' ? sessionStorage.getItem('player_name') || 'Kurir' : 'Kurir';

  useEffect(() => {
    const service = getMultiplayerService();

    service.onPlayerListUpdate((list) => {
      setPlayers(list);
    });

    service.onPlayerPositionUpdate((id, x, y) => {
      let remote = remotePlayersRef.current.get(id);
      if (!remote) {
        remote = new RemotePlayer({ id, name: 'Pemain', startX: x, groundY: 400 });
        remotePlayersRef.current.set(id, remote);
      }
      remote.setTargetPosition(x, y);
    });

    service.onPlayerFinish((id, time) => {
      // Result updated
      setShowResult(true);
    });

    // Countdown sequence (3.. 2.. 1.. GO!)
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        gameLoopRef.current?.start();
      } else {
        setCountdown(count);
      }
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        gameLoopRef.current?.player.jump();
      }
      if (e.code === 'KeyA' || e.key === 'ArrowLeft') inputRef.current.left = true;
      if (e.code === 'KeyD' || e.key === 'ArrowRight') inputRef.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.key === 'ArrowLeft') inputRef.current.left = false;
      if (e.code === 'KeyD' || e.key === 'ArrowRight') inputRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      rendererRef.current?.destroy();
    };
  }, []);

  const handleGameReady = (game: GameApp) => {
    if (!game.app) return;

    const gameLoop = new GameLoop({
      onTick: (x, ratio, time) => {
        setTimeElapsed(time);
        setProgressRatio(ratio);
        getMultiplayerService().broadcastPosition(x, gameLoop.player.y);
      },
      onFinish: (time) => {
        getMultiplayerService().broadcastFinish(time);
        setShowResult(true);
      },
    });

    gameLoopRef.current = gameLoop;
    const renderer = new PixiSceneRenderer(game.app, gameLoop);
    rendererRef.current = renderer;

    let lastTime = performance.now();
    game.app.ticker.add(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
      gameLoop.update(delta, inputRef.current, viewportWidth);

      for (const remote of remotePlayersRef.current.values()) {
        remote.update(delta);
      }

      renderer.render(remotePlayersRef.current);
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <CanvasView onGameReady={handleGameReady} />
      <GameHUD
        countdown={countdown}
        timeElapsed={timeElapsed}
        progressRatio={progressRatio}
        playerName={playerName}
      />
      {showResult && (
        <ResultModal
          players={players}
          onPlayAgain={() => router.push(`/room/${roomId}/lobby`)}
          onExit={() => router.push('/')}
        />
      )}
    </main>
  );
}
