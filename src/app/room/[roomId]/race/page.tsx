'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { sound } from '@/game/audio/SoundEffects';

export default function RacePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [countdown, setCountdown] = useState<number | null>(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progressRatio, setProgressRatio] = useState(0);
  const [currentX, setCurrentX] = useState(100);
  const [playerSpeedKmh, setPlayerSpeedKmh] = useState(45);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [obstacleWarning, setObstacleWarning] = useState<string | null>(null);

  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<PixiSceneRenderer | null>(null);
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map());
  const inputRef = useRef({ left: false, right: false });
  const hasFinishedRef = useRef(false);
  const countdownDoneRef = useRef(false);

  const playerName =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('player_name') || 'Kurir MBG'
      : 'Kurir MBG';

  const triggerJump = useCallback(() => {
    if (gameLoopRef.current && gameLoopRef.current.isRunning && gameLoopRef.current.player.isGrounded) {
      sound.playJump();
      gameLoopRef.current.player.jump();
    }
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
  };

  useEffect(() => {
    const service = getMultiplayerService();

    // Pastikan service tersambung ke room ini
    if (!service.getLocalPlayerId() || service.getCurrentRoomId() !== roomId) {
      service.joinRoom(roomId, playerName);
    }

    const unsubList = service.onPlayerListUpdate((list) => {
      setPlayers(list);
    });

    const unsubPos = service.onPlayerPositionUpdate((id, x, y) => {
      let remote = remotePlayersRef.current.get(id);
      if (!remote) {
        remote = new RemotePlayer({ id, name: 'Kurir Lain', startX: x, groundY: 400 });
        remotePlayersRef.current.set(id, remote);
      }
      remote.setTargetPosition(x, y);

      // Keep player list position updated for mini-track
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x, y } : p))
      );
    });

    const unsubFinish = service.onPlayerFinish((id, time) => {
      if (hasFinishedRef.current) {
        setShowResult(true);
      }
    });

    // When replay is broadcasted by any player, navigate back to lobby simultaneously
    const unsubReplay = service.onReplay(() => {
      router.push(`/room/${roomId}/lobby`);
    });

    // Countdown sequence (3.. 2.. 1.. GO!)
    sound.playCountdown(false);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        sound.playCountdown(true);
        countdownDoneRef.current = true;
        if (gameLoopRef.current && !gameLoopRef.current.isRunning) {
          gameLoopRef.current.start();
        }
      } else {
        setCountdown(count);
        sound.playCountdown(false);
      }
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerJump();
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
      unsubList();
      unsubPos();
      unsubFinish();
      unsubReplay();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      rendererRef.current?.destroy();
    };
  }, [roomId, router, triggerJump, playerName]);

  const handleGameReady = useCallback((game: GameApp) => {
    if (!game.app) return;

    const gameLoop = new GameLoop({
      onTick: (x, ratio, time, hitType) => {
        setTimeElapsed(time);
        setProgressRatio(ratio);
        setCurrentX(x);

        // Sound effect based on hit obstacle
        if (hitType) {
          switch (hitType) {
            case 'chicken':
              sound.playChicken();
              break;
            case 'speedbump':
              sound.playBump();
              break;
            case 'crate':
              sound.playWoodBreak();
              break;
            case 'puddle':
              sound.playPuddle();
              break;
            case 'cart':
            case 'rock':
              sound.playHit();
              break;
          }
        }

        // Check if an obstacle is within 320px ahead for HUD warning
        const upcoming = gameLoop.level.obstacles.find(
          (obs) => !obs.isTriggered && obs.x > x && obs.x - x < 320
        );
        if (upcoming) {
          const warningLabels: Record<string, string> = {
            cart: 'AWAS GEROBAK BAKSO!',
            chicken: 'AWAS AYAM NYEBRANG!',
            speedbump: 'AWAS POLISI TIDUR!',
            crate: 'AWAS PETI KAYU!',
            puddle: 'AWAS KUBANGAN AIR!',
            rock: 'AWAS PEMBATAS JALAN!',
          };
          setObstacleWarning(warningLabels[upcoming.type] || 'AWAS RINTANGAN DEPAN!');
        } else {
          setObstacleWarning(null);
        }

        // Speed calculation in km/h
        const currentSpeed =
          (gameLoop.player.baseSpeed +
            (inputRef.current.right ? 40 : inputRef.current.left ? -40 : 0)) *
          gameLoop.player.speedModifier;
        setPlayerSpeedKmh(Math.round(currentSpeed * 0.16));

        // Network sync
        getMultiplayerService().broadcastPosition(x, gameLoop.player.y);
      },
      onFinish: (time) => {
        hasFinishedRef.current = true;
        getMultiplayerService().broadcastFinish(time);
        setTimeout(() => {
          setShowResult(true);
        }, 1200);
      },
    });

    gameLoopRef.current = gameLoop;

    // Jika countdown selesai sebelum renderer siap, langsung start gameLoop
    if (countdownDoneRef.current && !gameLoop.isRunning) {
      gameLoop.start();
    }

    const renderer = new PixiSceneRenderer(game.app, gameLoop);
    rendererRef.current = renderer;

    let lastTime = performance.now();
    game.app.ticker.add(() => {
      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
      gameLoop.update(delta, inputRef.current, viewportWidth);

      for (const remote of remotePlayersRef.current.values()) {
        remote.update(delta);
      }

      renderer.render(remotePlayersRef.current);
    });
  }, []);

  const handlePlayAgain = () => {
    // Broadcast replay to all tabs in the room
    getMultiplayerService().broadcastReplay();
    router.push(`/room/${roomId}/lobby`);
  };

  const handleExit = () => {
    getMultiplayerService().leaveRoom();
    router.push('/');
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      <CanvasView onGameReady={handleGameReady} onCanvasClick={triggerJump} />
      <GameHUD
        countdown={countdown}
        timeElapsed={timeElapsed}
        progressRatio={progressRatio}
        currentX={currentX}
        playerSpeedKmh={playerSpeedKmh}
        playerName={playerName}
        isMuted={isMuted}
        onToggleSound={toggleSound}
        players={players}
        approachingObstacleWarning={obstacleWarning}
      />
      {showResult && (
        <ResultModal
          players={players}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}
    </main>
  );
}
