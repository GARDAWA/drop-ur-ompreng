'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CanvasView } from '@/components/CanvasView';
import { GameHUD } from '@/components/GameHUD';
import { ResultModal } from '@/components/ResultModal';
import { PauseModal } from '@/components/PauseModal';
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
  const rawRoomId = params.roomId as string;
  const roomId = rawRoomId ? rawRoomId.toUpperCase() : 'MBG-100';

  const [countdown, setCountdown] = useState<number | null>(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progressRatio, setProgressRatio] = useState(0);
  const [currentX, setCurrentX] = useState(100);
  const [playerSpeedKmh, setPlayerSpeedKmh] = useState(45);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [obstacleWarning, setObstacleWarning] = useState<string | null>(null);
  const [nitroGauge, setNitroGauge] = useState(50);
  const [isBoosting, setIsBoosting] = useState(false);
  const [shieldTimer, setShieldTimer] = useState(0);

  const [playerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('player_name') || 'Kurir MBG';
    }
    return 'Kurir MBG';
  });

  const [localPlayerId, setLocalPlayerId] = useState<string>(() =>
    getMultiplayerService().getLocalPlayerId()
  );

  const gameLoopRef = useRef<GameLoop | null>(null);
  const rendererRef = useRef<PixiSceneRenderer | null>(null);
  const gameAppRef = useRef<GameApp | null>(null);
  const tickerCallbackRef = useRef<(() => void) | null>(null);
  const isPausedRef = useRef(false);
  const remotePlayersRef = useRef<Map<string, RemotePlayer>>(new Map());
  const inputRef = useRef({ left: false, right: false, boost: false });
  const hasFinishedRef = useRef(false);
  const countdownDoneRef = useRef(false);
  const lastPosUpdateRef = useRef(0);

  const triggerJump = useCallback(() => {
    if (
      gameLoopRef.current &&
      gameLoopRef.current.isRunning &&
      !gameLoopRef.current.isFinished
    ) {
      sound.playJump();
      gameLoopRef.current.player.jump();
    }
  }, []);

  const handleBoostStart = useCallback(() => {
    if (!inputRef.current.boost && gameLoopRef.current && gameLoopRef.current.player.nitroGauge > 10) {
      sound.playBoostStart();
    }
    inputRef.current.boost = true;
  }, []);

  const handleBoostEnd = useCallback(() => {
    inputRef.current.boost = false;
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const togglePause = useCallback(() => {
    if (hasFinishedRef.current || !countdownDoneRef.current) return;
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      if (next) {
        sound.pauseBgm();
      } else {
        sound.playBgm();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const service = getMultiplayerService();

    // Pastikan service tersambung ke room ini
    if (!service.getLocalPlayerId() || service.getCurrentRoomId() !== roomId) {
      service.joinRoom(roomId, playerName);
    }

    const unsubList = service.onPlayerListUpdate((list) => {
      setPlayers(list);
      const myId = service.getLocalPlayerId();
      if (myId) setLocalPlayerId(myId);
    });

    const unsubPos = service.onPlayerPositionUpdate((id, x, y, name) => {
      let remote = remotePlayersRef.current.get(id);
      if (!remote) {
        remote = new RemotePlayer({ id, name: name || 'Kurir Lain', startX: x, groundY: 400 });
        remotePlayersRef.current.set(id, remote);
      } else if (name && (remote.name === 'Kurir Lain' || remote.name === 'Kurir MBG')) {
        remote.name = name;
      }
      remote.setTargetPosition(x, y);

      // Throttle React state updates to ~30 FPS for buttery smooth progress bar without render chokes
      const now = performance.now();
      if (!lastPosUpdateRef.current || now - lastPosUpdateRef.current > 33) {
        lastPosUpdateRef.current = now;
        setPlayers((prev) => {
          const existingIndex = prev.findIndex((p) => p.id === id);
          if (existingIndex >= 0) {
            const next = [...prev];
            next[existingIndex] = {
              ...next[existingIndex],
              x,
              y,
              name: name || next[existingIndex].name,
            };
            return next;
          }
          return [
            ...prev,
            {
              id,
              name: name || 'Kurir Lain',
              isHost: false,
              isReady: true,
              x,
              y,
              finished: false,
            },
          ];
        });
      }
    });

    // Ketika salah satu kurir di room finish, catat status finished pemain tersebut
    const unsubFinish = service.onPlayerFinish((id, time) => {
      setPlayers((prev) => {
        const next = prev.map((p) =>
          p.id === id ? { ...p, finished: true, finishTime: time, x: 14000 } : p
        );
        // Only set match finished if ALL players in room have finished
        const allDone = next.length > 0 && next.every((p) => p.finished);
        if (allDone) {
          setIsMatchFinished(true);
        }
        return next;
      });

      // If local player finished too or match fully done, show result podium
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
        sound.playBgm();
        if (gameLoopRef.current && !gameLoopRef.current.isRunning) {
          gameLoopRef.current.start();
        }
      } else {
        setCountdown(count);
        sound.playCountdown(false);
      }
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
        return;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerJump();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyS' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!inputRef.current.boost && gameLoopRef.current && gameLoopRef.current.player.nitroGauge > 10) {
          sound.playBoostStart();
        }
        inputRef.current.boost = true;
      }
      if (e.code === 'KeyA' || e.key === 'ArrowLeft') inputRef.current.left = true;
      if (e.code === 'KeyD' || e.key === 'ArrowRight') inputRef.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyS' || e.key === 'ArrowDown') {
        inputRef.current.boost = false;
      }
      if (e.code === 'KeyA' || e.key === 'ArrowLeft') inputRef.current.left = false;
      if (e.code === 'KeyD' || e.key === 'ArrowRight') inputRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      sound.stopBgm();
      clearInterval(interval);
      unsubList();
      unsubPos();
      unsubFinish();
      unsubReplay();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameAppRef.current?.app?.ticker && tickerCallbackRef.current) {
        gameAppRef.current.app.ticker.remove(tickerCallbackRef.current);
      }
      rendererRef.current?.destroy();
    };
  }, [roomId, router, triggerJump, playerName, togglePause]);

  const handleGameReady = useCallback((game: GameApp) => {
    if (!game.app) return;
    gameAppRef.current = game;

    const gameLoop = new GameLoop({
      onTick: (x, ratio, time, hitType) => {
        setTimeElapsed(time);
        setProgressRatio(ratio);
        setCurrentX(x);
        setNitroGauge(gameLoop.player.nitroGauge);
        setIsBoosting(gameLoop.player.isBoosting);
        setShieldTimer(gameLoop.player.shieldTimer);

        // Sound effect & VFX based on hit obstacle
        if (hitType) {
          if (gameLoop.player.shieldTimer > 0) {
            sound.playPickupShield();
            rendererRef.current?.spawnFloatingText('🛡️ BLOCKED!', '#38bdf8', x + 32, gameLoop.player.y - 40);
          } else {
            rendererRef.current?.spawnHitVfx(hitType, x, gameLoop.player.y);
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

        // Speed calculation in km/h with nitro boost multiplier
        const currentSpeed =
          (gameLoop.player.baseSpeed +
            (inputRef.current.right ? 40 : inputRef.current.left ? -40 : 0)) *
          gameLoop.player.speedModifier *
          (gameLoop.player.isBoosting ? 1.75 : 1.0);
        setPlayerSpeedKmh(Math.round(currentSpeed * 0.16));

        // Network sync
        getMultiplayerService().broadcastPosition(x, gameLoop.player.y);
      },
      onPickup: (type) => {
        rendererRef.current?.spawnPickupVfx(type, gameLoop.player.x, gameLoop.player.y);
        if (type === 'milk') {
          sound.playPickupMilk();
          rendererRef.current?.spawnFloatingText('🥛 +25 NITRO!', '#38bdf8', gameLoop.player.x + 32, gameLoop.player.y - 45);
        } else if (type === 'fruit') {
          sound.playPickupShield();
          rendererRef.current?.spawnFloatingText('🛡️ PERISAI KEBAL!', '#10b981', gameLoop.player.x + 32, gameLoop.player.y - 45);
        } else if (type === 'bento') {
          sound.playPickupShield();
          sound.playBoostStart();
          rendererRef.current?.spawnFloatingText('🍱 OMPRENG EMAS! 100% NITRO!', '#facc15', gameLoop.player.x + 32, gameLoop.player.y - 45);
        }
      },
      onNearMiss: () => {
        sound.playNearMiss();
        rendererRef.current?.spawnFloatingText('⚡ DEKAT BAHAYA! +15 NITRO', '#f59e0b', gameLoop.player.x + 32, gameLoop.player.y - 55);
      },
      onFinish: (time) => {
        hasFinishedRef.current = true;
        setPlayerSpeedKmh(0);
        sound.playWin();
        const myId = getMultiplayerService().getLocalPlayerId();
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === myId || p.name === playerName
              ? { ...p, finished: true, finishTime: time, x: 14000 }
              : p
          )
        );
        getMultiplayerService().broadcastFinish(time);

        // Submit to global Supabase leaderboard
        import('@/lib/supabase/leaderboard').then(({ submitScore }) => {
          const authId = typeof window !== 'undefined' ? sessionStorage.getItem('player_auth_id') : undefined;
          submitScore(playerName, time, authId || undefined).catch(() => {});
        });

        // Check if all players in room have finished
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
    const tickerCallback = () => {
      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (!isPausedRef.current) {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
        gameLoop.update(delta, inputRef.current, viewportWidth);

        for (const remote of remotePlayersRef.current.values()) {
          remote.update(delta);
        }
      }

      renderer.render(remotePlayersRef.current, delta);
    };

    game.app.ticker.add(tickerCallback);
    tickerCallbackRef.current = tickerCallback;
  }, [playerName]);

  const handlePlayAgain = () => {
    // Broadcast replay to all tabs in the room
    getMultiplayerService().broadcastReplay();
    router.push(`/room/${roomId}/lobby`);
  };

  const handleExit = () => {
    getMultiplayerService().leaveRoom();
    router.push('/');
  };

  const handleResume = () => {
    inputRef.current = { left: false, right: false, boost: false };
    setIsPaused(false);
    isPausedRef.current = false;
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
        onTogglePause={togglePause}
        players={players}
        approachingObstacleWarning={obstacleWarning}
        isFinished={isMatchFinished}
        localPlayerId={localPlayerId || getMultiplayerService().getLocalPlayerId()}
        startX={100}
        finishX={14000}
        nitroGauge={nitroGauge}
        isBoosting={isBoosting}
        shieldTimer={shieldTimer}
        onBoostStart={handleBoostStart}
        onBoostEnd={handleBoostEnd}
        onJump={triggerJump}
      />
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onExitLobby={handlePlayAgain}
          onExitHome={handleExit}
          isMuted={isMuted}
          onToggleSound={toggleSound}
        />
      )}
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
